'use client';

export default function BayCard({ job }: { job: any }) {
  if (!job) return null;

  // Determine status color and message
  let statusColor = 'border-l-4 border-gray-500 bg-gray-800';
  let badgeColor = 'bg-gray-700 text-gray-300';
  let statusMsg = '';
  let icon = '🚗';

  if (job.stage === 'ready') {
    statusColor = 'border-l-4 border-green-500 bg-gray-800';
    badgeColor = 'bg-green-900 text-green-300';
    icon = '✅';
  } else if (job.device_state === 'offline') {
    statusColor = 'border-l-4 border-yellow-500 bg-gray-800';
    badgeColor = 'bg-yellow-900 text-yellow-300';
    statusMsg = 'Warning: Equipment offline';
    icon = '⚠️';
  } else if (
    (job.stage === 'awaiting parts' && job.part_receipt === 'received') ||
    (job.stage === 'repair paused' && job.customer_approval === 'missing')
  ) {
    statusColor = 'border-l-4 border-red-500 bg-gray-800';
    badgeColor = 'bg-red-900 text-red-300';
    icon = '🛑';
    statusMsg = 'Contradiction Detected';
  }

  return (
    <div className={`p-4 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-between ${statusColor}`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl text-gray-100 flex items-center gap-2">
            <span>{icon}</span> {job.id}
          </h3>
          <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${badgeColor}`}>
            {job.stage}
          </span>
        </div>
        
        <div className="text-sm text-gray-400 mt-4 space-y-2">
          <div className="flex justify-between border-b border-gray-700 pb-1">
            <span className="text-gray-500">Next Owner:</span>
            <span className="font-medium text-gray-300 capitalize">{job.next_owner}</span>
          </div>
          {job.part_receipt && (
            <div className="flex justify-between border-b border-gray-700 pb-1">
              <span className="text-gray-500">Parts:</span>
              <span className="font-medium text-gray-300 capitalize">{job.part_receipt}</span>
            </div>
          )}
          {job.customer_approval && (
            <div className="flex justify-between border-b border-gray-700 pb-1">
              <span className="text-gray-500">Approval:</span>
              <span className="font-medium text-gray-300 capitalize">{job.customer_approval}</span>
            </div>
          )}
        </div>
      </div>
      
      {statusMsg && (
        <div className="mt-4 pt-3 border-t border-gray-700 text-xs font-medium text-yellow-400 flex items-center gap-1">
          <span>⚠️</span> {statusMsg}
        </div>
      )}
    </div>
  );
}
