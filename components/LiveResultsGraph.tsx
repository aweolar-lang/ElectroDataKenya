"use client";

import { useEffect, useState } from "react";

// 1. LOOKUP TABLE: Maps your Database IDs to Display Names & Colors
// (Since your API only returns IDs like 'william-ruto', we need this to show the real names)
const CANDIDATE_META: Record<string, { name: string; party: string; color: string }> = {
  "william-ruto":     { name: "William Ruto",    party: "UDA",   color: "bg-yellow-400" },
  "raila-odinga":     { name: "Raila Odinga",    party: "ODM",   color: "bg-orange-500" },
  "kalonzo-musyoka":  { name: "Kalonzo Musyoka", party: "Wiper", color: "bg-blue-500" },
  "george-wajackoyah":{ name: "G. Wajackoyah",   party: "Roots", color: "bg-green-500" },
  // Add others if needed
};

type ResultItem = {
  id: string;
  name: string;
  party: string;
  votes: number;
  color: string;
};

export default function LiveResultsGraph() {
  const [data, setData] = useState<ResultItem[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNationalResults() {
      try {
        // Fetch from your API (No countyId = National Results)
        const res = await fetch('/api/results'); 
        if (!res.ok) throw new Error("Failed");
        
        const json = await res.json(); 
        // Expected JSON: { votes: { "william-ruto": 10 }, total: 10 }

        const apiVotes = json.votes || {};
        
        // Convert the API Object into an Array for the Graph
        const processedData: ResultItem[] = Object.keys(CANDIDATE_META).map((id) => {
          const meta = CANDIDATE_META[id];
          return {
            id: id,
            name: meta.name,
            party: meta.party,
            color: meta.color,
            votes: apiVotes[id] || 0 // Use API count or 0 if no votes yet
          };
        });

        // Sort by votes (Highest first)
        processedData.sort((a, b) => b.votes - a.votes);

        setData(processedData);
        setTotalVotes(json.total || 0);
      } catch (error) {
        console.error("Error fetching graph data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNationalResults();
    
    // Auto-refresh every 5 seconds for "Live" feel
    const interval = setInterval(fetchNationalResults, 5000);
    return () => clearInterval(interval);
  }, []);

  const maxVotes = Math.max(...data.map(d => d.votes)) || 1;

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400">Loading Live Data...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10">
      
      <div className="flex justify-between items-end mb-12">
        <div>
          <h3 className="text-lg font-bold text-slate-500 uppercase tracking-wide">Presidential Standings</h3>
          <p className="text-sm text-slate-400">Live National Tally</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-slate-900">{totalVotes.toLocaleString()}</div>
          <div className="text-xs font-bold text-slate-400 uppercase">Total Votes</div>
        </div>
      </div>

      {/* 📊 THE UPRIGHT GRAPH */}
      <div className="relative h-64 md:h-80 w-full flex items-end justify-around gap-2 md:gap-8 border-b-2 border-slate-100 pb-0">
        
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
          <div className="border-t border-dashed border-slate-200 w-full h-0"></div>
          <div className="border-t border-dashed border-slate-200 w-full h-0"></div>
          <div className="border-t border-dashed border-slate-200 w-full h-0"></div>
        </div>

        {data.map((candidate) => {
          const heightPercent = totalVotes > 0 ? (candidate.votes / maxVotes) * 100 : 0;
          const votePercent = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : "0";

          return (
            <div key={candidate.id} className="group relative flex flex-col items-center justify-end w-full h-full z-10">
              
              {/* Tooltip */}
              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs py-1 px-2 rounded mb-2 whitespace-nowrap z-20 pointer-events-none">
                {candidate.name}
              </div>

              {/* The Bar */}
              <div 
                className={`w-full max-w-[60px] md:max-w-[80px] rounded-t-lg transition-all duration-1000 ease-out relative ${candidate.color} hover:brightness-110 shadow-lg cursor-pointer`}
                style={{ height: `${heightPercent}%`, minHeight: '10px' }}
              >
                <div className="absolute -top-8 w-full text-center font-bold text-slate-700 text-sm">
                  {votePercent}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🏷️ LABELS */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((candidate) => (
          <div key={candidate.id} className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="font-bold text-slate-900 text-sm truncate">{candidate.name}</div>
            <div className={`text-[10px] font-black uppercase tracking-wider ${candidate.color.replace('bg-', 'text-')} opacity-80`}>
              {candidate.party}
            </div>
            <div className="mt-2 text-xl font-black text-slate-800">
              {candidate.votes.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-dashed border-slate-200">
        <a 
          href="https://affiliate.iqoption.net/redir/?aff=756918&aff_model=revenue&afftrack=" 
          target="_blank" 
          className="block bg-slate-900 text-white rounded-lg p-3 text-center text-xs font-medium hover:bg-slate-800 transition-colors"
        >
          Sponsored: <span className="text-[#00dd00] font-bold">Market Analysis provided by IQ Option.</span> Trade responsibly.
        </a>
      </div>

    </div>
  );
}