# Phone-friendly GitHub and deployment guide

## A. Upload the project from Android
1. Download `Edvyro_Milestone3_REST_API.zip` and extract it using your phone's Files app.
2. Open GitHub in Chrome and create a **public** repository named `edvyro-rest-api-persistent-data`.
3. Open the repository and choose **Add file → Upload files**.
4. Upload the extracted project contents (the `package.json`, `src`, `data`, `database`, `docs`, and other files). Upload the contents, not an extra ZIP inside the repo.
5. Commit the files to `main`. Check that `package.json`, `src/server.js`, and `src/storage.js` are visible.

## B. Deploy (optional; the repository is the one required proof link)
1. Sign in to Render in Chrome and choose **New → Web Service**.
2. Connect your GitHub account and select `edvyro-rest-api-persistent-data`.
3. Build command: `npm install`; Start command: `npm start`.
4. If deploying SQLite, configure persistent storage mounted at `/var/data`; set environment variable `DATA_DIR` to `/var/data`. If your chosen plan cannot provide a persistent disk, don't claim SQLite data is persistent; use managed PostgreSQL or submit the public repository link.
5. Deploy. Open `https://YOUR-SERVICE.onrender.com/api/health`. A successful response includes `"status":"healthy"`.
6. Test `https://YOUR-SERVICE.onrender.com/api/internships?page=1&limit=2`.

## C. Submit to Edvyro
Edvyro asks for one public or view-only proof link. The safest proof link is the public GitHub repository URL. Include the README and supporting files in that same repository. If Edvyro specifically asks for a deployed API URL, submit the deployed service URL instead and make sure `/api/health` works.
