"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

type CountyResult = {
  candidateName: string;
  votes: number;
};

// Kenya Colors: Green, Black, Red, Gray
const COLORS = ["#006600", "#000000", "#BB0000", "#4B5563", "#9CA3AF"];

export default function CountyResults({
  countyId,
  refreshKey,
}: {
  countyId: string;
  countyName?: string;
  refreshKey: number;
}) {
  const [data, setData] = useState<CountyResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/results?countyId=${countyId}`);
        const json = await res.json();
        if (json.results) {
          setData(json.results);
          setTotalVotes(json.results.reduce((acc: number, c: CountyResult) => acc + c.votes, 0));
        }
      } catch (err) {
        console.error("Failed to load results", err);
      }
    }
    fetchData();
  }, [countyId, refreshKey]);

  if (data.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">No votes cast in this county yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-900 uppercase tracking-wide text-sm">Live County Tally</h3>
        <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">
          {totalVotes.toLocaleString()} Votes
        </span>
      </div>
      
      <div className="p-5 h-75 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ left: 0, right: 30 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="candidateName" 
              type="category" 
              width={110} 
              tick={{ fontSize: 11, fill: '#111827', fontWeight: 600 }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#000', fontWeight: 'bold' }}
              cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}