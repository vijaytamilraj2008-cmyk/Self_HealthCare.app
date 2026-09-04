# Phase 4 – Final Persistence & Cleanup

This phase is applied on top of Phase 3. The project now uses MySQL/Spring Boot as the source of truth for persistent healthcare data.

## Backend-backed data
- User profile/account
- Appointments
- Medical document metadata and analysis
- Health timeline
- AI conversations and messages
- 24-hour QR/share records

## Local browser storage intentionally retained
- JWT access token (required for browser authentication)
- Accessibility/UI preferences only

## Removed legacy behavior
- Demo user/document/timeline seed data
- Frontend localStorage health-record database
- Frontend localStorage QR token store
- Cached user profile as the source of truth

## Migration
`dataMigrationService` performs a one-time per-user migration of old `ahs_documents_v1` and `ahs_timeline_v1` data. It only migrates records whose `userId` matches the authenticated account, then removes the legacy health-data keys after successful migration.

## Multi-device
After login on another device, `/api/auth/me` loads the profile from MySQL and all persistent healthcare data is read from the backend. QR share tokens can be resolved without the patient's browser storage.

## Remaining limitation
The original PDF/image binary is still not stored server-side in this phase. Its analyzed/structured record is persistent. A future file-storage phase can add encrypted object storage or controlled server file storage for the original binary.


## QR share route fix
- QR codes now use a normal `/share/<token>` path instead of a hash-only URL.
- The frontend accepts both the new path and the previous hash format for backward compatibility.
- `VITE_PUBLIC_APP_URL` controls the QR hostname; local testing is configured for the LAN address in `.env.local`.
- `vercel.json` rewrites direct app paths to `index.html` for SPA hosting.
