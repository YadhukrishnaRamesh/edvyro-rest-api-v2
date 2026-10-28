API Examples
Replace http://localhost:3000 with your deployed URL.
Health: GET /api/health
List/pagination: GET /api/internships?page=1&limit=10
Detail: GET /api/internships/1
Create: POST /api/internships
Update: PUT /api/internships/1
Delete: DELETE /api/internships/1
For POST and PUT, set Content-Type: application/json and send all fields:
{
  "title": "Backend Developer Intern",
  "company": "Example Labs",
  "domain": "Backend Development",
  "location": "Remote",
  "workMode": "Remote",
  "description": "Help build and test REST API endpoints.",
  "applyUrl": "https://example.com/apply/backend"
}
Try {} as the POST body to confirm validation returns HTTP 400. Expected status codes: 200 success, 201 created, 400 invalid input, 404 missing record/route, 500 unexpected server error.
