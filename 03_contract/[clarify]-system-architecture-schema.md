# [clarify] System Architecture Schema

## Overview

This document defines the technical architecture and data schemas for the Vision Holder system, ensuring all implementation follows consistent patterns and interfaces.

## Core Components

### 1. Systemic Ledger
```json
{
  "entry": {
    "id": "string",
    "timestamp": "ISO-8601",
    "purpose_tag": "[clarify|accelerate|safeguard|monetize|empathize|delight]",
    "level": "mission|pillar|epic|saga|probe",
    "seek": "string",
    "why": "string",
    "content": "object",
    "status": "proposed|active|blocked|integrated|archived|dormant"
  }
}
```

### 2. AI Orchestrator Interface
```json
{
  "orchestrator": {
    "context_engine": {
      "input": "systemic_ledger",
      "output": "minimal_context_prompt",
      "alignment_check": "boolean"
    },
    "wisdom_memory": {
      "insight": "string",
      "relevance_score": "number",
      "context_triggers": ["string"],
      "user_preference": "object"
    }
  }
}
```

### 3. User Interface Schema
```json
{
  "ui_components": {
    "roadmap": {
      "hierarchy_display": "mission|pillar|epic|saga|probe",
      "progress_indicators": "visual_status",
      "navigation": "tabbed_interface"
    },
    "chat": {
      "voice_input": "Web Speech API",
      "file_upload": "multipart/form-data",
      "context_continuity": "summary_report"
    }
  }
}
```

## API Specifications

### Systemic Ledger API
- `POST /ledger/entries` - Add new entry
- `GET /ledger/entries` - Retrieve entries with filters
- `PUT /ledger/entries/{id}/status` - Update entry status

### Orchestrator API
- `POST /orchestrator/context` - Generate minimal context
- `POST /orchestrator/wisdom` - Store new insight
- `GET /orchestrator/alignment` - Check alignment with mission/pillars

### UI API
- `GET /ui/roadmap` - Get current roadmap data
- `POST /ui/chat` - Send chat message
- `POST /ui/voice` - Process voice input

## Data Flow

1. **Theory** → **Intent** → **Contract** → **Implementation**
2. **User Input** → **Orchestrator** → **Context Engine** → **Builder AI**
3. **Builder AI Output** → **Integration** → **Wisdom Memory** → **Ledger Update**

---

*This schema ensures all implementation follows consistent patterns and maintains system integrity.* 