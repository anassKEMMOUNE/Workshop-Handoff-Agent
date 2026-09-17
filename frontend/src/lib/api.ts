const BASE_URL = 'http://localhost:8000';

export async function fetchJobs() {
  try {
    const res = await fetch(`${BASE_URL}/api/jobs`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function fetchEvents() {
  try {
    const res = await fetch(`${BASE_URL}/api/events`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function fetchRecommendations(status?: string) {
  try {
    const url = status ? `${BASE_URL}/api/recommendations?status=${status}` : `${BASE_URL}/api/recommendations`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function simulateEvent(jobId: string, eventType: string, description: string) {
  const res = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, event_type: eventType, description }),
  });
  if (!res.ok) throw new Error('Failed to simulate event');
  return res.json();
}

export async function triggerAnalysis() {
  const res = await fetch(`${BASE_URL}/api/analyze`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger analysis');
  return res.json();
}

export async function approveRecommendation(id: string) {
  const res = await fetch(`${BASE_URL}/api/recommendations/${id}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to approve recommendation');
  return res.json();
}

export async function rejectRecommendation(id: string) {
  const res = await fetch(`${BASE_URL}/api/recommendations/${id}/reject`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reject recommendation');
  return res.json();
}

export async function fetchActionLog() {
  try {
    const res = await fetch(`${BASE_URL}/api/action-log`);
    if (!res.ok) throw new Error('Failed to fetch action log');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function resetSimulation() {
  const res = await fetch(`${BASE_URL}/api/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset simulation');
  return res.json();
}
