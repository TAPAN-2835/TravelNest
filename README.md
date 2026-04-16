# 🌍 TravelNest 

Welcome to TravelNest! This is the ultimate, AI-powered platform for planning, organizing, and executing scalable trip management in the cloud. We take the hassle out of travel planning and let you focus on making memories.

## 🌍 What is this project?
TravelNest is a fully-scalable, cloud-native application that acts as your personal smart travel planner. Give it a budget and destination, and our decoupled AI engine instantly curates a multi-day itinerary. It includes features for booking management, documents tracking, and real-time alerts.

---

## ⚙️ How the System Works
The journey of a request inside our system is extremely simple:

```text
User ➔ Load Balancer (Nginx) ➔ Scaled Backend (Node) ➔ AI Engine (Python) ➔ Cache & Database ➔ User
```

1. **Click**: User asks for an itinerary. 
2. **Distribute**: Our Load Balancer smoothly assigns the request to the least busy server. 
3. **Think**: The Backend fires a prompt down into the dedicated AI engine. 
4. **Cache & Respond**: The final trip plan is cached lightning-fast into Redis and instantly stored into MongoDB/Postgres.

---

## ☁️ Cloud Services Used

- **Amazon EC2**: The primary computing virtual machine hosting our Dockerized environments.
- **Amazon S3**: High-durability storage used for user uploads (tickets, flight documents).
- **AWS SQS**: Message queue designed to absorb thousands of notification events gracefully. 
- **AWS Lambda**: A serverless function triggered by SQS that shoots emails behind the scenes securely.
- **Redis**: An in-memory cache we've utilized to instantly recall complex trip data.

---

## 📈 Scalability Explained (HOW DO WE HANDLE 1000+ USERS?)

Our architecture isn't meant for just local environments; it is specifically designed to handle traffic spikes naturally!

* **Horizontal Scaling**: Our `docker-compose.yml` natively implements explicit replica containers (`backend_1`, `backend_2`). To handle 10,000+ users, we just push a button to boot 10 more containers!
* **Vertical Scaling**: Need a faster brain? We can vertically swap the host hardware inside AWS EC2 (e.g. going from a `t2.micro` to an `m5.large`) without disrupting system structure. 
* **Load Balancing (Nginx)**: Sitting right at the front door, Nginx protects the server stack. It acts like a traffic cop, routing data equally between active servers preventing a crash.

---

## 🔥 Real-world Architecture

"This system can handle 1000+ users easily by horizontally scaling Node.js containers alongside an elastic Queue (SQS) that prevents notification floods. Expensive Database loads are avoided by utilizing our fast-read Redis Cache." 

---

## 🐳 How to Run Locally

Get the application humming on your local machine instantly utilizing Docker:

1. **Clone the repository:**
   ```bash
   git clone <your-repo>
   cd TRIP
   ```

2. **Configure your Variables:**
   Populate `.env` files in `/frontend`, `/backend`, and `/ai-service` utilizing the provided `.env.example` templates. 

3. **Deploy the Environment:**
   Run the overarching build script:
   ```bash
   docker-compose up --build
   ```

4. **Experience the Application:**
   Navigate immediately to `http://localhost:5173`. Our Load Balancer routes you automatically!

---

## 🧠 AI Feature
The system relies on an isolated Python service that intelligently communicates with Large Language Models (LLMs). This independence guarantees the rest of our application stays fluid, even when generating days of dense itinerary JSON data!
