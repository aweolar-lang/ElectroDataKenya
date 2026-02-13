"use client";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from "recharts";

type CandidateStat = {
  candidateId: string;
  name: string;
  votes: number;
  party: string;
};

const COLORS = ["#000000", "#BB0000", "#006600", "#4B5563"];

export default function NationalResults() {
  const [national, setNational] = useState<CandidateStat[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/predict");
        const json = await res.json();
        // Take top 5 for the chart
        setNational((json.national || []).slice(0, 5));
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  if (!national.length) return <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">Loading Polls...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
        <h3 className="text-lg font-bold text-gray-900">Presidential Race</h3>
        <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded">LIVE</span>
      </div>
      
      <div className="h-62.5 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={national} layout="vertical" margin={{ left: 0, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100} 
              tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }} 
            />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="votes" barSize={24} radius={[0, 4, 4, 0]}>
              {national.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}