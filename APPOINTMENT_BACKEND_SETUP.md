# Appointment Backend Update

Appointments are now persisted through Spring Boot + MySQL instead of the browser's localStorage.

## API

- `GET /api/appointments` — current user's appointments
- `POST /api/appointments` — create an appointment
- `PUT /api/appointments/{id}` — edit/reschedule an upcoming appointment
- `PATCH /api/appointments/{id}/cancel` — cancel an upcoming appointment

All appointment endpoints require the existing JWT authentication.

## Database

With the configured JPA setting `spring.jpa.hibernate.ddl-auto=update`, the `appointments` table is created/updated automatically. The SQL definition is also included in `backend/src/main/resources/schema.sql`.

## Time entry

Users type the time manually, for example `09:30`, and select `AM` or `PM`. The backend stores the normalized value such as `09:30 AM`.

## Important frontend change

Appointment state is now loaded into React state from the backend. Creating, editing, and cancelling an appointment updates the visible screen immediately without requiring a page refresh.

Dashboard, QR sharing, and the health-summary PDF also read appointments from the backend so they do not depend on stale localStorage appointment data.
