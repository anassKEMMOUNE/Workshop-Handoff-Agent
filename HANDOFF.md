# Prototype Handoff

Case: **C02 - Workshop Handoff Agent**. Candidate/team: **Anass Kemmoune**. Prototype location: **[GitHub Repository](https://github.com/anassKEMMOUNE/Workshop-Handoff-Agent)**.

## The problem we validated

**Actor, painful moment and consequence:** Workshop Service Advisers and Parts Coordinators suffer from misaligned reality. A vehicle sits idle ("awaiting parts") while the part is actually in the building, extending repair turnaround times and frustrating customers. 

**Client evidence (Autohaus Frisch):** In highly optimized Volkswagen/Skoda/Audi service centers, physical processes (scanning parts, customer SMS approvals) move faster than the manual status updates in the CRM.

**What the client changed in our understanding:** We realized that a "human-in-the-loop" approval process for obvious bottlenecks was *too slow*. The client demanded full automation to eliminate clicks. If the AI detects a contradiction, it must instantly unblock it and log the action securely. 

**What remains an assumption:** Whether the real-world barcode scanners and CRM webhooks can reliably stream events to our `/api/events` endpoint without high latency.

## Open and demonstrate it

**Exact run instructions and start state:** 
The solution is fully deployed on Vercel as a serverless Next.js + FastAPI monorepo.
Live URL: **[Vercel Dashboard / Deployed Link]**
Start state: The system polls Supabase for 4 active Workshop Bays with injected physical events.

**Ordinary path:** A job sits at "repair paused" awaiting customer approval. The Service Adviser has done nothing yet.
**Changed-information path (Automated Resolution):** Using the "Simulate Event" panel, we inject a "customer approved estimate" event. The AI (DeepSeek via LangGraph) scans the graph, spots the contradiction, automatically advances the job to "repair in progress", and immutably logs the action as "Autohaus Frisch AI".
**Failure or uncertainty path:** Equipment goes offline (event: `device_state = offline`). The AI recognizes it cannot resolve physical machinery issues, flags the bay in Yellow ("Achtung: Equipment offline"), and assigns a human to investigate rather than auto-resolving.

## What is real

| Component | Implemented or simulated | Evidence and limitation |
| --- | --- | --- |
| Input and event trigger | Implemented | FastAPI `POST /api/events` endpoint ready for IoT/Webhooks. Currently uses UI Simulator. |
| Retrieval / reasoning | Implemented | LangGraph `StateGraph` running DeepSeek LLM. Fully dynamic JSON inference. |
| Human review | Eliminated | Replaced by full automation and immutable Audit Trail. |
| External action | Implemented | Updates Supabase `jobs` stage dynamically without human intervention. |
| Persistence and history | Implemented | PostgreSQL (Supabase) storing `action_log`, `events`, and `jobs`. |

## Next client validation

**One real case we would test:** Connecting the Parts Department physical barcode scanner to our API. 
**What counts as success:** When a mechanic scans a brake pad, the vehicle's status on the digital dashboard changes to "Repair in Progress" within 5 seconds without anyone touching a keyboard.
**Who evaluates it:** The Workshop Controller at Autohaus Frisch.

## Wolf work

**Required integration and permission:** API access to the Autohaus Frisch Dealer Management System (DMS) and SMS gateway.
**Data boundary and model processing location:** EU-hosted Supabase (Frankfurt) and DeepSeek API processing. Data is not used for model training.
**Failure/recovery plan:** If the AI makes an incorrect stage change, the Workshop Controller can manually revert the stage via the DMS. The `action_log` provides an exact timestamp to rollback.
**Monitoring owner:** The internal Operations team via the Audit Trail dashboard.

**Scope and effort drivers:** Mapping the hundreds of proprietary Volkswagen/Skoda event codes to our unified JSON event structure. 

**Next action and owner:** Pitch the prototype to the Autohaus Frisch stakeholders and secure a 2-week pilot in a single repair bay. (Owner: Anass Kemmoune).

