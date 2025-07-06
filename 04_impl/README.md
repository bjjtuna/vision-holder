# Vision Holder Implementation

This directory contains the production implementation of the Vision Holder system, following the Build Journal Protocol and contract-driven development approach.

## Architecture Overview

The implementation is organized into four main components:

### 1. Systemic Ledger (`systemic-ledger/`)
- **Purpose**: Append-only event log for all project activities
- **Key Features**:
  - Mission and pillar tracking
  - Alignment checking
  - Progress monitoring
  - Export/import capabilities

### 2. AI Orchestrator (`ai-orchestrator/`)
- **Purpose**: Context engineering and wisdom memory management
- **Key Features**:
  - Minimal context prompt generation
  - User preference learning
  - Wisdom insight storage
  - Live alignment checks

### 3. UI Components (`ui-components/`)
- **Purpose**: Accessible user interfaces for neurodiverse users
- **Key Features**:
  - Roadmap visualization
  - Chat interface with voice input
  - Progressive disclosure
  - Dyslexia-friendly design

### 4. Main Application (`vision-holder-app/`)
- **Purpose**: Complete application integration
- **Key Features**:
  - Tabbed navigation
  - Dark mode support
  - Responsive design
  - Component integration

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- TypeScript knowledge

### Installation

1. **Navigate to the application directory**:
   ```bash
   cd 04_impl/vision-holder-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000`

## Usage Guide

### Roadmap View
- **Purpose**: Visual overview of project structure
- **Features**:
  - Expandable mission/pillar/epic/saga/probe hierarchy
  - Progress indicators
  - Status badges
  - Entry selection and details

### Co-Vision Chat
- **Purpose**: AI-powered project management assistant
- **Features**:
  - Voice input (Web Speech API)
  - File uploads
  - Context-aware responses
  - Real-time processing

### Wisdom Memory
- **Purpose**: User preference and insight storage
- **Features**:
  - Learning from interactions
  - Context-triggered insights
  - Preference management

### Knowledge Base
- **Purpose**: File and research material storage
- **Features**:
  - Document uploads
  - Research integration
  - Context linking

### Terminal Status
- **Purpose**: System monitoring and integration
- **Features**:
  - Status monitoring
  - Terminal integration
  - System health

## Development Guidelines

### Code Organization
- All files must use purpose tags: `[clarify]`, `[accelerate]`, `[safeguard]`, `[monetize]`, `[empathize]`, `[delight]`
- Follow the canon-layer separation: no cross-imports from higher to lower layers
- All implementation must be contract-driven (based on `/03_contract` schemas)

### Accessibility Standards
- **Dyslexia-friendly**: High contrast, readable fonts, clear spacing
- **ADHD-friendly**: Progressive disclosure, clear structure, visual feedback
- **Voice input**: Web Speech API integration for hands-free use
- **Keyboard navigation**: Full keyboard accessibility

### Testing
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

## Data Flow

1. **User Input** → Chat Interface
2. **Context Generation** → AI Orchestrator
3. **Alignment Check** → Systemic Ledger
4. **Response Generation** → AI Service (simulated)
5. **Data Storage** → Local Storage
6. **UI Update** → Roadmap View

## Configuration

### Environment Variables
Create a `.env.local` file in the application directory:

```env
# AI Service Configuration (future)
AI_SERVICE_URL=your_ai_service_url
AI_API_KEY=your_api_key

# Storage Configuration
STORAGE_TYPE=local # or 'remote' for future cloud storage
```

### Theme Configuration
The application supports:
- **Light/Dark mode** toggle
- **System preference** detection
- **Persistent** theme storage

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Run `npm run type-check` to identify issues
2. **Missing Dependencies**: Ensure all packages are installed with `npm install`
3. **Voice Input Not Working**: Check browser compatibility and permissions
4. **Data Not Persisting**: Verify localStorage is enabled in browser

### Performance Optimization
- **Lazy loading** for large datasets
- **Debounced** input handling
- **Memoized** component rendering
- **Efficient** state management

## Contributing

1. **Follow the Build Journal Protocol**
2. **Use appropriate purpose tags**
3. **Maintain accessibility standards**
4. **Test with neurodiverse users**
5. **Document changes in BUILD_JOURNAL.md**

## License

MIT License - see project root for details.

---

*This implementation follows the Vision Holder philosophy of user-first, accessibility-driven development with AI assistance.* 