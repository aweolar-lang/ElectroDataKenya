import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 1. FIX SCHEMA: Allow nulls so it doesn't crash on President/Governor votes
const voteSchema = z.object({
  sessionId: z.string().min(1),
  countyId: z.string().min(1),
  candidateId: z.string().min(1),
  constituencyId: z.string().nullable().optional(), // Changed to support null
  metadata: z.any().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 2. Validate the input
    const { sessionId, countyId, candidateId, constituencyId } = voteSchema.parse(body);

    // 3. Fetch the candidate to know their "office"
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // 4. Check for existing vote for this *OFFICE*
    const existingVote = await prisma.vote.findFirst({
      where: {
        sessionId: sessionId,
        candidate: {
          office: candidate.office, 
        },
      },
    });

    if (existingVote) {
      // Option B: Allow "changing mind" - Update the vote
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { 
          candidateId: candidateId,
          countyId: countyId,
          // FIX: Update constituency too (use null if not provided)
          constituencyId: constituencyId || null 
        },
      });
      
      return NextResponse.json({ success: true, status: "updated" });
    }

    // 5. Create a fresh vote
    await prisma.vote.create({
      data: {
        sessionId,
        countyId,
        candidateId,
        // FIX: Actually save the constituencyId to the database
        constituencyId: constituencyId || null, 
      },
    });

    return NextResponse.json({ success: true, status: "created" });

  } catch (error) {
    console.error("Vote API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}