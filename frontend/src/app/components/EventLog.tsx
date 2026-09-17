'use client';
import { useEffect, useState } from 'react';
import { fetchEvents } from '@/lib/api';

export default function EventLog() {
  const [events, setEvents] = useState<any[]>([]);

  const load = async () => {
    const data = await fetchEvents();
    // Sort descending by id or just reverse to show latest
    setEvents(data.reverse());
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white text-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 h-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="text-[#e3000f]">📡</span> System Event Stream
        </h2>
        <p className="text-sm text-gray-500">Rohdaten / Echtzeit-Ereignisse (Real-time events).</p>
      </div>
      
      <div className="overflow-auto max-h-[300px] border border-gray-200 rounded bg-gray-50">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-2 border-b border-gray-200 text-gray-600">Zeit</th>
              <th className="p-2 border-b border-gray-200 text-gray-600">Job</th>
              <th className="p-2 border-b border-gray-200 text-gray-600">Event Typ</th>
              <th className="p-2 border-b border-gray-200 text-gray-600">Details</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-400">Keine Events.</td>
              </tr>
            ) : (
              events.map((ev, i) => (
                <tr key={i} className="hover:bg-gray-100 border-b border-gray-200 last:border-0 transition-colors">
                  <td className="p-2 whitespace-nowrap text-gray-500">{ev.timestamp}</td>
                  <td className="p-2 font-medium text-[#e3000f]">{ev.job_id}</td>
                  <td className="p-2">
                    <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                      {ev.event_type}
                    </span>
                  </td>
                  <td className="p-2 text-gray-600">{ev.payload || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

