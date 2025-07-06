// [safeguard] Deployment Configuration
// Production deployment setup and configuration management

import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config();

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  port: number;
  host: string;
  cors: {
    origin: string[];
    credentials: boolean;
  };
  database: {
    url: string;
    pool: {
      min: number;
      max: number;
    };
  };
  redis: {
    url: string;
    ttl: number;
  };
  security: {
    jwtSecret: string;
    bcryptRounds: number;
    sessionSecret: string;
    cookieSecure: boolean;
  };
  logging: {
    level: string;
    file: string;
    maxSize: number;
    maxFiles: number;
  };
  monitoring: {
    enabled: boolean;
    endpoint: string;
    interval: number;
  };
  fileUpload: {
    maxSize: number;
    allowedTypes: string[];
    storagePath: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

class DeploymentConfigService {
  private config: DeploymentConfig;

  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  private loadConfig(): DeploymentConfig {
    const environment = (process.env.NODE_ENV || 'development') as 'development' | 'staging' | 'production';
    
    return {
      environment,
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || 'localhost',
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true
      },
      database: {
        url: process.env.DATABASE_URL || 'mongodb://localhost:27017/vision-holder',
        pool: {
          min: parseInt(process.env.DB_POOL_MIN || '2', 10),
          max: parseInt(process.env.DB_POOL_MAX || '10', 10)
        }
      },
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        ttl: parseInt(process.env.REDIS_TTL || '3600', 10)
      },
      security: {
        jwtSecret: process.env.JWT_SECRET || this.generateSecret(),
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
        sessionSecret: process.env.SESSION_SECRET || this.generateSecret(),
        cookieSecure: environment === 'production'
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || path.join(process.cwd(), 'logs', 'app.log'),
        maxSize: parseInt(process.env.LOG_MAX_SIZE || '10485760', 10), // 10MB
        maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10)
      },
      monitoring: {
        enabled: process.env.MONITORING_ENABLED === 'true',
        endpoint: process.env.MONITORING_ENDPOINT || '/metrics',
        interval: parseInt(process.env.MONITORING_INTERVAL || '30000', 10) // 30 seconds
      },
      fileUpload: {
        maxSize: parseInt(process.env.FILE_MAX_SIZE || '10485760', 10), // 10MB
        allowedTypes: process.env.FILE_ALLOWED_TYPES?.split(',') || [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'text/plain',
          'application/json'
        ],
        storagePath: process.env.FILE_STORAGE_PATH || path.join(process.cwd(), 'uploads')
      },
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
      }
    };
  }

  private generateSecret(): string {
    return require('crypto').randomBytes(64).toString('hex');
  }

  private validateConfig(): void {
    const errors: string[] = [];

    // Validate required environment variables for production
    if (this.config.environment === 'production') {
      if (!process.env['JWT_SECRET']) {
        errors.push('JWT_SECRET is required in production');
      }
      if (!process.env['SESSION_SECRET']) {
        errors.push('SESSION_SECRET is required in production');
      }
      if (!process.env['DATABASE_URL']) {
        errors.push('DATABASE_URL is required in production');
      }
      if (!process.env['ALLOWED_ORIGINS']) {
        errors.push('ALLOWED_ORIGINS is required in production');
      }
    }

    // Validate port
    if (this.config.port < 1 || this.config.port > 65535) {
      errors.push('Invalid port number');
    }

    // Validate database URL
    if (!this.config.database.url) {
      errors.push('Database URL is required');
    }

    // Validate file upload settings
    if (this.config.fileUpload.maxSize <= 0) {
      errors.push('File max size must be positive');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
  }

  public getConfig(): DeploymentConfig {
    return this.config;
  }

  public isProduction(): boolean {
    return this.config.environment === 'production';
  }

  public isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  public isStaging(): boolean {
    return this.config.environment === 'staging';
  }

  // Generate Docker configuration
  public generateDockerConfig(): string {
    return `# Dockerfile for Vision Holder API
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
`;
  }

  // Generate Docker Compose configuration
  public generateDockerComposeConfig(): string {
    return `version: '3.8'

services:
  vision-holder-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongo:27017/vision-holder
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=\${JWT_SECRET}
      - SESSION_SECRET=\${SESSION_SECRET}
      - ALLOWED_ORIGINS=\${ALLOWED_ORIGINS}
    depends_on:
      - mongo
      - redis
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    restart: unless-stopped

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=vision-holder
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - vision-holder-api
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
`;
  }

  // Generate Nginx configuration
  public generateNginxConfig(): string {
    return `events {
    worker_connections 1024;
}

http {
    upstream vision_holder_api {
        server vision-holder-api:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=upload:10m rate=1r/s;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

    server {
        listen 80;
        server_name localhost;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name localhost;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # File upload size
        client_max_body_size 10M;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://vision_holder_api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Upload routes (stricter rate limiting)
        location /api/upload {
            limit_req zone=upload burst=5 nodelay;
            
            proxy_pass http://vision_holder_api;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            access_log off;
            proxy_pass http://vision_holder_api;
        }

        # Static files
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }
    }
}
`;
  }

  // Generate PM2 configuration
  public generatePM2Config(): string {
    return `module.exports = {
  apps: [{
    name: 'vision-holder-api',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
`;
  }

  // Generate Kubernetes deployment
  public generateKubernetesConfig(): string {
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: vision-holder-api
  labels:
    app: vision-holder-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vision-holder-api
  template:
    metadata:
      labels:
        app: vision-holder-api
    spec:
      containers:
      - name: vision-holder-api
        image: vision-holder-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: vision-holder-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: vision-holder-secrets
              key: jwt-secret
        - name: SESSION_SECRET
          valueFrom:
            secretKeyRef:
              name: vision-holder-secrets
              key: session-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: logs
          mountPath: /app/logs
        - name: uploads
          mountPath: /app/uploads
      volumes:
      - name: logs
        emptyDir: {}
      - name: uploads
        persistentVolumeClaim:
          claimName: vision-holder-uploads-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: vision-holder-api-service
spec:
  selector:
    app: vision-holder-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: vision-holder-uploads-pvc
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 10Gi
`;
  }
}

// Create singleton instance
export const deploymentConfig = new DeploymentConfigService();

// Export for use in other modules
export default deploymentConfig; 