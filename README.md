# TravelNest 🌍

TravelNest is a production-ready, AI-Powered Travel Planning & Tourism Platform. It leverages a modern microservices architecture to provide a seamless travel planning experience.

## 🚀 Architecture Overview

The project is structured as a clean monorepo:

- **`/backend`**: Node.js & Express API Gateway.
  - Runtime: Node.js 20 LTS
  - Language: TypeScript
  - Database: PostgreSQL (Prisma) & MongoDB (Mongoose)
  - Cache: Redis
  - Auth: JWT + Google OAuth 2.0
- **`/frontend`**: React Application.
  - Framework: React + Vite
  - Styling: Tailwind CSS + shadcn/ui
  - State: Context API + TanStack Query
- **`/ai-service`**: Python AI Engine.
  - Framework: FastAPI
  - Logic: India-First travel generation logic using OpenAI GPT-4o.

## 🛠 Tech Stack

| Service | Technology |
|---------|------------|
| **Runtime** | Node.js (Backend), Python 3.9 (AI) |
| **Frameworks** | Express.js, FastAPI, React |
| **Databases** | PostgreSQL, MongoDB |
| **ORM/ODM** | Prisma, Mongoose |
| **Messaging** | Socket.IO |
| **Testing** | Jest, Supertest |
| **DevOps** | Docker, Docker Compose |

## 📦 Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20 (for local development)
- OpenAI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd travelnest
   ```

2. Configure environment variables:
   - Create a `.env` file in the root based on `.env.example`.
   - Ensure `OPENAI_API_KEY` is set.

3. Spin up the entire stack using Docker:
   ```bash
   docker-compose up --build
   ```

## 🧪 Verification & Testing

### Backend Tests
```bash
cd backend
npm install
npm test
```

### AI Service Tests
```bash
cd ai-service
pip install -r requirements.txt
pytest
```

## 📜 License

This project is built for the April 11th, 2026 production demo evaluation.
