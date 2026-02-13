// app/counties/page.tsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma'; // Assumes you have prisma set up

export default async function CountiesPage() {
  // Fetch counties from DB (or use static list if prefered)
  const counties = await prisma.county.findMany({ orderBy: { code: 'asc' } });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Select Your County</h1>
          <p className="text-lg text-gray-600">Choose your registered voting location to view your specific ballot.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {counties.map((county) => (
            <Link 
              href={`/vote/${county.id}`} 
              key={county.id}
              className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-xl border border-gray-200 hover:border-[#BB0000] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Code {county.code}</span>
                <span className="w-2 h-2 rounded-full bg-gray-200 group-hover:bg-[#006600] transition-colors"></span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#BB0000] transition-colors">
                {county.name}
              </h3>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 font-medium group-hover:translate-x-1 transition-transform">
                Proceed to Ballot →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}