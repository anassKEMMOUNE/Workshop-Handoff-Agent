import os
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env vars (for local development)
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_all_jobs():
    response = supabase.table('jobs').select('*').execute()
    return response.data

def get_all_events():
    response = supabase.table('events').select('*').execute()
    return response.data

def get_events_for_job(job_id: str):
    response = supabase.table('events').select('*').eq('job_id', job_id).execute()
    return response.data

def create_event(event: dict):
    response = supabase.table('events').insert(event).execute()
    return response.data[0] if response.data else None

def get_recommendations(status: str = None):
    query = supabase.table('recommendations').select('*')
    if status:
        query = query.eq('status', status)
    response = query.execute()
    return response.data

def create_recommendation(rec: dict):
    response = supabase.table('recommendations').insert(rec).execute()
    return response.data[0] if response.data else None

def update_recommendation_status(rec_id: str, status: str):
    response = supabase.table('recommendations').update({'status': status}).eq('id', rec_id).execute()
    return response.data[0] if response.data else None

def update_job_stage(job_id: str, new_stage: str):
    response = supabase.table('jobs').update({'stage': new_stage}).eq('id', job_id).execute()
    return response.data[0] if response.data else None

def create_action_log(log_entry: dict):
    response = supabase.table('action_log').insert(log_entry).execute()
    return response.data[0] if response.data else None

def get_action_log():
    response = supabase.table('action_log').select('*').execute()
    return response.data

def reset_database():
    try:
        supabase.table('action_log').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        supabase.table('recommendations').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        supabase.table('events').delete().neq('id', 'dummy').execute()
        supabase.table('jobs').delete().neq('id', 'dummy').execute()
        
        jobs_seed = [
            {"id": "W-1", "stage": "awaiting parts", "part_receipt": "received", "receipt_ref": "R-1", "customer_approval": None, "device_state": None, "next_owner": "parts coordinator"},
            {"id": "W-2", "stage": "repair paused", "part_receipt": "not required", "receipt_ref": None, "customer_approval": "missing", "device_state": None, "next_owner": "service adviser"},
            {"id": "W-3", "stage": "quality check", "part_receipt": None, "receipt_ref": None, "customer_approval": None, "device_state": "offline", "next_owner": "workshop controller"},
            {"id": "W-4", "stage": "ready", "part_receipt": None, "receipt_ref": None, "customer_approval": "received", "device_state": None, "next_owner": "collection desk"}
        ]
        
        events_seed = [
            {"id": "R-1", "job_id": "W-1", "event_type": "part scan", "timestamp": "08:40", "payload": None},
            {"id": "E-2", "job_id": "W-2", "event_type": "approval request prepared", "timestamp": "08:50", "payload": None}
        ]
        
        supabase.table('jobs').insert(jobs_seed).execute()
        supabase.table('events').insert(events_seed).execute()
        return True
    except Exception as e:
        print("Reset error:", e)
        return False
