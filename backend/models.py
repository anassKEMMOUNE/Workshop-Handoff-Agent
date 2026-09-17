from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field

class Job(BaseModel):
    id: str
    stage: str
    part_receipt: Optional[str] = None
    receipt_ref: Optional[str] = None
    customer_approval: Optional[str] = None
    device_state: Optional[str] = None
    next_owner: str
    updated_at: Optional[datetime] = None

class Event(BaseModel):
    id: str
    job_id: str
    event_type: str
    timestamp: str
    payload: Optional[str] = None

class Recommendation(BaseModel):
    id: Optional[str] = None
    job_id: str
    proposed_action: str
    evidence: str
    assigned_to: str
    status: str = "pending"
    created_at: Optional[datetime] = None

class ActionLog(BaseModel):
    id: Optional[str] = None
    job_id: str
    action: str
    performed_by: str
    evidence_ref: Optional[str] = None
    previous_state: Optional[str] = None
    new_state: Optional[str] = None
    timestamp: Optional[datetime] = None

class SimulateEventRequest(BaseModel):
    job_id: str
    event_type: str
    description: Optional[str] = None
