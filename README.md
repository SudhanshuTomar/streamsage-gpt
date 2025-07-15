**StreamSage-GPT**

*ReactJS · Node.js · Express · Redux · Prisma · PostgreSQL*

---

## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [Tech Stack](#tech-stack)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Deployment](#deployment)

---

## Overview

StreamSage-GPT is a full-stack content discovery platform designed to replicate a Netflix-style UI and deliver personalized, GPT-powered recommendations. Architected with modern React and Node.js frameworks, the project emphasizes performance, scalability, and seamless user experiences.

---

## Key Features

* **Full-Stack Architecture:** Implemented a secure, JWT-based authentication flow alongside Redux for client-state management and RESTful APIs on the backend.
* **Dynamic UI:** Built a Netflix-style interface with dynamic movie collections, responsive design, and smooth navigation.
* **GPT-Powered Recommendations:** Integrated OpenAI embeddings and vector search to serve personalized suggestions in under 150 ms.
* **Containerized Services:** Dockerized frontend, backend, and database services to ensure consistency across environments.
* **CI/CD & Deployment:** Configured CI/CD pipelines and deployed services on AWS ECS, achieving zero-downtime updates and horizontal scalability.

---

## Tech Stack

* **Frontend:** ReactJS, Redux
* **Backend:** Node.js, Express
* **Database & ORM:** PostgreSQL, Prisma
* **Authentication:** JSON Web Tokens (JWT)
* **Containerization:** Docker
* **CI/CD & Hosting:** GitHub Actions, AWS ECS

---

## Getting Started

### Prerequisites

* Node.js (v16+)
* npm (v8+) or Yarn
* Docker (for containerized setup)
* AWS account (for ECS deployment)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/YourUsername/StreamSage-GPT.git
   ```
2. **Change into project directory:**

   ```bash
   cd StreamSage-GPT
   ```
3. **Install dependencies:**

   ```bash
   npm install
   ```
4. **Set up environment variables:**
   Create a `.env` file with the following keys:

   ```ini
   DATABASE_URL=postgresql://user:password@localhost:5432/streamsage
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_key
   ```

---

## Usage

### Local Development (without Docker)

1. **Start PostgreSQL** (ensure a local instance is running).
2. **Run migrations:**

   ```bash
   npx prisma migrate dev
   ```
3. **Start backend:**

   ```bash
   npm run start:server
   ```
4. **Start frontend:**

   ```bash
   npm run start:client
   ```

---

## Deployment

### Docker & AWS ECS

1. **Build Docker images:**

   ```bash
   docker-compose build
   ```
2. **Push to container registry:**

   ```bash
   docker-compose push
   ```
3. **Deploy via AWS ECS:**

   * Use provided ECS task definitions and service configuration.
   * Update environment variables in AWS Secrets Manager.
   * Deploy services with zero downtime using rolling updates.

---
