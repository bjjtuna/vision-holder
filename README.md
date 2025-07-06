# Vision Holder

An AI-powered coding assistant designed to help people with ADHD, dyslexia, and those who can't code achieve more control and structure in their development process than traditional "vibe coding" approaches.

## Vision

Vision Holder bridges the gap between no-code solutions and full development by providing:
- **Structured guidance** for people with ADHD who need clear, step-by-step processes
- **Accessible interfaces** designed with dyslexia-friendly principles
- **Controlled creativity** that maintains user agency while providing AI assistance
- **Learning-focused** approach that builds coding confidence over time

## Core Principles

1. **User Control First** - You always maintain control over your project direction
2. **Structured Flexibility** - Clear processes that adapt to your thinking style
3. **Accessibility by Design** - Built for neurodiverse users from the ground up
4. **Progressive Learning** - Grows with your skills, doesn't replace them

## Build Journal Protocol (Operator's Manual v2.0)

This project follows the Build Journal Protocol, a systematic approach to maintaining vision alignment and project integrity.

### Directory Convention

The project uses a canonical four-layer directory structure:

- **`/01_theory`** - Philosophy, metaphors, narrative lore
- **`/02_intent`** - UX narratives, product briefs, user stories  
- **`/03_contract`** - Schemas, manifests, OpenAPI specs, JSON rules
- **`/04_impl`** - Production code, tests, assets, infrastructure

### Canon-Layer Separation Rules

- **No cross-imports** from higher-numbered to lower-numbered directories
- **All implementation code** must be generated from `/03_contract` materials
- **Each layer** serves its distinct purpose without contamination

### Purpose-Tag Mandate

Every file, commit message, and PR title must begin with a valid purpose tag:

- **[clarify]** - Understanding, documentation, specification
- **[accelerate]** - Performance, optimization, speed
- **[safeguard]** - Security, safety, protection
- **[monetize]** - Revenue, business value, growth
- **[empathize]** - User experience, accessibility, human needs
- **[delight]** - Joy, satisfaction, positive experience

### Build Journal

The `BUILD_JOURNAL.md` file serves as the single, append-only event log for all vision, strategy, and execution. It contains:

- **Mission (🎯)** - The unifying objective for the current work phase
- **Pillars (🏛️)** - Immutable foundational principles that govern all decisions
- **Epics (🗺️)** - Large-scale, thematic areas of work
- **Sagas (📜)** - Concrete projects with clear goals and outcomes
- **Probes (🔎)** - Focused, time-boxed experiments

Each entry includes `seek` (core intent) and `why` (purpose) fields for clarity and alignment.

## Project Status

✅ **MVP Complete** - Vision Holder application is fully integrated and functional with backend services.

### Current Features

- **📊 Roadmap View** - Visual project structure with real-time progress tracking
- **💬 Co-Vision Chat** - AI-powered assistant with voice input and file uploads
- **🧠 Wisdom Memory** - User preferences and AI insights (placeholder)
- **📚 Knowledge Base** - File and document management (placeholder)
- **🖥️ Terminal Status** - Real-time system health and API monitoring

### Backend Services

- **Systemic Ledger API** (Port 3001) - Append-only event log with full CRUD operations
- **AI Orchestrator API** (Port 3002) - Context engineering and wisdom memory management

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- TypeScript knowledge (helpful but not required)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd webboruso-five-pillars-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd 04_impl/backend && npm install
   ```

3. **Start backend services**
   ```bash
   cd 04_impl/backend
   ./start-services.sh
   ```

4. **Start frontend application**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to access the Vision Holder application.

### Development

The application follows strict protocol compliance:

- **Canon-layer separation** - No cross-imports between theory, intent, contract, and implementation
- **Purpose-tag mandate** - All files and commits use appropriate purpose tags
- **Contract-driven implementation** - All code follows schemas defined in `/03_contract`
- **Living documentation** - Progress tracked in `BUILD_JOURNAL.md`

## Architecture

### Frontend
- **Next.js 14** with TypeScript and Tailwind CSS
- **React components** with accessibility-first design
- **Voice input** using Web Speech API
- **File upload** with drag-and-drop support
- **Dark mode** with persistent preferences

### Backend
- **Express.js** APIs with TypeScript
- **Systemic Ledger** - Append-only event log system
- **AI Orchestrator** - Context engineering and wisdom memory
- **CORS enabled** for frontend integration
- **Health checks** and error handling

### Data Flow
- **Real-time updates** between frontend and backend
- **API client** abstraction for data management
- **Error handling** with graceful degradation
- **Loading states** for better user experience

## Contributing

This project is designed to be inclusive and accessible. We welcome contributions that improve the experience for users with ADHD, dyslexia, and other neurodiverse conditions.

All contributions must follow the Build Journal Protocol and include appropriate purpose tags.

### Development Guidelines

1. **Follow the protocol** - Maintain canon-layer separation and purpose-tag mandate
2. **Test thoroughly** - Ensure accessibility and functionality for neurodiverse users
3. **Document changes** - Update BUILD_JOURNAL.md with all decisions and learnings
4. **Contract-driven** - All implementation must follow schemas in `/03_contract`

## License

*To be determined* 