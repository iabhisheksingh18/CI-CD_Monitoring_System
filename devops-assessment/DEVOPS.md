# DevOps Assessment - Project Documentation

Welcome to the DevOps assessment project documentation. This guide covers everything from getting the app running on your local windows machine to understanding the CI/CD pipeline that automates our deployments.

## 1. Project Overview

We've built a simple but robust "Hello World" full-stack application.
- **Backend:** Django (Python) serving a REST API.
- **Frontend:** React (Vite) acting as the user interface.
- **Containerization:** Docker & Docker Compose.
- **CI/CD:** GitHub Actions.

The goal was not just to write code, but to create a deployable, containerized solution that handles real-world edge cases.

---

## 2. Manual Setup (Windows)

If you need to run the application "bare metal" without Docker (useful for debugging code changes quickly), here is how I do it on Windows:

### Backend (Django)
1. Open PowerShell and navigate to the `backend` folder.
2. Create a virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Run the server:
   ```powershell
   python manage.py runserver
   ```
   *The API will be available at `http://localhost:8000`.*

### Frontend (React)
1. Open a new PowerShell window and go to the `frontend` folder.
2. Install the node modules:
   ```powershell
   npm install
   ```
3. Start the dev server:
   ```powershell
   npm run dev
   ```
   *The UI will be accessible at `http://localhost:5173`.*

---

## 3. Docker & Docker Compose Setup

For a consistent environment (and to stop saying "it works on my machine"), we use Docker Compose. This works exactly the same on Windows, Mac, or Linux.

### How to Run
1. Make sure you are in the root directory of the project.
2. Run the build and start command:
   ```bash
   docker-compose up --build
   ```
3. Wait for the logs to settle. You can now access:
   - **Frontend:** http://localhost (Running on Nginx, Port 80)
   - **Backend:** http://localhost:8000/api/hello/

### Architecture
We use a multi-container setup:
- **`backend` service:** Builds from the Python image, runs Gunicorn/Django.
- **`frontend` service:** Uses a **multi-stage build**. It compiles the React app to static files (HTML/JS/CSS) and then copies them into a lightweight Nginx container. This is much more efficient for production than running a Node server.

---

## 4. CI/CD Pipeline

We use **GitHub Actions** to automate the build process. Every time code is pushed to the `main` branch, the pipeline triggers.

**Workflow File:** `.github/workflows/ci-cd.yml`

**What it does:**
1. **Checkout Code:** Grabs the latest commit.
2. **Login to Docker Hub:** Authenticates using repository secrets (`DOCKER_USERNAME`, `DOCKER_PASSWORD`).
3. **Build & Push:**
   - It builds the backend image and pushes it to Docker Hub.
   - It builds the frontend image and pushes it to Docker Hub.
   - We use `latest` tags for simplicity in this assessment.

---

## 5. Troubleshooting (Real Issues We Faced)

During the development of this project, we ran into several "gotchas" that are worth documenting. If you run into issues, check these first.

### Issue #1: The "White Screen of Death" on Localhost
**Symptom:** The frontend container was running, but accessing `http://localhost` returned `ERR_EMPTY_RESPONSE`.
**Cause:** The initial `frontend/Dockerfile` installation of Nginx deleted the default configuration (`rm /etc/nginx/conf.d/default.conf`) but forgot to add a new one! Nginx was running but literally didn't know how to serve files.
**Fix:** We created a custom `nginx.conf` and updated the Dockerfile to copy it into the container.

### Issue #2: The Invisible Newline in CI/CD
**Symptom:** The GitHub Action failed with a confusing error: `invalid tag "***\n/devops-backend:latest": invalid reference format`.
**Cause:** Copy-pasting secrets is dangerous! The `DOCKER_USERNAME` secret had a hidden newline character (`\n`) at the end. When injected into the command, it broke the string into two lines.
**Fix:** I added a sanitization step in the CI pipeline to strip whitespace before using the variable:
```bash
CLEAN_USERNAME=$(echo "$DOCKER_USERNAME" | tr -d '\n\r')
```
Now it works robustly even if the secret is messy.

### Issue #3: YAML Indentation ("The Silent Killer")
**Symptom:** `docker-compose up` failed with `services.depends_on must be a mapping`.
**Cause:** The `docker-compose.yml` file had the `frontend` service indented incorrectly (at the root level) and the `depends_on` block was also misaligned. YAML is very strict about spaces!
**Fix:** Re-aligned the indentation hierarchy so `frontend` sits correctly under `services:` and `depends_on` under `frontend`.
