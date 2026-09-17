'use client';

export default function RecommendationCard({ recommendation }: { recommendation: any }) {
  return (
    <div className="bg-white text-gray-900 p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-[#e3000f] flex items-center gap-2">
          <span>⚡</span> Target: {recommendation.job_id} <span className="text-xs text-gray-400 font-normal ml-1">(Ziel)</span>
        </h3>
        {recommendation.status === 'pending' ? (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-bold rounded">PENDING</span>
        ) : recommendation.status === 'approved' ? (
          <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-bold rounded">AUTO-RESOLVED</span>
        ) : (
          <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-bold rounded">REJECTED</span>
        )}
      </div>

      <div className="space-y-2">
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">AI Action <span className="text-[10px]">(KI-Aktion)</span>:</p>
          <p className="text-sm font-semibold text-gray-800">{recommendation.proposed_action}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">AI Reasoning <span className="text-[10px]">(Evidenz)</span>:</p>
          <p className="text-sm text-gray-700 italic">"{recommendation.evidence}"</p>
        </div>

        <p className="text-sm pt-2">
          <span className="text-gray-500">Performed by <span className="text-[10px]">(Ausgeführt durch)</span>:</span> <span className="font-medium text-[#e3000f] capitalize ml-1">{recommendation.assigned_to}</span>
        </p>
      </div>
    </div>
  );
}
