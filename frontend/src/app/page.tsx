'use client';

import { useEffect, useState } from 'react';
import BayCard from './components/BayCard';
import RecommendationCard from './components/RecommendationCard';
import SimulateEvent from './components/SimulateEvent';
import ActionLog from './components/ActionLog';
import EventLog from './components/EventLog';
import { fetchJobs, fetchRecommendations, triggerAnalysis, resetSimulation } from '@/lib/api';

export default function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [resetting, setResetting] = useState(false);

  const loadData = async () => {
    try {
      const [jobsData, recsData] = await Promise.all([
        fetchJobs(),
        fetchRecommendations()
      ]);
      setJobs(jobsData || []);
      setRecommendations(recsData || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      await triggerAnalysis();
      await loadData();
    } catch (e: any) {
      console.error(e);
      alert(`Analysis failed: ${e.message || 'Unknown error'}`);
    }
    setAnalyzing(false);
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the simulation to its initial state?')) return;
    setResetting(true);
    try {
      await resetSimulation();
      await loadData();
    } catch (e) {
      console.error(e);
    }
    setResetting(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-gray-100 font-sans">
      {/* Header */}
      <header className="bg-gray-950 border-b border-gray-800 text-white py-4 px-6 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-400">Workshop Handoff Agent</h1>
          <p className="text-sm text-gray-400">AI-powered bottleneck detection for auto workshops</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            disabled={resetting || analyzing}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium transition-colors border border-red-500"
          >
            {resetting ? 'Resetting...' : 'Reset Simulation'}
          </button>
          <button 
            onClick={handleRunAnalysis}
            disabled={analyzing || resetting}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium transition-colors border border-blue-500 flex items-center gap-2"
          >
            {analyzing ? 'Analyzing...' : '🧠 Run Agent Analysis'}
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-8 max-w-7xl mx-auto w-full">
        {/* Active Bays Section */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-200">
            <span className="text-yellow-500">🔧</span> Active Workshop Bays
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {jobs.length === 0 ? (
              <div className="col-span-full text-gray-400 bg-gray-800 p-4 rounded border border-gray-700">No active jobs found.</div>
            ) : (
              jobs.map(job => <BayCard key={job.id} job={job} />)
            )}
          </div>
        </section>

        {/* AI Recommendations */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-200">
            <span className="text-blue-400">💡</span> AI Agent Recommendations
          </h2>
          {recommendations.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl text-center text-gray-400 shadow-md">
              No bottlenecks detected. Run the Agent Analysis to scan for issues.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map(rec => (
                <RecommendationCard key={rec.id} recommendation={rec} onUpdate={loadData} />
              ))}
            </div>
          )}
        </section>

        {/* Bottom Section: Simulation & Audit Trail */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SimulateEvent jobs={jobs} onInjected={loadData} />
          </div>
          <div className="lg:col-span-1">
            <EventLog />
          </div>
          <div className="lg:col-span-1">
            <ActionLog />
          </div>
        </section>
      </main>
    </div>
  );
}
