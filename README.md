# 🌍 TravelNest: AI Trip Planner

Welcome to TravelNest! This is the ultimate, AI-powered platform for planning, organizing, and executing perfect trips. We take the hassle out of travel planning and let you focus on making memories.

## 🚀 Project Overview

**What is this project?**  
TravelNest is a full-stack platform that acts like a smart travel assistant. It uses AI to generate comprehensive day-by-day travel itineraries based on what you like, your dates, and your budget!

**Why is it useful?**  
Planning trips normally involves jumping between a dozen tabs—maps, blogs, flight bookings, and hotels. TravelNest brings everything into one clean, professional dashboard. You get intelligent suggestions, real-time weather updates, secure document storage, and easy budget management in one place.

---

## 🎯 Features

- **🤖 AI Trip Planner:** Instantly generate custom itineraries by supplying your destination, dates, and budget.
- **💼 Booking Management:** Easily store, track, and retrieve all your flight and hotel booking info.
- **💰 Budget Tracking:** Take control of your expenses! Input your expenses and let TravelNest track if you’re staying under budget.
- **🌤 Alerts & Weather:** Keep an eye out for real-time weather forecasts and travel advisories for your chosen destination.
- **📂 Document Vault:** A safe place to store important tickets, visas, and IDs.
- **🎛 Admin Panel:** An exclusive dashboard to monitor user activity, platform analytics, and trips across the system.

---

## 🏗 How It Works

1. **User** makes a request (e.g. "Plan a 5-day trip to Paris under $2000").
2. **Frontend** (React) provides a beautiful, simple interface and sends the request to the server.
3. **Backend** (Node.js/Express) receives the request, stores your trip data in the database, and queries the AI.
4. **AI Service** (Python + LLMs) thinks about the best spots, routes, and pricing, and sends it back.
5. **Response** is displayed instantly to the User with interactive maps, rich images, and detailed daily breakdowns!

---

## ⚙️ Tech Stack 

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, Prisma
- **AI Service:** Python, FastAPI, OpenAI
- **Databases & Cache:** PostgreSQL (Relational Data), MongoDB (Itineraries & Documents), Redis (Caching)
- **Cloud & Cloud Services:** AWS (S3 for Images/Docs), AWS EC2
- **Containerization:** Docker & Docker Compose

---

## 🐳 How to Run Locally

You can launch the entire stack with Docker extremely easily.

**Prerequisites:** Docker and Docker Compose installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/TRIP.git
   cd TRIP
   ```

2. **Setup your environment variables:**
   - Go into the `/backend`, `/frontend`, and `/ai-service` directories and look at the `.env.example` files (if present).  
   - Create a `.env` file in each directory putting in your keys (like your DB URI, OpenAI keys, AWS keys).

3. **Run with Docker Compose:**
   In the root directory, simply run:
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - **Frontend UI:** `http://localhost:5173`
   - **Backend API:** `http://localhost:5000`
   - **AI Service:** `http://localhost:8000`

---

## ☁️ Deployment

TravelNest is designed to be easily deployed to the cloud! We utilize **AWS EC2** instances running **Docker**.

- The `docker-compose.yml` sets up all required microservices inside self-contained containers.
- A reverse proxy like Nginx handles routing incoming traffic securely to the relevant containers.
- File uploads are streamed straight into **AWS S3** buckets for durability.

---

## 📸 Screenshots

*(Add screenshots of your beautiful Dashboard, Budget Tracker, and AI trip generator here!)*

---

## 👨‍💻 Contributors

Built with ❤️ by the TravelNest Team.
