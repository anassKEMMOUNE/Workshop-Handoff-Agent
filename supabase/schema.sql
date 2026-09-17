-- Jobs table
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  stage TEXT NOT NULL,
  part_receipt TEXT,
  receipt_ref TEXT,
  customer_approval TEXT,
  device_state TEXT,
  next_owner TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table  
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES jobs(id),
  event_type TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  payload TEXT
);

-- Recommendations table
CREATE TABLE recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id TEXT REFERENCES jobs(id),
  proposed_action TEXT NOT NULL,
  evidence TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action log table
CREATE TABLE action_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id TEXT REFERENCES jobs(id),
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  evidence_ref TEXT,
  previous_state TEXT,
  new_state TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data from initial.json
INSERT INTO jobs (id, stage, part_receipt, receipt_ref, next_owner) VALUES ('W-1', 'awaiting parts', 'received', 'R-1', 'parts coordinator');
INSERT INTO jobs (id, stage, part_receipt, customer_approval, next_owner) VALUES ('W-2', 'repair paused', 'not required', 'missing', 'service adviser');
INSERT INTO jobs (id, stage, device_state, next_owner) VALUES ('W-3', 'quality check', 'offline', 'workshop controller');
INSERT INTO jobs (id, stage, customer_approval, next_owner) VALUES ('W-4', 'ready', 'received', 'collection desk');

INSERT INTO events (id, job_id, event_type, timestamp) VALUES ('R-1', 'W-1', 'part scan', '08:40');
INSERT INTO events (id, job_id, event_type, timestamp) VALUES ('E-2', 'W-2', 'approval request prepared', '08:50');
