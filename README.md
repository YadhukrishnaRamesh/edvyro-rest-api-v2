Edvyro — Internship Portal


A full-stack internship portal built with Node.js, Express, SQLite, HTML, CSS, and JavaScript. The project demonstrates REST API development, persistent data storage, application form validation, and basic API security.


Features




Browse and filter internship opportunities.


Load internship records through an API with loading and error states.


Submit internship applications through a web form.


Validate application data on both the client and server.


Store internship records and applications using SQLite.


Apply security headers using Helmet.


Limit API requests using Express Rate Limit.


Use parameterized SQL queries to help prevent SQL injection.


Return consistent JSON responses and appropriate HTTP status codes.


Provide an API health-check endpoint.




Technology Stack




Frontend: HTML, CSS, JavaScript


Backend: Node.js, Express


Database: SQLite with better-sqlite3


Security: Helmet, Express Rate Limit, input validation, parameterized SQL queries




Requirements




Node.js 18 or newer


npm




Run Locally


Clone the repository:


git clone https://github.com/YadhukrishnaRamesh/edvyro-rest-api-v2.git
cd edvyro-rest-api-v2



Install dependencies and start the server:


npm install
npm start



Open the application at:


http://localhost:3000


Check the API health endpoint:


http://localhost:3000/api/health


The SQLite database is initialized automatically. By default, it is stored in the data directory. The DATA_DIR and DB_PATH environment variables can be used to configure database storage.


API Endpoints




Method
Endpoint
Purpose




GET
/api/health
Check API health


GET
/api/integration-test-records
Load predefined integration records


GET
/api/internships?page=1&limit=10
List internships with pagination


GET
/api/internships/:id
Retrieve one internship


POST
/api/internships
Create an internship


PUT
/api/internships/:id
Update an internship


DELETE
/api/internships/:id
Delete an internship


POST
/api/applications
Validate and submit an application




Application Validation


The application endpoint validates the internship selection, applicant name, email address, skills, and cover letter on the server. Invalid submissions are rejected with an appropriate HTTP error response.


Security Measures




Helmet sets HTTP security headers.


Express Rate Limit restricts repeated API requests.


JSON request bodies have a size limit.


Input validation rejects invalid data.


Parameterized SQLite queries are used for database operations.


Error responses avoid exposing internal implementation details.




Testing Checklist


Before release, verify:




Internship records load successfully.


Loading, empty, and failure states are displayed correctly.


Search and filters work on mobile and desktop.


Valid applications are accepted.


Invalid applications are rejected.


Unknown API routes return a 404 response.


Rate limits and security headers are present.


Existing internship CRUD endpoints continue to work.


Database persistence is checked across server restarts.




Deployment Notes


A deployed instance requires a compatible Node.js hosting environment and installed dependencies. Local SQLite files may not persist on hosts with ephemeral filesystems. Use a host-supported persistent disk or a managed database for reliable production persistence.


Engineering Decisions


SQLite provides a lightweight database suitable for this project. Parameterized SQL queries separate data from SQL commands. Server-side validation provides protection beyond browser validation, while rate limiting and security headers add further safeguards. Keeping the frontend and API in one Express application simplifies local development and deployment.


Project Submission


GitHub repository:


https://github.com/YadhukrishnaRamesh/edvyro-rest-api-v2


This project was developed as part of the Edvyro Full Stack Development internship milestones.


