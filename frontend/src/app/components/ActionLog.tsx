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
    const interval = setInterval(load, 15000); // refresh every 15s to show automated actions quicker
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white text-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 h-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="text-[#e3000f]">🛡️</span> AI Action Audit Trail
          <span className="text-xs text-gray-400 font-normal ml-1">(KI-Aktionsprotokoll)</span>
        </h2>
        <p className="text-sm text-gray-500">Record of all stage changes automatically executed by the AI. <span className="text-[10px] block">(Aufzeichnung aller von der KI automatisch ausgeführten Statusänderungen.)</span></p>
      </div>

      <div className="overflow-auto max-h-[300px] border border-gray-200 rounded bg-gray-50">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-2 border-b border-gray-200 text-gray-600">Time <span className="text-[10px] font-normal block">(Zeit)</span></th>
              <th className="p-2 border-b border-gray-200 text-gray-600">Job <span className="text-[10px] font-normal block">(Auftrag)</span></th>
              <th className="p-2 border-b border-gray-200 text-gray-600">Action <span className="text-[10px] font-normal block">(Aktion)</span></th>
              <th className="p-2 border-b border-gray-200 text-gray-600">Transition <span className="text-[10px] font-normal block">(Übergang)</span></th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-400">No actions logged yet. <span className="text-xs block mt-1">(Bisher keine Aktionen protokolliert.)</span></td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-100 border-b border-gray-200 last:border-0 transition-colors">
                  <td className="p-2 whitespace-nowrap text-gray-500">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                  <td className="p-2 font-medium text-[#e3000f]">{log.job_id}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-800">
                      {log.action.replace('AI Auto-Resolution: ', '')}
                    </span>
                  </td>
                  <td className="p-2 text-gray-600">
                    {log.previous_state} <span className="text-gray-400">→</span> <span className="text-gray-900 font-medium">{log.new_state}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
