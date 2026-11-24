# Vestio Web

Moroccan community marketplace built with Next.js, React and TypeScript.

Project documentation lives in [`doc/`](doc/README.md):

- [Setup and overview](doc/project.md)
- [Testing and mocks](doc/testing.md)
- [Styling](doc/styling.md)
- [Business behavior](doc/business.md)

Repository agent instructions remain in [AGENTS.md](AGENTS.md).

### Password reset

The sign-in form links to `/forgot-password`. After requesting a code, users
enter the latest emailed PIN and matching new passwords at `/reset-password`.
Both routes are public, support English/French/Arabic, and reuse the password
visibility control. Server actions call the backend's `/api/auth/forgot-password`
and `/api/auth/reset-password` endpoints without authentication. Successful resets
clear local auth cookies/tracking and return to sign-in; no automatic login occurs.
The backend owns PIN validation, expiry, attempt limits, and Resend delivery.
