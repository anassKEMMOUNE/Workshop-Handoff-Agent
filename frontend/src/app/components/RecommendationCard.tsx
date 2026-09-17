'use client';
import { useState } from 'react';
import { approveRecommendation, rejectRecommendation } from '@/lib/api';

export default function RecommendationCard({ recommendation, onUpdate }: { recommendation: any, onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await approveRecommendation(recommendation.id);
    onUpdate();
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await rejectRecommendation(recommendation.id);
    onUpdate();
    setLoading(false);
  };

  return (
    <div className="bg-gray-800 text-gray-100 p-5 rounded-xl shadow-lg border border-gray-700 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-blue-400 flex items-center gap-2">
          <span>🎯</span> Target: {recommendation.job_id}
        </h3>
        {recommendation.status === 'pending' ? (
          <span className="bg-yellow-900 text-yellow-300 px-2 py-1 text-xs font-bold rounded">PENDING</span>
        ) : recommendation.status === 'approved' ? (
          <span className="bg-green-900 text-green-300 px-2 py-1 text-xs font-bold rounded">APPROVED</span>
        ) : (
          <span className="bg-red-900 text-red-300 px-2 py-1 text-xs font-bold rounded">REJECTED</span>
        )}
      </div>

      <div className="space-y-2">
        <div className="bg-gray-900 p-3 rounded border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">Proposed Action:</p>
          <p className="text-sm font-semibold text-gray-200">{recommendation.proposed_action}</p>
        </div>
        
        <div className="bg-gray-900 p-3 rounded border border-gray-700">
          <p className="text-xs text-gray-400 mb-1">AI Evidence:</p>
          <p className="text-sm text-gray-300 italic">"{recommendation.evidence}"</p>
        </div>

        <p className="text-sm pt-2">
          <span className="text-gray-500">Assign To:</span> <span className="font-medium text-gray-300 capitalize">{recommendation.assigned_to}</span>
        </p>
      </div>

      {recommendation.status === 'pending' && (
        <div className="flex gap-2 mt-2 pt-4 border-t border-gray-700">
          <button 
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded transition-colors shadow"
          >
            Approve
          </button>
          <button 
            onClick={handleReject}
            disabled={loading}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded transition-colors shadow"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
