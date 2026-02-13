import { prisma } from "@/lib/prisma";
import VotingPanel from "@/components/VotingPanel";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConsentGuard from "@/components/ConsentGuard";

export const dynamic = "force-dynamic";

export default async function VotePage({
  params,
}: {
  params: Promise<{ countyId: string }>;
}) {
  const { countyId } = await params;

  // 1. Fetch County
  const county = await prisma.county.findUnique({
    where: { id: countyId },
    include: {
      constituencies: { orderBy: { name: 'asc' } }
    }
  });

  if (!county) return notFound();

  // 2. Fetch Candidates
  const candidates = await prisma.candidate.findMany({
    where: { homeCountyId: county.id },
  });

  const presCandidates = await prisma.candidate.findMany({ where: { office: "president" } });
  const govCandidates = candidates.filter((c) => c.office === "governor");
  const mpCandidates = candidates.filter((c) => c.office === "mp");

  // 3. STATS: Total County Votes
  const totalCountyVotes = await prisma.vote.count({
    where: { countyId: county.id }
  });

  // 4. STATS: Leading Governor
  const govStats = await prisma.vote.groupBy({
    by: ['candidateId'],
    where: { countyId: county.id, candidate: { office: 'governor' } },
    _count: { candidateId: true },
    orderBy: { _count: { candidateId: 'desc' } },
    take: 1
  });

  let leadingGov = null;
  if (govStats.length > 0) {
    const gov = await prisma.candidate.findUnique({ where: { id: govStats[0].candidateId }});
    if (gov) {
      leadingGov = { ...gov, votes: govStats[0]._count.candidateId };
    }
  }

  // 5. STATS: Leading MP per Constituency
  // We fetch all votes grouped by constituency + candidate to find the winner for each area
  const mpStats = await prisma.vote.groupBy({
    by: ['constituencyId', 'candidateId'],
    where: { countyId: county.id, candidate: { office: 'mp' } },
    _count: { candidateId: true },
    orderBy: { _count: { candidateId: 'desc' } },
  });

  const leadingMpMap: Record<string, {name: string, party: string, votes: number}> = {};
  
  // Logic: The first entry for each constituencyId is the winner (because of 'desc' sort)
  for (const stat of mpStats) {
    if (stat.constituencyId && !leadingMpMap[stat.constituencyId]) {
      const cand = candidates.find(c => c.id === stat.candidateId);
      if (cand) {
        leadingMpMap[stat.constituencyId] = {
          name: cand.name,
          party: cand.party || "Independent",
          votes: stat._count.candidateId
        };
      }
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <ConsentGuard />
      
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="px-3 py-1 text-sm font-medium bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors">
              ← Back to Map
            </Link>
            <h1 className="text-xl font-bold truncate">
              {county.name} County <span className="text-slate-400 font-normal">#{county.code}</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content: We now pass the stats into the panel */}
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <VotingPanel
          countyId={county.id}
          countyName={county.name}
          constituencies={county.constituencies}
          presCandidates={presCandidates}
          govCandidates={govCandidates}
          mpCandidates={mpCandidates}
          // New Props
          totalVotes={totalCountyVotes}
          leadingGov={leadingGov}
          leadingMpMap={leadingMpMap}
        />
      </div>
    </main>
  );
}