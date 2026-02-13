"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type CandidateStat = {
  candidateId: string;
  name: string;
  votes: number;
  party: string;
};

// Official Party Colors
const PARTY_COLORS: Record<string, string> = {
  "UDA": "#FFD700", // Yellow
  "ODM": "#FFA500", // Orange
  "Jubilee": "#DC2626", // Red
  "Wiper": "#2563EB", // Blue
  "Independent": "#6B7280", // Gray
  "Other": "#9CA3AF"
};

export default function PartyResults() {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    async function load() {
      try {
        // We reuse the existing prediction API
        const res = await fetch("/api/predict");
        const json = await res.json();
        
        // Aggregate votes by party
        const partyMap: Record<string, number> = {};
        (json.national || []).forEach((c: CandidateStat) => {
          const p = c.party || "Independent";
          partyMap[p] = (partyMap[p] || 0) + c.votes;
        });

        // Convert to array for chart
        const chartData = Object.entries(partyMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        setData(chartData);
      } catch (e) {
        console.error("Failed to load party stats");
      }
    }
    load();
  }, []);

  if (data.length === 0) return <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
        Party Strength
      </h3>
      <div className="h-62.5 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PARTY_COLORS[entry.name] || PARTY_COLORS["Other"]} 
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-2">
        <p className="text-xs text-gray-500">
          Leading Party: <span className="font-bold text-black">{data[0]?.name}</span> ({data[0]?.value.toLocaleString()} votes)
        </p>
      </div>
    </div>
  );
}