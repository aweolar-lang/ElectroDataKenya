"use client";

import { useState } from "react";
import CandidateCard from "./CandidateCard";
import CountyResults from "./CountyResults";

interface Candidate {
  id: string;
  name: string;
  party?: string | null;
  office?: string;
  bio?: string | null;
  photoUrl?: string | null;
  constituencyId?: string | null;
}

interface Constituency {
  id: string;
  name: string;
}

// Helper types for the stats props
interface LeaderStats {
  name: string;
  party: string;
  votes: number;
}

export default function VotingPanel({
  countyId,
  countyName,
  constituencies,
  presCandidates,
  govCandidates,
  mpCandidates,
  leadingGov,
  leadingMpMap
}: {
  countyId: string;
  countyName?: string;
  constituencies: Constituency[];
  presCandidates: Candidate[];
  govCandidates: Candidate[];
  mpCandidates: Candidate[];
  leadingGov: LeaderStats | null;
  leadingMpMap: Record<string, LeaderStats>;
}) {
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [selectedConstId, setSelectedConstId] = useState<string>("");
  const [selections, setSelections] = useState<Record<string, string>>({});

  const handleVoteSuccess = (candidateId: string, office: string) => {
    setSelections((prev) => ({ ...prev, [office]: candidateId }));
    setRefreshKey((k) => k + 1);
  };

  const filteredMps = selectedConstId 
    ? mpCandidates.filter(c => c.constituencyId === selectedConstId)
    : [];

  // Get the leading MP for the currently selected constituency (if any)
  const currentMpLeader = selectedConstId ? leadingMpMap[selectedConstId] : null;
  const selectedConstName = constituencies.find(c => c.id === selectedConstId)?.name;

  const renderSection = (title: string, candidates: Candidate[], officeKey: string, emptyMsg: string, isHidden: boolean = false) => {
    if (isHidden) return null;
    return (
      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide">
            {title}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.length > 0 ? (
            candidates.map((c) => (
              <CandidateCard 
                key={c.id} 
                candidate={c} 
                countyId={countyId}
                // Pass constituencyId if it's an MP vote
                constituencyId={c.constituencyId || undefined}
                isSelected={selections[officeKey] === c.id}
                onVoteSuccess={() => handleVoteSuccess(c.id, officeKey)} 
              />
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-400 italic bg-gray-50 rounded-lg">
              {emptyMsg}
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div>
      {/* 🏆 DYNAMIC LEADER BANNER */}
      <div className="bg-slate-900 text-white rounded-xl shadow-xl overflow-hidden mb-8 border border-slate-800">
        <div className="p-6 md:p-8">
           <div className="flex flex-col gap-8">
              
              {/* ROW 1: Governor Leader */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">
                    County Projection
                  </div>
                  <h2 className="text-2xl font-black">Leading for Governor</h2>
                </div>
                {leadingGov ? (
                  <div className="flex items-center gap-4 bg-slate-800 p-3 pr-6 rounded-full border border-slate-700 min-w-70">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-xl text-white shrink-0">
                      {leadingGov.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-lg font-bold leading-tight">{leadingGov.name}</div>
                      <div className="text-xs text-emerald-400 font-bold">{leadingGov.party || "Indep."} • {leadingGov.votes} votes</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 italic text-sm">No data yet</div>
                )}
              </div>

              {/* ROW 2: MP Leader (Shows only when Constituency Selected) */}
              {selectedConstId && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="text-center md:text-left">
                    <div className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-1">
                      Constituency Projection
                    </div>
                    <h2 className="text-xl font-black text-slate-200">
                      MP: <span className="text-white">{selectedConstName}</span>
                    </h2>
                  </div>
                  
                  {currentMpLeader ? (
                    <div className="flex items-center gap-4 bg-slate-800 p-3 pr-6 rounded-full border border-blue-900/30 min-w-70">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg text-white shrink-0">
                        {currentMpLeader.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-md font-bold leading-tight">{currentMpLeader.name}</div>
                        <div className="text-xs text-blue-400 font-bold">{currentMpLeader.party || "Indep."} • {currentMpLeader.votes} votes</div>
                      </div>
                    </div>
                  ) : (
                     <div className="bg-slate-800/50 px-4 py-2 rounded-lg text-slate-400 italic text-xs border border-slate-700">
                        No votes in this constituency yet
                     </div>
                  )}
                </div>
              )}

           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Ballot Area */}
        <div className="lg:col-span-8">
          
          {renderSection("Presidential Ballot", presCandidates, "president", "No candidates found.")}
          
          {renderSection(`Governor - ${countyName}`, govCandidates, "governor", "No candidates found.")}

          {/* CONSTITUENCY SELECTOR */}
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg mb-8 border border-slate-800">
            <label className="block text-sm font-bold uppercase tracking-widest mb-2 text-emerald-400">
              Step 3: Parliamentary Vote
            </label>
            <h3 className="text-xl font-bold mb-4">Select your Constituency</h3>
            
            <div className="relative">
              <select 
                className="w-full p-4 pl-4 pr-10 bg-white text-slate-900 rounded-lg font-bold focus:ring-4 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
                value={selectedConstId}
                onChange={(e) => setSelectedConstId(e.target.value)}
              >
                <option value="">-- Click here to select --</option>
                {constituencies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {/* Custom Arrow Icon */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                ▼
              </div>
            </div>
          </div>

          {selectedConstId && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {renderSection(
                `Member of Parliament - ${selectedConstName}`, 
                filteredMps, 
                "mp",
                "No candidates found for this constituency."
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Live Results */}
        <div className="lg:col-span-4 sticky top-6 space-y-6">
          <CountyResults countyId={countyId} countyName={countyName} refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}