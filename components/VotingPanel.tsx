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

export default function VotingPanel({
  countyId,
  countyName,
  constituencies,
  presCandidates,
  govCandidates,
  mpCandidates
}: {
  countyId: string;
  countyName?: string;
  constituencies: Constituency[];
  presCandidates: Candidate[];
  govCandidates: Candidate[];
  mpCandidates: Candidate[];
}) {
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [selectedConstId, setSelectedConstId] = useState<string>("");
  
  // ✅ NEW: Track selected candidate ID for each office to enforce single selection
  // Example: { president: "ruto-id", governor: "sakaja-id", mp: "kj-id" }
  const [selections, setSelections] = useState<Record<string, string>>({});

  // Callback when a child card successfully submits a vote
  const handleVoteSuccess = (candidateId: string, office: string) => {
    // 1. Update visual selection (deselects others in same office)
    setSelections((prev) => ({
      ...prev,
      [office]: candidateId
    }));
    // 2. Refresh the results graph
    setRefreshKey((k) => k + 1);
  };

  // Filter MPs based on selection
  const filteredMps = selectedConstId 
    ? mpCandidates.filter(c => c.constituencyId === selectedConstId)
    : [];

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
                // ✅ Check if THIS candidate is the one selected for their office
                isSelected={selections[officeKey] === c.id}
                // ✅ Pass the office key so we know which group to update
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT: Ballot Area */}
      <div className="lg:col-span-8">
        
        {/* 1. PRESIDENTIAL (Pass "president" as officeKey) */}
        {renderSection("Presidential Ballot", presCandidates, "president", "No candidates found.")}
        
        {/* 2. GOVERNOR (Pass "governor" as officeKey) */}
        {renderSection(`Governor - ${countyName}`, govCandidates, "governor", "No candidates found.")}

        {/* 3. CONSTITUENCY SELECTOR */}
        <div className="bg-black text-white p-6 rounded-xl shadow-lg mb-8">
          <label className="block text-sm font-bold uppercase tracking-widest mb-2 text-green-400">
            Step 3: Select Constituency
          </label>
          <h3 className="text-xl font-bold mb-4">Where are you voting for MP?</h3>
          
          {/* ✅ FIXED: Added bg-white to ensure text is visible on all screens */}
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

        {/* 4. MP BALLOT (Pass "mp" as officeKey) */}
        {selectedConstId && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderSection(
              `Member of Parliament - ${constituencies.find(c => c.id === selectedConstId)?.name}`, 
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
  );
}
