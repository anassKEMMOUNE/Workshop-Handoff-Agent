'use client';

import { useState, useEffect } from 'react';
import { simulateEvent } from '@/lib/api';

export default function SimulateEvent({ jobs, onInjected }: { jobs: any[], onInjected: () => void }) {
  const [jobId, setJobId] = useState('');
  const [eventType, setEventType] = useState('customer approved estimate');
  const [desc, setDesc] = useState('Customer replied via SMS');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoPilot, setAutoPilot] = useState(false);

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

  const fireEvent = async (tJobId: string, tEventType: string, tDesc: string) => {
    try {
      await simulateEvent(tJobId, tEventType, tDesc);
      onInjected();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleInject = async () => {
    if (!jobId) {
      setStatus('Please select a job.');
      return;
    }
    setLoading(true);
    setStatus('Injecting event...');
    
    const success = await fireEvent(jobId, eventType, desc);
    if (success) {
      setStatus('Success! Event injected into reality.');
      setTimeout(() => setStatus(''), 3000);
    } else {
      setStatus('Error injecting event.');
    }
    setLoading(false);
  };

  // Auto-Pilot Logic
  useEffect(() => {
    if (!autoPilot || jobs.length === 0) return;
    
    const interval = setInterval(async () => {
      // Find a job that needs an event
      const waitingPartJob = jobs.find(j => j.stage === 'awaiting parts' && j.part_receipt !== 'received');
      const pausedJob = jobs.find(j => j.stage === 'repair paused' && j.customer_approval !== 'received');
      
      if (pausedJob) {
        setStatus(`Auto-Pilot: Customer approved for ${pausedJob.id}`);
        await fireEvent(pausedJob.id, 'customer approved estimate', 'Auto-Pilot: SMS reply received');
      } else if (waitingPartJob) {
        setStatus(`Auto-Pilot: Parts arrived for ${waitingPartJob.id}`);
        await fireEvent(waitingPartJob.id, 'part received', 'Auto-Pilot: Scanned at warehouse');
      } else {
        // Just fire a generic event on a random job
        const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
        setStatus(`Auto-Pilot: General update for ${randomJob.id}`);
        await fireEvent(randomJob.id, 'device back online', 'Auto-Pilot: Routine check');
      }
      setTimeout(() => setStatus(''), 3000);
    }, 15000); // fire every 15s when active

    return () => clearInterval(interval);
  }, [autoPilot, jobs]);

  return (
    <div className="bg-white text-gray-900 p-4 rounded-xl shadow-sm border-2 border-dashed border-gray-300 h-full flex flex-col justify-between relative">
      <div>
        <div className="mb-4 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="text-blue-500">📥</span> Event Simulator
              <span className="text-xs text-gray-400 font-normal ml-1">(Ereignis-Simulator)</span>
            </h2>
            <p className="text-sm text-gray-500">Simulate real-world workshop events. <span className="text-[10px] block">(Simulieren Sie reale Werkstattereignisse.)</span></p>
          </div>
          <button 
            onClick={() => setAutoPilot(!autoPilot)}
            className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${autoPilot ? 'bg-green-100 text-green-700 border-green-300 shadow-inner' : 'bg-gray-100 text-gray-500 border-gray-300'}`}
          >
            {autoPilot ? 'AUTO-PILOT ON' : 'AUTO-PILOT OFF'}
          </button>
        </div>
        
        <div className="flex flex-col gap-3">
          <select 
            value={jobId} 
            onChange={e => setJobId(e.target.value)}
            disabled={autoPilot}
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-[#e3000f] disabled:opacity-50 disabled:bg-gray-50"
          >
            <option value="">-- Select Active Job --</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.id} - {j.stage.toUpperCase()}</option>
            ))}
          </select>

          <select 
            value={eventType} 
            onChange={handleTypeChange}
            disabled={autoPilot}
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-[#e3000f] disabled:opacity-50 disabled:bg-gray-50"
          >
            {eventTypes.map(ev => (
              <option key={ev.type} value={ev.type}>{ev.type}</option>
            ))}
          </select>

          <input 
            type="text" 
            value={desc} 
            onChange={e => setDesc(e.target.value)}
            disabled={autoPilot}
            placeholder="Event details..."
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:border-[#e3000f] disabled:opacity-50 disabled:bg-gray-50"
          />
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button 
          onClick={handleInject}
          disabled={loading || !jobId || autoPilot}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition-colors shadow-md flex justify-center items-center gap-2"
        >
          {loading ? 'Injecting...' : 'Simulate Event'}
          <span className="text-xs font-normal opacity-80">(Event Simulieren)</span>
        </button>
        {status && <div className={`mt-2 text-sm text-center ${status.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{status}</div>}
      </div>
    </div>
  );
}
