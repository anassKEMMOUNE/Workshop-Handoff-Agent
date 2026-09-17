# AutoSync AI

The **AutoSync AI** is an intelligent operational assistant designed to solve the "busy but stuck" problem in automotive repair workshops. 

In a busy workshop, everyone is working hard, but vehicles often sit idle due to simple miscommunications—a part arrives but the mechanic isn't notified, or a customer approves a repair but the service adviser misses the email. This platform acts as an invisible manager that spots these bottlenecks and automatically proposes actions to unblock them.

## 🎯 The Goal
To eliminate operational stalls, reduce vehicle turnaround times, and ensure that every team member (Parts Coordinators, Service Advisers, Workshop Controllers) knows exactly what they need to do next to keep jobs moving.

## ⚙️ How It Works (For the Team)

1. **Continuous Monitoring:** The platform watches two things: the current *stage* of a job (e.g., "Awaiting Parts") and the real-time *events* happening in the shop (e.g., "Part Scanned").
2. **Intelligent Analysis:** Instead of relying on rigid IF/THEN rules, an AI agent analyzes the context to find contradictions. If a job is "Awaiting Parts" but a part was just received, the agent flags the job as **Stalled**.
3. **Actionable Recommendations:** For every stalled job, the agent generates a specific, actionable recommendation (e.g., "Advance job to 'repair in progress' as parts are received") and assigns it to the correct owner.
4. **Human in the Loop:** A staff member reviews the recommendation on the dashboard. With a single click of "Approve", the job's stage is automatically updated, and an audit trail is securely logged.

---

## 🛠️ Technical Architecture & Tech Stack

This platform is built using a modern, unified serverless architecture designed for speed, scalability, and robust AI integration.

### Tech Stack
* **Frontend:** Next.js (React), Tailwind CSS
* **Backend:** Vercel Python Serverless Functions (FastAPI)
* **Database:** Supabase (PostgreSQL)
* **Intelligence / AI:** LangGraph, DeepSeek (via `langchain-openai`)

### Architecture Overview

The system is deployed as a single, unified codebase on Vercel, combining a reactive frontend, a robust API layer, and an agentic reasoning engine:

1. **The State Layer (Supabase):** 
   Acts as the single source of truth. It holds four core tables: `jobs`, `events`, `recommendations`, and an immutable `action_log`.
2. **The API Layer (FastAPI on Vercel):**
   Provides a clean REST interface (`/api/*`) for the frontend to fetch data, inject simulated events, and trigger the AI analysis. It is deployed as Python Serverless Functions inside the Next.js `api/` directory.
3. **The Agentic Workflow (LangGraph):**
   When analysis is triggered, the backend spins up a LangGraph `StateGraph` that executes a multi-step reasoning pipeline:
   * **Node 1 (`load_state`):** Pulls all active jobs and recent events from Supabase.
   * **Node 2 (`detect_stalls`):** Feeds the data to the **DeepSeek LLM** with a strict system prompt to identify contradictions and return structured JSON.
   * **Node 3 (`propose_actions`):** Maps the detected stalls to specific workshop roles and formulates human-readable action proposals.
   * **Node 4 (`write_recommendations`):** Saves the pending recommendations back to Supabase.
4. **The UI Layer (Next.js):**
   A dashboard that polls the API to display real-time workshop bays, agent recommendations, and the audit trail. It includes a simulation panel to inject events (like a customer email) to test the agent's real-time reasoning.

---

## 🚀 Deployment (Vercel)

This project is configured for **1-click deployment on Vercel**, hosting both the Next.js frontend and the Python FastAPI backend simultaneously.

1. **Import the repository** into Vercel.
2. Set the **Framework Preset** to Next.js.
3. Set the **Root Directory** to `frontend` (Crucial!).
4. Add the following **Environment Variables**:
   * `SUPABASE_URL`
   * `SUPABASE_KEY`
   * `DEEPSEEK_API_KEY`
5. Click **Deploy**. Vercel will automatically route `/api/*` traffic to the Python backend using the configuration in `vercel.json`.

---

## 💻 Running the Project Locally

### Prerequisites
* Node.js & npm
* Python 3.10+
* A Supabase project (with RLS disabled for the prototype)
* A DeepSeek API Key

### Setup

1. **Database:**
   Run the SQL provided in `supabase/schema.sql` in your Supabase SQL Editor to create the tables and seed data.

2. **Environment Variables:**
   Create a `.env` file in the root of the project:
   ```env
   SUPABASE_URL=https://your-supabase-url.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   DEEPSEEK_API_KEY=your-deepseek-api-key
   ```

3. **Backend (Terminal 1):**
   ```bash
   cd frontend/api
   pip install -r requirements.txt
   uvicorn index:app --reload --port 8000
   ```

4. **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm install
   npm run dev -- -p 3000
   ```

5. Visit `http://localhost:3000` to interact with the platform.
