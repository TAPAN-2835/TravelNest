# 🏛 TravelNest Architecture Overview

This document outlines the cloud-native, scalable architecture implemented for the TravelNest system. 

## 1. 🔁 Complete Flow Summary

When a user interacts with the application, the following execution path is undertaken:

```
User -> Nginx (Load Balancer) -> Backend_1 / Backend_2 -> AI Service -> Database/Redis -> Response -> User
```

1. **User Request**: The React frontend sends an HTTP request.
2. **Nginx Reverse Proxy**: Receives the request on port 80 and passes it to the `backend_servers` upstream. 
3. **Backend Servers**: Nginx defaults to Round Robin load balancing, efficiently distributing the incoming traffic between `backend_1` and `backend_2`. 
4. **AI Processing**: If itinerary generation is requested, the backend defers AI-related heavy lifting via Axios to a decoupled Python FastAPI `ai-service`.
5. **Database / Caching**: Output data is persistently stored in PostgreSQL/MongoDB. To prevent database latency during repeat queries, complex generated itineraries are stored in a high-speed **Redis** cache.

## 2. ☁️ AWS Integration

This system leverages core cloud components for enterprise scalability:
* **Amazon EC2**: The primary deployment target utilizing Docker to host our application replicas.
* **Amazon S3**: A secure highly-available object storage bucket used for storing images, user passports, and booking tickets securely via presigned URLs.
* **Amazon SQS (Simple Queue Service)**: An asynchronous messaging queue. The backend shoots email requests here instead of processing them natively. 
* **AWS Lambda**: Subscribes to SQS. When an event enters the queue, Lambda spins up to process the data and fires off an email through AWS SES (Simple Email Service).

## 3. ⚖️ Load Balancer (Nginx)

The `nginx.conf` features an explicitly defined `upstream backend_servers` block mapping to our Node.js scaled Docker replicas (`backend_1` and `backend_2`). 
* If a backend replica goes offline or is updating, Nginx will gracefully reroute traffic exclusively to the healthy replica, providing zero downtime.

## 4. 📈 Scalability

TravelNest supports two core methods of scaling to comfortably handle thousands of users:

**Horizontal Scaling (Scaling Out)**:
By utilizing our `docker-compose.yml`, horizontal scale is instantly achieved by adding further replicas (e.g., `backend_3`, `backend_4`) and adding them to the Nginx upstream file.

**Vertical Scaling (Scaling Up)**:
When horizontal clustering isn't enough, we simply increase the `cpus` and `memory` limit resource caps inside our Docker Compose environment or transition the physical host from an EC2 `t2.micro` instances up to compute-optimized `c6g.large` hardware limits.

## 5. ⚡ Elasticity

Elasticity is seamlessly integrated. The system naturally expands and contracts its compute boundaries:
* Our AI is totally isolated from the core backend so the heaviest system load won't bog down basic DB fetch requests.
* AWS SQS automatically buffers millions of notifications flexibly; allowing Lambda to burst-execute emails in bulk while the main servers remain undisturbed.

## 6. 🧠 AI Flow 

1. **Node.js**: Assembles user requirements (destination, budget, days, activities).
2. **Python Fast API**: Receives context from the backend and prompts sophisticated LLMs (OpenAI). 
3. **Caching**: Returns an extensive day-to-day JSON response that is subsequently inserted into caching (Redis) immediately so the user experiences minimal latency on refresh!
