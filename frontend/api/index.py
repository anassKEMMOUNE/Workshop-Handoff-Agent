from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uuid
from datetime import datetime

import database as db
from models import SimulateEventRequest
import agent

app = FastAPI(title="Workshop Handoff Agent API")

# Allow all origins for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "time": datetime.now().isoformat()}

@app.get("/api/jobs")
@app.get("/jobs")
def get_jobs():
    return db.get_all_jobs()

@app.get("/api/events")
@app.get("/events")
def get_events():
    return db.get_all_events()

@app.get("/api/recommendations")
@app.get("/recommendations")
def get_recommendations(status: Optional[str] = None):
    return db.get_recommendations(status)

@app.post("/api/events")
@app.post("/events")
def simulate_event(req: SimulateEventRequest):
    event = {
        "id": f"E-{str(uuid.uuid4())[:8]}",
        "job_id": req.job_id,
        "event_type": req.event_type,
        "timestamp": datetime.now().strftime("%H:%M"),
        "payload": req.description
    }
    created = db.create_event(event)
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create event")
    return created

@app.post("/api/analyze")
@app.post("/analyze")
def analyze_jobs():
    try:
        recommendations = agent.run_analysis()
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendations/{id}/approve")
@app.post("/recommendations/{id}/approve")
def approve_recommendation(id: str):
    rec = next((r for r in db.get_recommendations() if str(r['id']) == id), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    job = next((j for j in db.get_all_jobs() if j['id'] == rec['job_id']), None)
    if not job:
        raise HTTPException(status_code=404, detail="Associated job not found")

    # Update recommendation
    updated_rec = db.update_recommendation_status(id, 'approved')
    
    # Determine new stage
    current_stage = job['stage']
    new_stage = current_stage
    
    if current_stage == 'awaiting parts':
        new_stage = 'repair in progress'
    elif current_stage == 'repair paused':
        new_stage = 'repair in progress'
    elif current_stage == 'quality check':
        new_stage = 'ready'
        
    # Update job if stage changed
    if new_stage != current_stage:
        db.update_job_stage(job['id'], new_stage)
        
    # Create action log
    log_entry = {
        "job_id": job['id'],
        "action": "Recommendation Approved",
        "performed_by": "system",  # or a user if provided
        "evidence_ref": rec['evidence'],
        "previous_state": current_stage,
        "new_state": new_stage,
    }
    db.create_action_log(log_entry)
    
    return updated_rec

@app.post("/api/recommendations/{id}/reject")
@app.post("/recommendations/{id}/reject")
def reject_recommendation(id: str):
    rec = next((r for r in db.get_recommendations() if str(r['id']) == id), None)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    job = next((j for j in db.get_all_jobs() if j['id'] == rec['job_id']), None)
    if not job:
        raise HTTPException(status_code=404, detail="Associated job not found")

    updated_rec = db.update_recommendation_status(id, 'rejected')
    
    # Create action log
    log_entry = {
        "job_id": job['id'],
        "action": "Recommendation Rejected",
        "performed_by": "system",
        "evidence_ref": rec['evidence'],
        "previous_state": job['stage'],
        "new_state": job['stage'],
    }
    db.create_action_log(log_entry)
    
    return updated_rec

@app.get("/api/action-log")
@app.get("/action-log")
def get_action_log():
    return db.get_action_log()

@app.post("/api/reset")
@app.post("/reset")
def reset_simulation():
    success = db.reset_database()
    if not success:
        raise HTTPException(status_code=500, detail="Failed to reset database")
    return {"status": "success", "message": "Simulation reset to initial state"}
