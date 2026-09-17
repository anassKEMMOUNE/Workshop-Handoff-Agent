'use client';

import { useEffect, useState } from 'react';
import { fetchActionLog } from '@/lib/api';

export default function ActionLog() {
  const [logs, setLogs] = useState<any[]>([]);

  const load = async () => {
    const data = await fetchActionLog();
    setLogs(data.reverse()); // Latest first
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
          <span className="text-green-400">🛡️</span> Agent Action Audit Trail
        </h2>
        <p className="text-sm text-gray-400">Record of all stage changes executed by the AI and staff.</p>
      </div>

      <div className="overflow-auto max-h-[300px] border border-gray-700 rounded bg-gray-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              <th className="p-2 border-b border-gray-700">Time</th>
              <th className="p-2 border-b border-gray-700">Job</th>
              <th className="p-2 border-b border-gray-700">Action</th>
              <th className="p-2 border-b border-gray-700">Transition</th>
              <th className="p-2 border-b border-gray-700">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">No actions logged yet.</td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-800 border-b border-gray-800 last:border-0 transition-colors">
                  <td className="p-2 whitespace-nowrap text-gray-400">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                  <td className="p-2 font-medium text-blue-300">{log.job_id}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${log.action.includes('Approved') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-2 text-gray-300">
                    {log.previous_state} <span className="text-gray-500">→</span> <span className="text-white font-medium">{log.new_state}</span>
                  </td>
                  <td className="p-2 text-gray-400 truncate max-w-xs" title={log.evidence_ref}>{log.evidence_ref}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
