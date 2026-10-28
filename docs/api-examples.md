Internship API — Examples


Replace BASE_URL with your deployed API URL. For local testing, use http://localhost:8000.


1. Check API Health


curl BASE_URL/api/health



2. List Internships with Pagination


curl "BASE_URL/api/internships?page=1&limit=10"



3. Get an Internship by ID


curl BASE_URL/api/internships/1



4. Create an Internship


curl -X POST BASE_URL/api/internships \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Developer Intern",
    "company": "Example Company",
    "domain": "Software Development",
    "location": "India",
    "work_mode": "Remote",
    "description": "Assist with software development tasks.",
    "apply_url": "https://example.com/apply"
  }'



5. Update an Internship


curl -X PUT BASE_URL/api/internships/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Software Intern",
    "company": "Example Company",
    "domain": "Software Development",
    "location": "India",
    "work_mode": "Hybrid",
    "description": "Updated internship description.",
    "apply_url": "https://example.com/apply"
  }'



6. Delete an Internship


curl -X DELETE BASE_URL/api/internships/1



Notes




These examples assume the API is running and reachable.


Use a valid internship ID for detail, update, and delete requests.


The sample application URLs are placeholders.



