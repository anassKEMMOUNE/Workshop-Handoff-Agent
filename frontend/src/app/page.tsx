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
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-sans">
      {/* Autohaus Frisch Header */}
      <header className="bg-white border-b border-gray-200 text-gray-900 py-4 px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-6">
          <img src="https://www.autohaus-frisch.de/assets/images/9/autohaus-frisch-logo-99e6257a.jpg" alt="Autohaus Frisch" className="h-12" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">AI Handoff System</h1>
            <p className="text-sm text-gray-500">Automated Workshop Operations</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            disabled={resetting || analyzing}
            className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 px-4 py-2 rounded font-medium transition-colors border border-gray-300"
          >
            {resetting ? 'Resetting...' : 'Reset Simulation'}
          </button>
          <button 
            onClick={handleRunAnalysis}
            disabled={analyzing || resetting}
            className="bg-[#e3000f] hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium transition-colors shadow-md flex items-center gap-2"
          >
            {analyzing ? 'Analyzing...' : '🧠 Run AI Auto-Resolution'}
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-8 max-w-7xl mx-auto w-full">
        {/* Active Bays Section */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-baseline gap-2 text-gray-800">
            <span className="text-gray-500">🔧</span> Active Workshop Bays
            <span className="text-xs text-gray-400 font-normal tracking-wide uppercase ml-2">(Aktive Werkstattbuchten)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {jobs.length === 0 ? (
              <div className="col-span-full text-gray-500 bg-white p-4 rounded border border-gray-200">No active jobs found. <span className="text-xs text-gray-400 block mt-1">(Keine aktiven Aufträge gefunden.)</span></div>
            ) : (
              jobs.map(job => <BayCard key={job.id} job={job} />)
            )}
          </div>
        </section>

        {/* AI Actions */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-baseline gap-2 text-gray-800">
            <span className="text-[#e3000f]">⚡</span> Automated AI Actions
            <span className="text-xs text-gray-400 font-normal tracking-wide uppercase ml-2">(Automatisierte KI-Aktionen)</span>
          </h2>
          {recommendations.length === 0 ? (
            <div className="bg-white border border-gray-200 p-6 rounded-xl text-center text-gray-500 shadow-sm">
              No bottlenecks detected. Run the AI Auto-Resolution.
              <span className="text-xs text-gray-400 block mt-2">(Keine Engpässe erkannt. Führen Sie die KI-Auto-Lösung aus.)</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map(rec => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          )}
        </section>

        {/* Bottom Section: Simulation & Audit Trail */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <SimulateEvent jobs={jobs} onInjected={async () => { await loadData(); await handleRunAnalysis(); }} />
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
