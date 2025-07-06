# Integration Testing Documentation

## Overview
This document outlines the comprehensive integration testing strategy for the Vision Holder application, validating end-to-end functionality between all frontend tabs and backend services.

**Testing Environment:**
- Frontend: Next.js application (Port 3000)
- Backend Services: Express.js APIs (Ports 3001-3004)
- Testing Framework: Manual testing with automated health checks

## Service Architecture

### Backend Services
1. **Systemic Ledger API** (Port 3001) - Project data management
2. **AI Orchestrator API** (Port 3002) - Context engineering and wisdom
3. **Knowledge Base API** (Port 3003) - File and document management
4. **Terminal API** (Port 3004) - System monitoring and administration

### Frontend Tabs
1. **Roadmap Tab** - Project structure and progress visualization
2. **Chat Tab** - AI conversation interface with voice input
3. **Wisdom Tab** - User preferences and insights management
4. **Knowledge Tab** - File upload and document management
5. **Terminal Tab** - System monitoring and command execution

## Integration Test Suite

### 1. Service Health Validation

#### Test: All Backend Services Running
**Objective**: Verify all backend services are operational and responding to health checks.

**Test Steps:**
```bash
# Check all service health endpoints
curl http://localhost:3001/health  # Systemic Ledger API
curl http://localhost:3002/health  # AI Orchestrator API  
curl http://localhost:3003/health  # Knowledge Base API
curl http://localhost:3004/health  # Terminal API
```

**Expected Results:**
- All services return `200 OK` status
- Each service returns proper health status JSON
- Response times under 100ms

**Validation Criteria:**
```json
{
  "systemic_ledger": {"status": "healthy", "totalEntries": ">0"},
  "ai_orchestrator": {"status": "healthy", "wisdom_insights_count": ">0"},
  "knowledge_base": {"status": "healthy", "documents_count": ">0"},
  "terminal": {"status": "healthy", "service": "Terminal API"}
}
```

---

### 2. Frontend-Backend Integration Tests

#### Test: Roadmap Tab ↔ Systemic Ledger API
**Objective**: Validate the Roadmap tab displays real data from the Systemic Ledger API.

**Test Steps:**
1. Navigate to Roadmap tab in frontend
2. Verify data loads from API endpoint
3. Check for proper error handling when API unavailable
4. Validate real-time updates

**API Calls Tested:**
- `GET /ledger/roadmap` - Fetch roadmap data
- `GET /ledger/entries` - Fetch all entries
- `POST /ledger/entries` - Add new entry (if applicable)

**Expected Results:**
- Roadmap displays Mission, Pillars, Epics, Sagas, and Probes
- Progress indicators show correct status
- No hardcoded data visible
- Loading states appear during API calls

**Validation Script:**
```bash
# Test roadmap data retrieval
curl -s http://localhost:3001/ledger/roadmap | jq '.'

# Verify frontend displays this data
# Manual verification: Open http://localhost:3000 and check Roadmap tab
```

---

#### Test: Chat Tab ↔ AI Orchestrator API
**Objective**: Validate the Chat interface integrates with AI Orchestrator for context and wisdom.

**Test Steps:**
1. Navigate to Chat tab in frontend
2. Test voice input functionality
3. Test file upload capability
4. Verify AI responses use backend context
5. Check wisdom storage and retrieval

**API Calls Tested:**
- `POST /orchestrator/context` - Generate context prompts
- `POST /orchestrator/wisdom` - Store insights
- `GET /orchestrator/wisdom` - Retrieve insights
- `GET /orchestrator/preferences` - Get user preferences

**Expected Results:**
- Voice input captures speech correctly
- File uploads are handled properly
- AI responses are contextually relevant
- Wisdom insights are stored and retrieved

**Validation Script:**
```bash
# Test context generation
curl -X POST http://localhost:3002/orchestrator/context \
  -H "Content-Type: application/json" \
  -d '{"query": "test query", "context": "test context"}'

# Test wisdom storage
curl -X POST http://localhost:3002/orchestrator/wisdom \
  -H "Content-Type: application/json" \
  -d '{"insight": "test insight", "relevance": 0.8}'
```

---

#### Test: Knowledge Tab ↔ Knowledge Base API
**Objective**: Validate complete file upload, management, and AI analysis workflow.

**Test Steps:**
1. Navigate to Knowledge tab in frontend
2. Upload a test file via drag-and-drop
3. Verify file appears in document list
4. Request AI analysis
5. Check analysis results display
6. Test file deletion

**API Calls Tested:**
- `POST /knowledge/upload` - File upload
- `GET /knowledge/documents` - Document listing
- `POST /knowledge/analyze/:id` - AI analysis
- `DELETE /knowledge/documents/:id` - File deletion

**Expected Results:**
- File upload shows progress indicator
- Uploaded file appears in document grid
- AI analysis completes and displays results
- File deletion removes document from list

**Validation Script:**
```bash
# Test file upload
curl -X POST http://localhost:3003/knowledge/upload \
  -F "file=@test-document.pdf" \
  -F "name=Test Document" \
  -F "description=Integration test file"

# Test document listing
curl http://localhost:3003/knowledge/documents

# Test AI analysis (use document ID from upload response)
curl -X POST http://localhost:3003/knowledge/analyze/DOCUMENT_ID
```

---

#### Test: Terminal Tab ↔ Terminal API
**Objective**: Validate system monitoring and command execution functionality.

**Test Steps:**
1. Navigate to Terminal tab in frontend
2. Verify system metrics display
3. Check service health status
4. Test command execution
5. Verify log streaming

**API Calls Tested:**
- `GET /terminal/metrics` - System metrics
- `GET /terminal/services` - Service health
- `POST /terminal/execute` - Command execution
- `GET /terminal/logs` - Log retrieval

**Expected Results:**
- System metrics show real-time data
- Service health indicates all services are healthy
- Commands execute safely with proper validation
- Logs display chronologically with filtering

**Validation Script:**
```bash
# Test system metrics
curl http://localhost:3004/terminal/metrics

# Test service health
curl http://localhost:3004/terminal/services

# Test command execution
curl -X POST http://localhost:3004/terminal/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "ls -la"}'

# Test log retrieval
curl http://localhost:3004/terminal/logs?limit=10
```

---

### 3. Cross-Service Integration Tests

#### Test: File Upload → AI Analysis → Wisdom Storage
**Objective**: Validate complete workflow from file upload to wisdom insight storage.

**Test Steps:**
1. Upload document via Knowledge Base API
2. Request AI analysis
3. Store generated insights in Wisdom Memory
4. Verify insights appear in Chat tab

**Expected Results:**
- File upload succeeds and returns document ID
- AI analysis generates meaningful insights
- Insights are stored with proper relevance scores
- Wisdom insights are retrievable in Chat interface

---

#### Test: Terminal Health Monitoring → System Alerts
**Objective**: Validate system health monitoring triggers appropriate alerts.

**Test Steps:**
1. Monitor system metrics via Terminal API
2. Simulate high resource usage (if possible)
3. Verify health status changes appropriately
4. Check alert generation and display

**Expected Results:**
- Metrics accurately reflect system state
- Health thresholds trigger status changes
- Alerts are generated for critical states
- Frontend displays health status correctly

---

### 4. Error Handling and Recovery Tests

#### Test: Backend Service Failure Recovery
**Objective**: Validate frontend gracefully handles backend service failures.

**Test Steps:**
1. Stop one backend service
2. Navigate to corresponding frontend tab
3. Verify error handling and user feedback
4. Restart service and verify recovery

**Expected Results:**
- Frontend displays appropriate error messages
- No application crashes or white screens
- Loading states and retry mechanisms work
- Service recovery is detected automatically

---

#### Test: Network Connectivity Issues
**Objective**: Validate application behavior under poor network conditions.

**Test Steps:**
1. Simulate network delays (throttling)
2. Test all API interactions
3. Verify timeout handling
4. Check retry mechanisms

**Expected Results:**
- Requests timeout appropriately
- Retry mechanisms activate
- User receives feedback on connectivity issues
- Application remains usable when network recovers

---

### 5. Performance Integration Tests

#### Test: Large File Upload Performance
**Objective**: Validate performance with large file uploads.

**Test Steps:**
1. Upload files of various sizes (1MB, 10MB, 50MB, 100MB)
2. Monitor upload progress
3. Verify system performance during upload
4. Check memory usage and cleanup

**Expected Results:**
- Progress indicators show accurate upload status
- System remains responsive during uploads
- Memory usage remains within acceptable limits
- Large files are properly handled

---

#### Test: High Concurrency Load
**Objective**: Validate system performance under multiple concurrent requests.

**Test Steps:**
1. Simulate multiple users accessing different tabs
2. Generate concurrent API requests
3. Monitor response times and success rates
4. Check for race conditions or data corruption

**Expected Results:**
- Response times remain within acceptable limits
- No data corruption occurs
- All requests complete successfully
- System resources are managed efficiently

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] All backend services started and healthy
- [ ] Frontend application running on port 3000
- [ ] Test files prepared for upload testing
- [ ] Network connectivity confirmed
- [ ] Database/storage cleared for clean testing

### Manual Testing Checklist
- [ ] **Roadmap Tab**: Data loads from API, displays correctly
- [ ] **Chat Tab**: Voice input works, file uploads succeed
- [ ] **Wisdom Tab**: Preferences saved and retrieved
- [ ] **Knowledge Tab**: File upload, analysis, and management work
- [ ] **Terminal Tab**: Metrics display, commands execute safely

### API Testing Checklist
- [ ] **Health Checks**: All services return healthy status
- [ ] **CRUD Operations**: Create, Read, Update, Delete work correctly
- [ ] **File Operations**: Upload, download, delete function properly
- [ ] **Command Execution**: Safe commands execute, dangerous ones blocked
- [ ] **Error Handling**: Proper error responses for invalid requests

### Integration Testing Checklist
- [ ] **Data Flow**: Frontend receives real data from backend
- [ ] **Real-time Updates**: Changes reflect immediately in UI
- [ ] **Cross-service Communication**: APIs communicate correctly
- [ ] **Error Recovery**: Frontend handles backend failures gracefully
- [ ] **Performance**: System remains responsive under load

---

## Test Results Template

### Test Execution Report
**Date**: [DATE]  
**Tester**: [NAME]  
**Environment**: [DEVELOPMENT/STAGING/PRODUCTION]

#### Service Health Status
- Systemic Ledger API (3001): [ PASS / FAIL ]
- AI Orchestrator API (3002): [ PASS / FAIL ]
- Knowledge Base API (3003): [ PASS / FAIL ]
- Terminal API (3004): [ PASS / FAIL ]

#### Frontend Integration Tests
- Roadmap Tab ↔ Systemic Ledger: [ PASS / FAIL ]
- Chat Tab ↔ AI Orchestrator: [ PASS / FAIL ]
- Knowledge Tab ↔ Knowledge Base: [ PASS / FAIL ]
- Terminal Tab ↔ Terminal API: [ PASS / FAIL ]

#### Cross-Service Integration
- File Upload → AI Analysis → Wisdom: [ PASS / FAIL ]
- Terminal Health → System Alerts: [ PASS / FAIL ]

#### Error Handling
- Service Failure Recovery: [ PASS / FAIL ]
- Network Connectivity Issues: [ PASS / FAIL ]

#### Performance Tests
- Large File Upload: [ PASS / FAIL ]
- High Concurrency Load: [ PASS / FAIL ]

### Issues Identified
1. [Issue Description] - Priority: [HIGH/MEDIUM/LOW]
2. [Issue Description] - Priority: [HIGH/MEDIUM/LOW]

### Recommendations
1. [Recommendation]
2. [Recommendation]

---

## Automated Testing Scripts

### Health Check Script
```bash
#!/bin/bash
# health-check.sh - Automated health check for all services

echo "🏥 Vision Holder - Health Check"
echo "================================"

services=(
  "3001:Systemic Ledger API"
  "3002:AI Orchestrator API"
  "3003:Knowledge Base API"
  "3004:Terminal API"
)

for service in "${services[@]}"; do
  port=$(echo $service | cut -d: -f1)
  name=$(echo $service | cut -d: -f2)
  
  if curl -s -f "http://localhost:$port/health" > /dev/null; then
    echo "✅ $name (Port $port) - Healthy"
  else
    echo "❌ $name (Port $port) - Unhealthy"
  fi
done

echo ""
echo "🌐 Frontend Application:"
if curl -s -f "http://localhost:3000" > /dev/null; then
  echo "✅ Vision Holder App (Port 3000) - Accessible"
else
  echo "❌ Vision Holder App (Port 3000) - Not Accessible"
fi
```

### API Integration Test Script
```bash
#!/bin/bash
# api-integration-test.sh - Basic API integration testing

echo "🔧 Vision Holder - API Integration Test"
echo "========================================"

# Test Systemic Ledger API
echo "Testing Systemic Ledger API..."
curl -s "http://localhost:3001/ledger/roadmap" | jq '.mission.title' || echo "❌ Failed"

# Test AI Orchestrator API
echo "Testing AI Orchestrator API..."
curl -s "http://localhost:3002/orchestrator/preferences" | jq '.status' || echo "❌ Failed"

# Test Knowledge Base API
echo "Testing Knowledge Base API..."
curl -s "http://localhost:3003/knowledge/documents" | jq '.total' || echo "❌ Failed"

# Test Terminal API
echo "Testing Terminal API..."
curl -s "http://localhost:3004/terminal/metrics" | jq '.metrics[0].name' || echo "❌ Failed"

echo "Integration test complete!"
```

---

**Last Updated**: 2025-07-06  
**Testing Framework**: Manual + Automated Scripts  
**Coverage**: End-to-End Integration Testing 