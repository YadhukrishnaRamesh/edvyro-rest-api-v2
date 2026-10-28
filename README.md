# Edvyro Milestone 3 — REST API and Persistent Data

A Node.js + Express API for managing internship records, with SQLite persistence.

## Features
- List internships with pagination (`page`, `limit`)
- Get a single internship by ID
- Create, update, and delete records
- Validate required fields, work mode, URL, and text lengths
- Consistent JSON success/error responses and HTTP status codes
- SQLite database auto-created with five fictional starter records
- Health endpoint and sample API requests

## Data model
Fields: `id`, `title`, `company`, `domain`, `location`, `workMode`, `description`, `applyUrl`, `createdAt`, `updatedAt`.
Allowed `workMode`: `Remote`, `Hybrid`, `On-site`.

## Run locally
Install Node.js 18+, then in the project folder run:
```bash
npm install
npm start
```
Open `http://localhost:3000/api/health`. Test routes using Postman. See `docs/api-examples.md`.
Database is created in `data/internships.sqlite`. Set `DATA_DIR` to change the database folder.

## Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/internships?page=1&limit=10` | Paginated list |
| GET | `/api/internships/:id` | Read one record |
| POST | `/api/internships` | Create |
| PUT | `/api/internships/:id` | Update |
| DELETE | `/api/internships/:id` | Delete |

## Important
The starter companies and `example.com` application URLs are fictional placeholders. This is an API project, so its root URL returns JSON rather than a visual website.
For hosted SQLite data to persist across redeploys/restarts, the host must provide persistent storage and `DATA_DIR` must point to it. Many free hosts have ephemeral filesystems. Use a persistent disk or adapt the project to managed PostgreSQL.

## Edvyro submission
Make this GitHub repository public and submit its repository URL as the one proof link. Keep the README and supporting files in this same repository.
