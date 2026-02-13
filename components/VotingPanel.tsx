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

// Stats Interface
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
  // 👇 New Stats Props
  totalVotes,
  leadingGov,
  leadingMpMap
}: {
  countyId: string;
  countyName?: string;
  constituencies: Constituency[];
  presCandidates: Candidate[];
  govCandidates: Candidate[];
  mpCandidates: Candidate[];
  // 👇 Add types here to fix the build error
  totalVotes: number;
  leadingGov: LeaderStats | null;
  leadingMpMap: Record<string, LeaderStats>;
}) {
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [selectedConstId, setSelectedConstId] = useState<string>("");
  
  // Single selection tracking
  const [selections, setSelections] = useState<Record<string, string>>({});

  const handleVoteSuccess = (candidateId: string, office: string) => {
    setSelections((prev) => ({ ...prev, [office]: candidateId }));
    setRefreshKey((k) => k + 1);
  };

  const filteredMps = selectedConstId 
    ? mpCandidates.filter(c => c.constituencyId === selectedConstId)
    : [];

  // Determine current MP leader based on selection
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
      {/* 🏆 DYNAMIC STATS BANNER */}
      <div className="bg-slate-900 text-white rounded-xl shadow-xl overflow-hidden mb-8 border border-slate-800">
        <div className="p-6 md:p-8">
          
          {/* Top Row: Total Votes & Governor */}
          <div className="flex flex-col md:flex-row gap-8 justify-between">
            
            {/* Total Votes */}
            <div className="min-w-37.5">
              <div className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">
                Total County Votes
              </div>
              <div className="text-4xl font-black">
                {totalVotes.toLocaleString()}
              </div>
            </div>

            {/* Governor Leader */}
            <div className="flex-1">
              <div className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">
                Leading Governor
              </div>
              {leadingGov ? (
                <div className="flex items-center gap-4 bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-xl text-white shrink-0">
                    {leadingGov.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-lg font-bold">{leadingGov.name}</div>
                    <div className="text-xs text-emerald-400 font-bold">
                      {leadingGov.party} • {leadingGov.votes} votes
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 italic text-sm">No votes yet.</div>
              )}
            </div>
          </div>

          {/* Bottom Row: MP Leader (Visible only if Constituency Selected) */}
          {selectedConstId && (
            <div className="mt-6 pt-6 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
              <div className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2">
                Leading MP - {selectedConstName}
              </div>
              {currentMpLeader ? (
                <div className="flex items-center gap-4 bg-slate-800 p-3 rounded-xl border border-blue-900/30">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg text-white shrink-0">
                    {currentMpLeader.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-md font-bold">{currentMpLeader.name}</div>
                    <div className="text-xs text-blue-400 font-bold">
                      {currentMpLeader.party} • {currentMpLeader.votes} votes
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 italic text-sm">No votes in this constituency yet.</div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* END BANNER */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Ballot Area */}
        <div className="lg:col-span-8">
          
          {renderSection("Presidential Ballot", presCandidates, "president", "No candidates found.")}
          
          {renderSection(`Governor - ${countyName}`, govCandidates, "governor", "No candidates found.")}

          {/* CONSTITUENCY SELECTOR */}
          <div className="bg-black text-white p-6 rounded-xl shadow-lg mb-8">
            <label className="block text-sm font-bold uppercase tracking-widest mb-2 text-green-400">
              Step 3: Select Constituency
            </label>
            <h3 className="text-xl font-bold mb-4">Where are you voting for MP?</h3>
            <select 
              className="w-full p-4 bg-white text-black rounded-lg font-bold focus:ring-4 focus:ring-green-500 outline-none border-none cursor-pointer"
              value={selectedConstId}
              onChange={(e) => setSelectedConstId(e.target.value)}
            >
              <option value="">-- Click to Select Constituency --</option>
              {constituencies.map(c => (
                <option key={c.id} value={c.id} className="text-black bg-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* MP BALLOT */}
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