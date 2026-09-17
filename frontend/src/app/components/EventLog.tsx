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
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 text-gray-100 p-4 rounded-xl shadow-lg border border-gray-700 h-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
          <span className="text-blue-400">📡</span> System Event Stream
        </h2>
        <p className="text-sm text-gray-400">Raw reality data ingested by the workshop.</p>
      </div>
      
      <div className="overflow-auto max-h-[300px] border border-gray-700 rounded bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              <th className="p-2 border-b border-gray-700">Time</th>
              <th className="p-2 border-b border-gray-700">Job</th>
              <th className="p-2 border-b border-gray-700">Event Type</th>
              <th className="p-2 border-b border-gray-700">Details</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">No events found.</td>
              </tr>
            ) : (
              events.map((ev, i) => (
                <tr key={i} className="hover:bg-gray-800 border-b border-gray-800 last:border-0 transition-colors">
                  <td className="p-2 whitespace-nowrap text-gray-400">{ev.timestamp}</td>
                  <td className="p-2 font-medium text-blue-300">{ev.job_id}</td>
                  <td className="p-2">
                    <span className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs">
                      {ev.event_type}
                    </span>
                  </td>
                  <td className="p-2 text-gray-400">{ev.payload || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

