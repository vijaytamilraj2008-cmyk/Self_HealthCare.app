# Phase 1 – Backend Persistence

Implemented backend persistence for medical-document analysis data and health-timeline events.

Frontend healthcare data flow is now React → Spring Boot REST API → MySQL.

New API endpoints:
- GET/POST/DELETE /api/documents
- GET/POST /api/timeline

Documents store metadata, structured analysis (findings, medical terms, medicines), diagnosis/attention level, page count, and extracted text. The original binary PDF/image is intentionally not stored in MySQL in this phase; the browser performs parsing locally and the structured result is persisted server-side. Original-file storage can be added later using object storage or a file/blob service.

A one-time migration helper imports only the signed-in user's existing v1 localStorage records. Demo records are not migrated to other accounts.

UI pages/services updated to read/write backend data:
- DocumentsPage
- TimelinePage
- DashboardPage recent activity
- documentService
- aiService document context
- pdfService
- qrShareService document context
- authentication profile timeline events
- appointment booking/reschedule/cancellation timeline events

UI preferences and JWT remain local by design.
