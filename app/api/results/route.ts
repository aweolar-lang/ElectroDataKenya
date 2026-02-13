import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countyId = searchParams.get("countyId");

    // 1. Build Filter: If countyId is "undefined" or missing, fetch NATIONAL (empty object)
    // We strictly check if countyId is a valid string to prevent DB errors
    const whereClause = (countyId && countyId !== "undefined" && countyId !== "null") 
      ? { countyId: countyId } 
      : {};

    // 2. Optimized Aggregation
    // We use a try/catch specifically around the Prisma call to handle timeouts gracefully
    let results;
    try {
      results = await prisma.vote.groupBy({
        by: ['candidateId'],
        where: whereClause,
        _count: {
          candidateId: true,
        },
        // Safety: limit the query time (optional, relies on DB config, but good to keep logic simple)
      });
    } catch (dbError) {
      console.error("Database Timeout or Connection Error:", dbError);
      // Fallback: Return empty data instead of crashing the app
      return NextResponse.json({ votes: {}, total: 0 }, { status: 200 });
    }

    
    const formattedResults: Record<string, number> = {};
    
    if (results) {
     
      results.forEach((r: { candidateId: string | null; _count: { candidateId: number } }) => {
        if (r.candidateId) { // Safety check
          formattedResults[r.candidateId] = r._count.candidateId;
        }
      });
    }

    // 4. Calculate Total
    const totalVotes = Object.values(formattedResults).reduce((a, b) => a + b, 0);

    return NextResponse.json({ 
      votes: formattedResults,
      total: totalVotes
    });

  } catch (error) {
    console.error("Results API Fatal Error:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
