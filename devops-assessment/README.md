# AI-Powered CI/CD Monitoring Framework 🚀

A professional, microservices-based operation dashboard for real-time GitHub Actions monitoring, automated diagnostics, and predictive analytics. Built with a high-performance Java Spring Boot backend and a sleek, glassmorphic React frontend.

## ✨ Core Features
- **Live GitHub Monitor**: Real-time terminal log streaming directly from GitHub Actions.
- **AI Log Diagnostics**: Instant error analysis and suggested fixes powered by LLMs.
- **Operations Intelligence**: Interactive analytics for pipeline success rates and deployment trends.
- **Microservice Health**: Unified dashboard for managing and monitoring multiple repository targets.
- **Smart Data Isolation**: Multi-tenancy support ensuring users only see their own private project data.
- **Automated 'Test & Monitor'**: One-click build triggering with automated terminal focus and live polling.

## 🛠️ Technology Stack
- **Backend**: Spring Boot 3.x, Spring Security (JWT), MongoDB.
- **Frontend**: React 18 (Vite), TypeScript, Recharts, Glassmorphism UI.
- **AI Service**: FastAPI, Python, LLM Integration for log analysis.
- **Infrastructure**: Docker & Docker Compose for seamless cross-platform orchestration.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Desktop (Running)
- GitHub Personal Access Token (PAT) with `repo` and `workflow` scopes.

### Quick Setup
1. **Configure API Key**:
   Open `backend/src/main/resources/application.properties` and add your GitHub token:
   ```properties
   github.token=ghp_your_token_here
   ```

2. **Launch with Docker**:
   Run the following command from the root directory:
   ```bash
   docker compose up --build -d
   ```

3. **Access the Platform**:
   - **Frontend**: [http://localhost](http://localhost)
   - **Backend API**: [http://localhost:8080](http://localhost:8080)
   - **AI Service**: [http://localhost:8000](http://localhost:8000)

### 🔑 Default Admin Access
- **Username**: `admin`
- **Password**: `admin123`
*(Auto-seeded on first launch if the database is empty)*

## 📂 Architecture Decision Records
- **Multi-Tenancy**: Data is isolated at the owner level in MongoDB; users authenticated via JWT tokens.
- **Real-time Polling**: Frontend uses high-frequency polling (5s) for live log streaming to maintain simplicity without the overhead of WebSockets.
- **State Partitioning**: Selected projects are synchronized across Analytics, Terminal, and Log History components for a "Single Pane of Glass" experience.

---
Built with ❤️ by the AI-DevOps Team.
