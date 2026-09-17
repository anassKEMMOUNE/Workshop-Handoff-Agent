import os
import json
from pathlib import Path
from typing import TypedDict, Annotated, List, Dict, Any
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
import database as db

# Load env vars (for local development)
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

llm = ChatOpenAI(
    model="deepseek-chat",
    api_key=os.environ.get("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com",
    max_tokens=1000
)

class AgentState(TypedDict):
    jobs: List[Dict[str, Any]]
    events: List[Dict[str, Any]]
    stalls: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]

# Define the nodes
def load_state(state: AgentState) -> AgentState:
    """Load jobs and events from the database."""
    jobs = db.get_all_jobs()
    events = db.get_all_events()
    return {"jobs": jobs, "events": events}

def detect_stalls(state: AgentState) -> AgentState:
    """Detect stalled jobs by analyzing jobs against events."""
    jobs = state.get("jobs", [])
    events = state.get("events", [])
    
    if not jobs:
        return {"stalls": []}
    
    system_prompt = """You are an expert workshop operational assistant.
Your task is to analyze jobs and events to detect stalled jobs.
Rules for stalling:
1. Part-arrived stall: stage='awaiting parts' but part_receipt='received' -> stalled
2. Approval-unseen stall: stage='repair paused' + customer_approval='missing' but an approval event exists -> stalled
3. Equipment-blocked: device_state='offline' -> uncertain (flag but can't resolve)
4. Clear: stage='ready' + no contradictions -> no action

Respond with a JSON list of dictionaries containing keys: job_id, reason, type (part-arrived, approval-unseen, equipment-blocked, clear).
Do NOT include clear jobs in the final stalls list, only stalled ones.
Only respond with the JSON. Do not include markdown formatting or backticks around the JSON."""
    
    human_prompt = f"""
    Jobs: {json.dumps(jobs, indent=2)}
    Events: {json.dumps(events, indent=2)}
    """
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=human_prompt)
    ]
    
    response = llm.invoke(messages)
    print("LLM RESPONSE CONTENT:", response.content)
    
    try:
        content_val = response.content
        if isinstance(content_val, list):
            # Extract text from the first block if it's a list (for gemini-3.6-flash)
            content_val = content_val[0].get("text", "") if len(content_val) > 0 else ""
        elif not isinstance(content_val, str):
            content_val = str(content_val)
            
        content = content_val.strip()
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
        stalls = json.loads(content)
        # Filter out 'clear' types if the LLM included them
        stalls = [s for s in stalls if s.get('type') != 'clear']
    except json.JSONDecodeError as e:
        print(f"Failed to parse LLM response: {response.content}")
        stalls = []
        
    return {"stalls": stalls}

def propose_actions(state: AgentState) -> AgentState:
    """Propose actions for detected stalls."""
    stalls = state.get("stalls", [])
    jobs = {j['id']: j for j in state.get("jobs", [])}
    
    recommendations = []
    for stall in stalls:
        job_id = stall.get('job_id')
        job = jobs.get(job_id)
        if not job:
            continue
            
        stall_type = stall.get('type')
        action = f"Review and unblock {stall_type}"
        if stall_type == "part-arrived":
            action = "Advance job to 'repair in progress' as parts are received."
        elif stall_type == "approval-unseen":
            action = "Advance job to 'repair in progress' as customer approval event was found."
        elif stall_type == "equipment-blocked":
            action = "Investigate offline equipment."
            
        rec = {
            "job_id": job_id,
            "proposed_action": action,
            "evidence": stall.get('reason', 'Analyzed by agent'),
            "assigned_to": job.get('next_owner', 'manager')
        }
        recommendations.append(rec)
        
    return {"recommendations": recommendations}

def write_recommendations(state: AgentState) -> AgentState:
    """Write recommendations to the database."""
    recommendations = state.get("recommendations", [])
    saved_recs = []
    
    for rec in recommendations:
        saved = db.create_recommendation(rec)
        if saved:
            saved_recs.append(saved)
            
    return {"recommendations": saved_recs}

# Build the graph
workflow = StateGraph(AgentState)

workflow.add_node("load_state", load_state)
workflow.add_node("detect_stalls", detect_stalls)
workflow.add_node("propose_actions", propose_actions)
workflow.add_node("write_recommendations", write_recommendations)

workflow.set_entry_point("load_state")
workflow.add_edge("load_state", "detect_stalls")
workflow.add_edge("detect_stalls", "propose_actions")
workflow.add_edge("propose_actions", "write_recommendations")
workflow.add_edge("write_recommendations", END)

app = workflow.compile()

def run_analysis():
    initial_state = {"jobs": [], "events": [], "stalls": [], "recommendations": []}
    result = app.invoke(initial_state)
    return result.get("recommendations", [])
