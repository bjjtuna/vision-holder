# Knowledge Base API Documentation

## Overview
The Knowledge Base API provides comprehensive file and document management capabilities for the Vision Holder application. It supports file uploads, metadata management, AI-powered analysis, and document organization.

**Base URL**: `http://localhost:3003`
**Version**: 1.0.0

## Authentication
Currently, the API does not require authentication (development mode).

## Endpoints

### Health Check

#### GET /health
Returns the health status of the Knowledge Base API.

**Response:**
```json
{
  "status": "healthy",
  "documents_count": 3,
  "storage_used": "2.5MB",
  "uptime": "2h 15m"
}
```

**Response Codes:**
- `200 OK` - Service is healthy
- `503 Service Unavailable` - Service is unhealthy

---

### File Upload

#### POST /knowledge/upload
Upload a new file to the knowledge base.

**Content-Type**: `multipart/form-data`

**Form Parameters:**
- `file` (required): The file to upload
- `name` (optional): Custom name for the document
- `description` (optional): Description of the document
- `tags` (optional): Comma-separated tags

**Request Example:**
```bash
curl -X POST http://localhost:3003/knowledge/upload \
  -F "file=@document.pdf" \
  -F "name=Project Blueprint" \
  -F "description=Main project documentation" \
  -F "tags=blueprint,project,planning"
```

**Response:**
```json
{
  "id": "uuid-string",
  "name": "Project Blueprint",
  "type": "document",
  "size": 2048576,
  "uploaded_at": "2025-07-06T10:30:00Z",
  "tags": ["blueprint", "project", "planning"],
  "description": "Main project documentation",
  "url": "/uploads/uuid-document.pdf",
  "is_analyzed": false
}
```

**Response Codes:**
- `201 Created` - File uploaded successfully
- `400 Bad Request` - Invalid file or parameters
- `413 Payload Too Large` - File exceeds size limit (100MB)
- `415 Unsupported Media Type` - File type not allowed

---

### Document Management

#### GET /knowledge/documents
Retrieve all documents with optional filtering.

**Query Parameters:**
- `search` (optional): Search term for document names and descriptions
- `type` (optional): Filter by document type (document, image, video, audio, archive, other)
- `tag` (optional): Filter by tag
- `analyzed` (optional): Filter by analysis status (true/false)
- `limit` (optional): Number of results per page (default: 20)
- `offset` (optional): Number of results to skip (default: 0)

**Request Example:**
```bash
curl "http://localhost:3003/knowledge/documents?search=project&type=document&limit=10"
```

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid-1",
      "name": "Project Blueprint.pdf",
      "type": "document",
      "size": 2048576,
      "uploaded_at": "2025-07-06T10:30:00Z",
      "tags": ["blueprint", "project", "planning"],
      "description": "Main project documentation",
      "url": "/uploads/uuid-document.pdf",
      "is_analyzed": true,
      "ai_analysis": {
        "summary": "Comprehensive project blueprint...",
        "key_points": ["Point 1", "Point 2"],
        "relevance_score": 0.95,
        "suggested_tags": ["architecture", "ai"]
      }
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

**Response Codes:**
- `200 OK` - Documents retrieved successfully
- `400 Bad Request` - Invalid query parameters

---

#### GET /knowledge/documents/{id}
Retrieve a specific document by ID.

**Path Parameters:**
- `id` (required): Document ID

**Response:**
```json
{
  "id": "uuid-1",
  "name": "Project Blueprint.pdf",
  "type": "document",
  "size": 2048576,
  "uploaded_at": "2025-07-06T10:30:00Z",
  "tags": ["blueprint", "project", "planning"],
  "description": "Main project documentation",
  "url": "/uploads/uuid-document.pdf",
  "is_analyzed": true,
  "ai_analysis": {
    "summary": "Comprehensive project blueprint outlining system architecture",
    "key_points": [
      "Five-level abstraction system",
      "AI Orchestrator capabilities",
      "Accessibility-focused design"
    ],
    "relevance_score": 0.95,
    "suggested_tags": ["architecture", "ai", "accessibility"]
  }
}
```

**Response Codes:**
- `200 OK` - Document found
- `404 Not Found` - Document not found

---

#### PUT /knowledge/documents/{id}
Update document metadata.

**Path Parameters:**
- `id` (required): Document ID

**Request Body:**
```json
{
  "name": "Updated Document Name",
  "description": "Updated description",
  "tags": ["new", "tags", "list"]
}
```

**Response:**
```json
{
  "id": "uuid-1",
  "name": "Updated Document Name",
  "type": "document",
  "size": 2048576,
  "uploaded_at": "2025-07-06T10:30:00Z",
  "tags": ["new", "tags", "list"],
  "description": "Updated description",
  "url": "/uploads/uuid-document.pdf",
  "is_analyzed": true
}
```

**Response Codes:**
- `200 OK` - Document updated successfully
- `400 Bad Request` - Invalid request body
- `404 Not Found` - Document not found

---

#### DELETE /knowledge/documents/{id}
Delete a document and its associated file.

**Path Parameters:**
- `id` (required): Document ID

**Response:**
```json
{
  "message": "Document deleted successfully",
  "deleted_id": "uuid-1"
}
```

**Response Codes:**
- `200 OK` - Document deleted successfully
- `404 Not Found` - Document not found
- `500 Internal Server Error` - Failed to delete file

---

### AI Analysis

#### POST /knowledge/analyze/{id}
Request AI analysis for a document.

**Path Parameters:**
- `id` (required): Document ID

**Response:**
```json
{
  "id": "uuid-1",
  "name": "Project Blueprint.pdf",
  "is_analyzed": true,
  "ai_analysis": {
    "summary": "Comprehensive project blueprint outlining the AI Co-Vision Holder system architecture",
    "key_points": [
      "Five-level abstraction system (Mission, Pillars, Epics, Sagas, Probes)",
      "Systemic Ledger for append-only event logging",
      "AI Orchestrator with context engineering capabilities",
      "Accessibility-focused UI for users with dyslexia and ADHD"
    ],
    "relevance_score": 0.95,
    "suggested_tags": ["architecture", "ai", "accessibility", "system-design"]
  }
}
```

**Response Codes:**
- `200 OK` - Analysis completed successfully
- `404 Not Found` - Document not found
- `422 Unprocessable Entity` - Document type not supported for analysis

---

## Data Models

### KnowledgeDocument
```typescript
interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  size: number;
  uploaded_at: string; // ISO 8601 datetime
  tags: string[];
  description?: string;
  ai_analysis?: AIAnalysis;
  url: string;
  is_analyzed: boolean;
}
```

### AIAnalysis
```typescript
interface AIAnalysis {
  summary: string;
  key_points: string[];
  relevance_score: number; // 0.0 to 1.0
  suggested_tags: string[];
}
```

### UploadRequest
```typescript
interface UploadRequest {
  name?: string;
  description?: string;
  tags?: string; // Comma-separated
}
```

## File Type Support

**Supported File Types:**
- **Documents**: .pdf, .doc, .docx, .txt, .rtf, .odt
- **Images**: .jpg, .jpeg, .png, .gif, .bmp, .svg, .webp
- **Videos**: .mp4, .avi, .mov, .wmv, .flv, .webm
- **Audio**: .mp3, .wav, .flac, .aac, .ogg
- **Archives**: .zip, .rar, .7z, .tar, .gz

**File Size Limits:**
- Maximum file size: 100MB
- Storage location: `04_impl/backend/uploads/`

## Security Features

### File Validation
- File extension verification
- MIME type checking
- Size limit enforcement
- Filename sanitization

### Access Control
- Input validation on all endpoints
- Safe file storage practices
- Error message sanitization

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error context"
  }
}
```

### Common Error Codes
- `INVALID_FILE_TYPE` - Unsupported file type
- `FILE_TOO_LARGE` - File exceeds size limit
- `DOCUMENT_NOT_FOUND` - Document ID not found
- `UPLOAD_FAILED` - File upload failed
- `ANALYSIS_FAILED` - AI analysis failed

## Rate Limiting
Currently no rate limiting is implemented (development mode).

## WebSocket Support
Real-time updates for document analysis status are not currently implemented but planned for future versions.

## Examples

### Upload and Analyze Workflow
```bash
# 1. Upload file
curl -X POST http://localhost:3003/knowledge/upload \
  -F "file=@report.pdf" \
  -F "name=Monthly Report" \
  -F "description=Financial analysis report"

# 2. Get document ID from response, then analyze
curl -X POST http://localhost:3003/knowledge/analyze/uuid-from-upload

# 3. Retrieve analyzed document
curl http://localhost:3003/knowledge/documents/uuid-from-upload
```

### Search Documents
```bash
# Search by name
curl "http://localhost:3003/knowledge/documents?search=report"

# Filter by type and tags
curl "http://localhost:3003/knowledge/documents?type=document&tag=financial"

# Get analyzed documents only
curl "http://localhost:3003/knowledge/documents?analyzed=true"
```

---

**Last Updated**: 2025-07-06
**API Version**: 1.0.0
**Service**: Knowledge Base API (Port 3003) 