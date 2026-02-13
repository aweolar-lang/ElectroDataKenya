import { prisma } from "@/lib/prisma";
import VotingPanel from "@/components/VotingPanel";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConsentGuard from "@/components/ConsentGuard"; // 👈 IMPORT THE GUARD

export const dynamic = "force-dynamic";

export default async function VotePage({
  params,
}: {
  params: Promise<{ countyId: string }>;
}) {
  // 1. Await params
  const { countyId } = await params;

  // 2. Fetch County
  const county = await prisma.county.findUnique({
    where: { id: countyId },
    include: {
      constituencies: { orderBy: { name: 'asc' } }
    }
  });

  if (!county) return notFound();

  // 3. Fetch Candidates
  const candidates = await prisma.candidate.findMany({
    where: { homeCountyId: county.id },
  });

  const presCandidates = await prisma.candidate.findMany({ where: { office: "president" } });
  const govCandidates = candidates.filter((c) => c.office === "governor");
  const mpCandidates = candidates.filter((c) => c.office === "mp");

  // 4. Calculate Leading Governor
  const govVotes = await prisma.vote.groupBy({
    by: ['candidateId'],
    where: {
      countyId: county.id,
      candidate: { office: 'governor' }
    },
    _count: {
      candidateId: true 
    },
    orderBy: {
      _count: {
        candidateId: 'desc' 
      }
    },
    take: 1
  });

  let leadingGov = null;
  let leadingGovVotes = 0;

  if (govVotes.length > 0) {
    leadingGov = await prisma.candidate.findUnique({
      where: { id: govVotes[0].candidateId }
    });
    leadingGovVotes = govVotes[0]._count.candidateId;
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* 👇 REPLACE ConsentModal WITH ConsentGuard */}
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

      {/* LEADING CANDIDATE BANNER */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">
                  Current Data Trend
                </div>
                <h2 className="text-2xl font-black">
                  Leading for Governor
                </h2>
                <p className="text-slate-400 text-sm max-w-xl mt-2">
                  Based on collected data, this is the current preferred candidate. 
                  (Leading MP is shown in the constituency breakdown below).
                </p>
              </div>

              {/* The Leader Card */}
              {leadingGov ? (
                <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 min-w-75">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-xl text-white">
                    {leadingGov.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-lg font-bold">{leadingGov.name}</div>
                    <div className="text-sm text-emerald-400">{leadingGov.party || "Independent"}</div>
                    <div className="text-xs text-slate-500 mt-1">{leadingGovVotes} verified submissions</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 min-w-75">
                   <div className="text-slate-400 italic">No data collected yet. Be the first.</div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <VotingPanel
          countyId={county.id}
          countyName={county.name}
          constituencies={county.constituencies}
          presCandidates={presCandidates}
          govCandidates={govCandidates}
          mpCandidates={mpCandidates}
        />
      </div>
    </main>
  );
}