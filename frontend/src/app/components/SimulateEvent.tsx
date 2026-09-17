'use client';

import { useState } from 'react';
import { simulateEvent } from '@/lib/api';

export default function SimulateEvent({ jobs, onInjected }: { jobs: any[], onInjected: () => void }) {
  const [jobId, setJobId] = useState('');
  const [eventType, setEventType] = useState('customer approved estimate');
  const [desc, setDesc] = useState('Customer replied via SMS');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const eventTypes = [
    { type: 'customer approved estimate', defaultDesc: 'Customer replied via SMS' },
    { type: 'part received', defaultDesc: 'Scanned in at parts desk' },
    { type: 'approval request prepared', defaultDesc: 'Service adviser drafted approval email' },
    { type: 'device back online', defaultDesc: 'Equipment reconnected to network' },
  ];

  const handleTypeChange = (e: any) => {
    const type = e.target.value;
    setEventType(type);
    const ev = eventTypes.find(x => x.type === type);
    if (ev) setDesc(ev.defaultDesc);
  };

  const handleInject = async () => {
    if (!jobId) {
      setStatus('Please select a job.');
      return;
    }
    setLoading(true);
    setStatus('Injecting event...');
    try {
      await simulateEvent(jobId, eventType, desc);
      setStatus('Success! Event injected into reality.');
      setTimeout(() => setStatus(''), 3000);
      onInjected();
    } catch (e) {
      console.error(e);
      setStatus('Error injecting event.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-800 text-gray-100 p-4 rounded-xl shadow-lg border-2 border-dashed border-gray-600 h-full flex flex-col justify-between">
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <span className="text-purple-400">⚡</span> Inject Simulation Event
          </h2>
          <p className="text-sm text-gray-400">Simulate real-world workshop events to test the AI agent's detection.</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <select 
            value={jobId} 
            onChange={e => setJobId(e.target.value)}
            className="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Select Active Job --</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.id} - {j.stage.toUpperCase()}</option>
            ))}
          </select>

          <select 
            value={eventType} 
            onChange={handleTypeChange}
            className="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white focus:outline-none focus:border-blue-500"
          >
            {eventTypes.map(ev => (
              <option key={ev.type} value={ev.type}>{ev.type}</option>
            ))}
          </select>

          <input 
            type="text" 
            value={desc} 
            onChange={e => setDesc(e.target.value)}
            placeholder="Event details..."
            className="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <button 
          onClick={handleInject}
          disabled={loading || !jobId}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition-colors shadow-lg"
        >
          {loading ? 'Injecting...' : 'Fire Event'}
        </button>
        {status && <div className={`mt-2 text-sm text-center ${status.includes('Success') ? 'text-green-400' : 'text-yellow-400'}`}>{status}</div>}
      </div>
    </div>
  );
}
