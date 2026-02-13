import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Ensure this route is not cached so users see real-time updates
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch all votes with their related candidate details
    // distinct: ['id'] is not needed here as we want raw counts
    const votes = await prisma.vote.findMany({
      include: {
        candidate: {
          select: { id: true, name: true, office: true, party: true }
        }
      }
    });

    // --- Aggregation Logic ---
    
    // Data structures to hold our counts
    const nationalCounts: Record<string, { candidateId: string, name: string, votes: number }> = {};
    const countyCounts: Record<string, Record<string, { candidateId: string, name: string, votes: number }>> = {};
    
    let totalPresVotes = 0;

    for (const vote of votes) {
      // A. National Aggregation (President only)
      if (vote.candidate.office === 'president') {
        if (!nationalCounts[vote.candidateId]) {
          nationalCounts[vote.candidateId] = { 
            candidateId: vote.candidateId, 
            name: vote.candidate.name, 
            votes: 0 
          };
        }
        nationalCounts[vote.candidateId].votes += 1;
        totalPresVotes += 1;
      }

      // B. County Aggregation (All roles - President, Governor, MP, etc.)
      if (!countyCounts[vote.countyId]) {
        countyCounts[vote.countyId] = {};
      }
      
      if (!countyCounts[vote.countyId][vote.candidateId]) {
        countyCounts[vote.countyId][vote.candidateId] = {
           candidateId: vote.candidateId,
           name: vote.candidate.name,
           votes: 0
        };
      }
      countyCounts[vote.countyId][vote.candidateId].votes += 1;
    }

    // --- Formatting for UI ---

    // 1. Format National Results (Sorted by highest votes)
    const national = Object.values(nationalCounts)
      .map(c => ({
        ...c,
        score: totalPresVotes > 0 ? c.votes / totalPresVotes : 0
      }))
      .sort((a, b) => b.votes - a.votes);

    // 2. Format County Results
    const byCounty: Record<string, Array<{ candidateId: string; name: string; votes: number; score: number }>> = {};
    for (const [cId, candidates] of Object.entries(countyCounts)) {
      const totalInCounty = Object.values(candidates).reduce((sum, c) => sum + c.votes, 0);
      
      byCounty[cId] = Object.values(candidates)
        .map(c => ({
          ...c,
          score: totalInCounty > 0 ? c.votes / totalInCounty : 0
        }))
        .sort((a, b) => b.votes - a.votes);
    }

    return NextResponse.json({
      national,
      byCounty,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error("Prediction API Error:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}