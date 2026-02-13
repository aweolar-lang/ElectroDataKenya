"use client";

import { useState } from "react";

interface Candidate {
  id: string;
  name: string;
  party?: string | null;
  office?: string;
  bio?: string | null;
  photoUrl?: string | null;
  constituencyId?: string | null;
}

interface Props {
  candidate: Candidate;
  countyId: string;
  isSelected: boolean; // ✅ Received from parent
  onVoteSuccess: () => void;
}

export default function CandidateCard({ candidate, countyId, isSelected, onVoteSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    // If already selected, do nothing (prevent double submission)
    if (isSelected) return;

    // Consent Check
    const consent = localStorage.getItem("consent_given");
    if (!consent || consent !== "1") {
      alert("Please accept the privacy terms at the top of the page first.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    
    try {
      let sessionId = localStorage.getItem("anon_session");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("anon_session", sessionId);
      }
      
      const res = await fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          countyId,
          candidateId: candidate.id,
          constituencyId: candidate.constituencyId || null,
        }),
      });

      if (!res.ok) throw new Error("Vote failed");

      // Notify parent to update visual selection
      onVoteSuccess();
    } catch (err) {
      console.error(err);
      alert("Connection error. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col gap-3
        ${isSelected 
          ? "border-green-500 bg-green-50 shadow-md transform scale-[1.02]" 
          : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
        }
      `}
    >
      {/* Status Badge */}
      {isSelected && (
        <div className="absolute -top-3 right-4 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-sm">
          Selected
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Avatar Placeholder */}
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border
          ${isSelected 
            ? "bg-green-500 text-white border-green-500" 
            : "bg-slate-100 text-slate-500 border-slate-200"
          }
        `}>
          {candidate.name.charAt(0)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 truncate">{candidate.name}</h4>
          <p className="text-xs font-bold text-slate-500 uppercase truncate">
            {candidate.party || "Independent"}
          </p>
        </div>
      </div>

      <button
        onClick={handleVote}
        disabled={loading || isSelected}
        className={`
          w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all
          ${loading 
            ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
            : isSelected
              ? "bg-green-600 text-white shadow-lg cursor-default"
              : "bg-slate-900 text-white hover:bg-black shadow-md hover:shadow-lg active:scale-95"
          }
        `}
      >
        {loading ? "Recording..." : isSelected ? "✓ Voted" : "Vote"}
      </button>
    </div>
  );
}
