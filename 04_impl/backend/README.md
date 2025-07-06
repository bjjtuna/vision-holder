# Vision Holder Backend Services

This directory contains the backend APIs for the Vision Holder system, implementing the Systemic Ledger and AI Orchestrator according to the Build Journal Protocol.

## Services Overview

### 1. Systemic Ledger API (Port 3001)
- **Purpose**: Append-only event log for all project activities
- **Features**: CRUD operations for ledger entries, validation, alignment checking
- **Contract**: Based on `/03_contract/[clarify]-system-architecture-schema.md`

### 2. AI Orchestrator API (Port 3002)
- **Purpose**: Context engineering and wisdom memory management
- **Features**: Context generation, wisdom storage, user preferences, alignment checks
- **Contract**: Based on `/03_contract/[clarify]-system-architecture-schema.md`

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- TypeScript knowledge

### Installation

1. **Navigate to backend directory**:
   ```bash
   cd 04_impl/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start both services**:
   ```bash
   ./start-services.sh
   ```

   Or start individually:
   ```bash
   # Terminal 1 - Systemic Ledger API
   npm run dev
   
   # Terminal 2 - AI Orchestrator API (in different directory)
   npx ts-node-dev --respawn --transpile-only [accelerate]-ai-orchestrator-api.ts
   ```

## API Documentation

### Systemic Ledger API (http://localhost:3001)

#### POST /ledger/entries
Create a new ledger entry.

**Request Body:**
```json
{
  "purpose_tag": "[clarify]",
  "level": "saga",
  "seek": "implement",
  "why": "To create the core functionality",
  "content": {
    "title": "Core Implementation",
    "description": "Build the main features"
  },
  "status": "proposed"
}
```

**Response:**
```json
{
  "message": "Entry created successfully",
  "entry": {
    "id": "uuid",
    "timestamp": "2024-12-19T...",
    "purpose_tag": "[clarify]",
    "level": "saga",
    "seek": "implement",
    "why": "To create the core functionality",
    "content": {...},
    "status": "proposed"
  }
}
```

#### GET /ledger/entries
Retrieve ledger entries with optional filtering.

**Query Parameters:**
- `level`: mission, pillar, epic, saga, probe
- `purpose_tag`: [clarify], [accelerate], [safeguard], [monetize], [empathize], [delight]
- `status`: proposed, active, blocked, integrated, archived, dormant
- `startDate`: ISO date string
- `endDate`: ISO date string

#### PUT /ledger/entries/{id}/status
Update entry status.

**Request Body:**
```json
{
  "status": "active"
}
```

#### GET /ledger/roadmap
Get organized roadmap data by level.

**Response:**
```json
{
  "mission": [...],
  "pillar": [...],
  "epic": [...],
  "saga": [...],
  "probe": [...]
}
```

### AI Orchestrator API (http://localhost:3002)

#### POST /orchestrator/context
Generate minimal context prompt for builder AIs.

**Request Body:**
```json
{
  "task": "Create a user interface component",
  "builderType": "code",
  "mission": {...},
  "pillars": [...]
}
```

**Response:**
```json
{
  "minimal_context": "Task: Create a user interface component...",
  "alignment_check": true,
  "wisdom_injected": [...],
  "builder_instructions": "Please provide clean, well-documented code..."
}
```

#### POST /orchestrator/wisdom
Store new wisdom insight.

**Request Body:**
```json
{
  "insight": "User prefers visual feedback over text-heavy interfaces",
  "context_triggers": ["ui", "interface", "design"],
  "user_preference": {
    "visual_preference": true
  }
}
```

#### PUT /orchestrator/preferences
Update user preferences.

**Request Body:**
```json
{
  "communication_style": "visual",
  "detail_level": "medium",
  "learning_pace": "moderate"
}
```

#### GET /orchestrator/summary
Generate summary report.

**Response:**
```json
{
  "user_preferences": {...},
  "top_wisdom_insights": [...],
  "total_insights": 5,
  "generated_at": "2024-12-19T..."
}
```

## Validation Rules

### Purpose Tags
Must be one of: `[clarify]`, `[accelerate]`, `[safeguard]`, `[monetize]`, `[empathize]`, `[delight]`

### Levels
Must be one of: `mission`, `pillar`, `epic`, `saga`, `probe`

### Status Values
Must be one of: `proposed`, `active`, `blocked`, `integrated`, `archived`, `dormant`

### Builder Types
Must be one of: `code`, `design`, `planning`, `analysis`

## Development

### Scripts
```bash
# Development mode with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### File Structure
```
backend/
├── [accelerate]-systemic-ledger-api.ts    # Systemic Ledger API
├── [accelerate]-ai-orchestrator-api.ts    # AI Orchestrator API
├── package.json                           # Dependencies and scripts
├── tsconfig.json                          # TypeScript configuration
├── start-services.sh                      # Startup script
└── README.md                              # This file
```

### Default Data
Both APIs are pre-populated with:
- **Mission**: Project initialization mission from BUILD_JOURNAL.md
- **Pillars**: All five pillars (Canon-Layer Separation, Purpose-Tag Mandate, etc.)
- **Wisdom**: Default insights about user preferences

## Testing

### Health Checks
```bash
# Systemic Ledger API
curl http://localhost:3001/health

# AI Orchestrator API
curl http://localhost:3002/health
```

### Sample Requests
```bash
# Get all ledger entries
curl http://localhost:3001/ledger/entries

# Get roadmap data
curl http://localhost:3001/ledger/roadmap

# Get wisdom insights
curl http://localhost:3002/orchestrator/wisdom

# Get user preferences
curl http://localhost:3002/orchestrator/preferences
```

## Error Handling

All APIs return consistent error responses:

```json
{
  "error": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `404`: Not Found
- `500`: Internal Server Error

## Production Considerations

### Database Integration
Replace in-memory storage with:
- PostgreSQL for ledger entries
- Redis for caching
- MongoDB for wisdom memory

### Security
- Add authentication/authorization
- Input sanitization
- Rate limiting
- CORS configuration

### Monitoring
- Add logging (Winston, Pino)
- Health check endpoints
- Metrics collection
- Error tracking

---

*These backend services implement the contract-driven architecture defined in the Vision Holder project.* 