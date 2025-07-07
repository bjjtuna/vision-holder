#!/bin/bash

# 🚀 Vision Holder CLI Setup Script
# Automatically sets up Claude Code CLI and Google Gemini integration

echo "🚀 Setting up CLI tools for Vision Holder..."
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+ first"
    print_info "Download from: https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm"
    exit 1
else
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
fi

# Check if we're in the right directory
if [ ! -d "04_impl" ]; then
    print_error "Please run this script from the webboruso-five-pillars-v2 directory"
    exit 1
fi

echo ""
echo "🧠 Setting up Claude Code CLI..."
echo "----------------------------------------------------------------"

# Try multiple methods to install Claude CLI
CLAUDE_INSTALLED=false

# Method 1: Try official Anthropic CLI (if available)
print_info "Trying to install official Claude Code CLI..."
if npm install -g @anthropic/claude-code 2>/dev/null; then
    print_success "Official Claude Code CLI installed"
    CLAUDE_INSTALLED=true
else
    print_warning "Official Claude Code CLI not available"
fi

# Method 2: Try alternative Claude CLI
if [ "$CLAUDE_INSTALLED" = false ]; then
    print_info "Trying alternative Claude CLI..."
    if npm install -g claude-cli 2>/dev/null; then
        print_success "Alternative Claude CLI installed"
        CLAUDE_INSTALLED=true
    else
        print_warning "Alternative Claude CLI installation failed"
    fi
fi

# Method 3: Try Python-based CLI
if [ "$CLAUDE_INSTALLED" = false ]; then
    if command -v pip &> /dev/null; then
        print_info "Trying Python-based Claude CLI..."
        if pip install claude-3-cli 2>/dev/null; then
            print_success "Python Claude CLI installed"
            CLAUDE_INSTALLED=true
        else
            print_warning "Python Claude CLI installation failed"
        fi
    fi
fi

if [ "$CLAUDE_INSTALLED" = false ]; then
    print_warning "Could not install Claude CLI - will use direct API integration"
    print_info "You can still use Claude through API keys"
fi

echo ""
echo "☁️ Setting up Google Cloud CLI..."
echo "----------------------------------------------------------------"

# Check if gcloud is already installed
if command -v gcloud &> /dev/null; then
    GCLOUD_VERSION=$(gcloud version --format="value(Google Cloud SDK)" 2>/dev/null)
    print_success "Google Cloud CLI already installed: $GCLOUD_VERSION"
else
    print_info "Installing Google Cloud CLI..."
    
    # Detect OS and install accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            print_info "Installing via Homebrew..."
            if brew install google-cloud-sdk; then
                print_success "Google Cloud CLI installed via Homebrew"
            else
                print_warning "Homebrew installation failed, trying curl method..."
                curl https://sdk.cloud.google.com | bash
            fi
        else
            print_info "Installing via curl..."
            curl https://sdk.cloud.google.com | bash
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        print_info "Installing via curl..."
        curl https://sdk.cloud.google.com | bash
    else
        print_warning "Please install Google Cloud CLI manually: https://cloud.google.com/sdk/docs/install"
    fi
fi

echo ""
echo "📝 Creating configuration files..."
echo "----------------------------------------------------------------"

# Navigate to backend directory
cd 04_impl/backend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_info "Creating .env configuration file..."
    cat > .env << 'EOF'
# 🔑 API Keys - Add your actual keys here
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# 🤖 AI Provider Configuration
AI_PROVIDER=auto
CLAUDE_MODEL=claude-3-sonnet-20240229
GEMINI_MODEL=gemini-pro

# 🔧 Service Configuration
COMMAND_API_PORT=3006
ENABLE_CLAUDE_CLI=true
ENABLE_GOOGLE_CLI=true

# ☁️ Google Cloud (optional)
GOOGLE_CLOUD_PROJECT=
GOOGLE_APPLICATION_CREDENTIALS=

# 🚨 Development Settings
NODE_ENV=development
LOG_LEVEL=info
EOF
    print_success ".env file created"
else
    print_warning ".env file already exists - not overwriting"
fi

# Create env.example if it doesn't exist
if [ ! -f env.example ]; then
    print_info "Creating env.example template..."
    cp .env env.example
    print_success "env.example created"
fi

echo ""
echo "🧪 Testing installations..."
echo "----------------------------------------------------------------"

# Test Claude CLI
if command -v claude &> /dev/null; then
    print_success "Claude CLI is available"
    claude --version 2>/dev/null || print_info "Claude CLI installed but needs authentication"
else
    print_warning "Claude CLI not in PATH - will use API integration"
fi

# Test Google Cloud CLI
if command -v gcloud &> /dev/null; then
    print_success "Google Cloud CLI is available"
    gcloud version --format="value(Google Cloud SDK)" 2>/dev/null || print_info "gcloud needs initialization"
else
    print_warning "Google Cloud CLI not available"
fi

# Test Node.js modules
print_info "Installing backend dependencies..."
if npm install --silent; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
fi

echo ""
echo "📋 Next Steps:"
echo "================================================================"

echo ""
print_info "1. ADD YOUR API KEYS to the .env file:"
echo "   - ANTHROPIC_API_KEY: Get from https://console.anthropic.com/"
echo "   - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey"

echo ""
print_info "2. AUTHENTICATE CLIs (if installed):"
if command -v claude &> /dev/null; then
    echo "   Claude CLI: claude auth login"
fi
if command -v gcloud &> /dev/null; then
    echo "   Google CLI: gcloud init && gcloud auth login"
fi

echo ""
print_info "3. START Vision Holder backend:"
echo "   cd 04_impl/backend"
echo "   ./start-services.sh"

echo ""
print_info "4. TEST in Vision Holder:"
echo "   - Open Dev Workspace tab"
echo "   - Click 'Commands' button"
echo "   - Try: 'review current file' or 'help me debug'"

echo ""
print_info "5. VERIFY setup:"
echo "   curl http://localhost:3006/commands/available-tools"

echo ""
echo "🎉 Setup complete! Follow the next steps above to finish configuration."
echo ""

# Create a quick test script
cat > test-cli-setup.sh << 'EOF'
#!/bin/bash
echo "🧪 Testing Vision Holder CLI setup..."

echo "Testing API endpoints..."
curl -s http://localhost:3006/health && echo "✅ Command API healthy" || echo "❌ Command API not running"

echo "Testing available tools..."
curl -s http://localhost:3006/commands/available-tools | jq '.available_tools' 2>/dev/null || echo "Install jq for better output"

echo "Testing Claude CLI..."
claude --version 2>/dev/null && echo "✅ Claude CLI working" || echo "⚠️ Claude CLI not available"

echo "Testing Google Cloud CLI..."
gcloud version --format="value(Google Cloud SDK)" 2>/dev/null && echo "✅ Google Cloud CLI working" || echo "⚠️ Google Cloud CLI not available"

echo "Checking environment variables..."
[ -n "$ANTHROPIC_API_KEY" ] && echo "✅ ANTHROPIC_API_KEY set" || echo "⚠️ ANTHROPIC_API_KEY not set"
[ -n "$GEMINI_API_KEY" ] && echo "✅ GEMINI_API_KEY set" || echo "⚠️ GEMINI_API_KEY not set"
EOF

chmod +x test-cli-setup.sh
print_success "Created test-cli-setup.sh for testing your setup"

echo ""
print_warning "Remember to:"
echo "1. Add your API keys to .env"
echo "2. Run ./start-services.sh to start backend"
echo "3. Run ./test-cli-setup.sh to test everything"