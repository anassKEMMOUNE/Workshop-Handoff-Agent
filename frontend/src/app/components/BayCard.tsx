'use client';

export default function BayCard({ job }: { job: any }) {
  if (!job) return null;

  // Determine status color and message
  let statusColor = 'border-l-4 border-gray-400 bg-white';
  let badgeColor = 'bg-gray-100 text-gray-700';
  let statusMsg = '';
  let icon = '🚗';

  if (job.stage === 'ready') {
    statusColor = 'border-l-4 border-green-500 bg-white';
    badgeColor = 'bg-green-100 text-green-800';
    icon = '✅';
  } else if (job.device_state === 'offline') {
    statusColor = 'border-l-4 border-yellow-500 bg-white';
    badgeColor = 'bg-yellow-100 text-yellow-800';
    statusMsg = 'Warning: Equipment offline (Achtung: Equipment offline)';
    icon = '⚠️';
  } else if (
    (job.stage === 'awaiting parts' && job.part_receipt === 'received') ||
    (job.stage === 'repair paused' && job.customer_approval === 'missing')
  ) {
    statusColor = 'border-l-4 border-[#e3000f] bg-white';
    badgeColor = 'bg-red-100 text-[#e3000f]';
    icon = '🛑';
    statusMsg = 'Contradiction Detected (Widerspruch erkannt)';
  }

  return (
    <div className={`p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between ${statusColor}`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
            <span>{icon}</span> {job.id}
          </h3>
          <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${badgeColor}`}>
            {job.stage}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 mt-4 space-y-2">
          <div className="flex justify-between items-center border-b border-gray-100 pb-1">
            <span className="text-gray-400">Next Owner <span className="text-[10px] block">(Nächster Bearbeiter)</span></span>
            <span className="font-medium text-gray-800 capitalize text-right">{job.next_owner}</span>
          </div>
          {job.part_receipt && (
            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
              <span className="text-gray-400">Parts <span className="text-[10px] block">(Teile)</span></span>
              <span className="font-medium text-gray-800 capitalize text-right">{job.part_receipt}</span>
            </div>
          )}
          {job.customer_approval && (
            <div className="flex justify-between items-center border-b border-gray-100 pb-1">
              <span className="text-gray-400">Approval <span className="text-[10px] block">(Freigabe)</span></span>
              <span className="font-medium text-gray-800 capitalize text-right">{job.customer_approval}</span>
            </div>
          )}
        </div>
      </div>
      
      {statusMsg && (
        <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-medium text-[#e3000f] flex items-center gap-1">
          <span>⚠️</span> {statusMsg}
        </div>
      )}
    </div>
  );
}
