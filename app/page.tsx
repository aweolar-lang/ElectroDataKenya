"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LiveResultsGraph from '@/components/LiveResultsGraph'; 
import ConsentModal from '@/components/ConsentModal';

export default function HomePage() {
  const router = useRouter();
  const [showConsent, setShowConsent] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  // Check consent on mount
  useEffect(() => {
    const consent = localStorage.getItem("consent_given");
    if (consent) {
      setHasConsented(true);
    }
  }, []);

  const handleParticipateClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop default link behavior
    
    if (hasConsented) {
      router.push('/counties');
    } else {
      setShowConsent(true);
    }
  };

  const handleConsentAccept = () => {
    localStorage.setItem("consent_given", "1");
    if (!localStorage.getItem("anon_session")) {
      localStorage.setItem("anon_session", crypto.randomUUID());
    }
    setHasConsented(true);
    setShowConsent(false);
    router.push('/counties'); // Auto-redirect after accept
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans flex flex-col">
      
      {/* Controlled Consent Modal - Opens when user clicks Participate if not consented */}
      <ConsentModal 
        isOpen={showConsent} 
        onAccept={handleConsentAccept}
        onClose={() => setShowConsent(false)}
      />

      {/* 🇰🇪 TOP HERO SECTION */}
      <header className="relative bg-black text-white overflow-hidden shrink-0">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-black via-red-600 to-green-600 z-20"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            
            <div className="text-center md:text-left md:w-1/2">
              <div className="inline-block px-3 py-1 mb-6 border border-red-600 rounded-full bg-red-900/20 text-red-400 text-xs font-bold tracking-[0.2em] uppercase">
                Official 2027 Civic Observer
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
                DECIDE <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700">KENYA&apos;S FUTURE</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                The most advanced civic engagement platform. View real-time aggregated public sentiment, analyze party strength, and record your preference securely.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button 
                  onClick={handleParticipateClick}
                  className="px-8 py-4 bg-[#BB0000] hover:bg-[#990000] text-white font-bold rounded-lg transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                >
                  Participate Now 🗳️
                </button>
                <a 
                  href="#results"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg backdrop-blur-sm transition-all flex items-center justify-center"
                >
                  View Data ↓
                </a>
              </div>
            </div>

            {/* Hero Graphic */}
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-80 h-80 rounded-full bg-gradient-to-tr from-green-900/20 to-red-900/20 blur-3xl animate-pulse absolute"></div>
              <div className="relative z-10 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md max-w-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center text-xl">🛡️</div>
                  <div>
                    <div className="font-bold text-white">Secure System</div>
                    <div className="text-xs text-gray-400">End-to-end Data Collection</div>
                  </div>
                </div>
                <div className="h-px w-full bg-white/10 my-4"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Registered Counties</span>
                  <span className="font-bold text-white">47 / 47</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 🟢 MAIN CONTENT AREA WITH SIDE ADS */}
      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        
        {/* 📢 LEFT AD SIDEBAR (Desktop Only) */}
        <aside className="hidden lg:flex w-48 flex-col gap-4 py-8 sticky top-0 h-screen overflow-y-auto border-r border-gray-200 bg-white p-4">
           <div className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Exclusive</div>
           <a 
             href="https://affiliate.iqoption.net/redir/?aff=756918&aff_model=revenue&afftrack="
             target="_blank"
             rel="noopener noreferrer"
             className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl p-4 flex flex-col items-center text-center hover:opacity-95 transition-all group shadow-lg"
           >
              <div className="w-12 h-12 bg-[#ff7b00] rounded-lg mb-4 flex items-center justify-center font-black text-white italic text-xl group-hover:scale-110 transition-transform">IQ</div>
              
              <h3 className="text-white font-bold text-lg leading-tight mb-2">Free Tournaments</h3>
              <p className="text-gray-400 text-xs mb-4">
                Compete for real prizes with zero entry fee.
              </p>
              
              <div className="w-full h-px bg-white/10 my-2"></div>
              
              <h3 className="text-[#00dd00] font-bold text-md leading-tight mb-2">Trade Crypto</h3>
              <p className="text-gray-400 text-xs mb-4">
                Bitcoin, Ethereum & 50+ Assets.
              </p>

              <button className="bg-[#00dd00] text-black font-bold py-2 px-4 rounded text-xs w-full uppercase mt-auto">Join Now</button>
           </a>
        </aside>

        {/* 📊 CENTER CONTENT */}
        <main className="flex-1 px-4 py-8 md:px-8">
          
          {/* Live Graphs Section */}
          <section id="results" className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900">Live Standings</h2>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase animate-pulse">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span> Live Updates
              </span>
            </div>
            
            {/* Upright Graph Component */}
            <LiveResultsGraph />
          </section>

          {/* Privacy Section */}
          <section className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 mb-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Transparency & Privacy</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div>
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl mb-3">👤</div>
                  <h3 className="font-bold text-gray-900 text-sm">Anonymous</h3>
                  <p className="text-xs text-gray-500 mt-1">No IDs or phones collected. Just your vote.</p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl mb-3">📚</div>
                  <h3 className="font-bold text-gray-900 text-sm">Civic Data</h3>
                  <p className="text-xs text-gray-500 mt-1">Real-time educational observation.</p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xl mb-3">🍪</div>
                  <h3 className="font-bold text-gray-900 text-sm">Secure</h3>
                  <p className="text-xs text-gray-500 mt-1">Encrypted local storage for integrity.</p>
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* 📢 RIGHT AD SIDEBAR (Desktop Only) */}
        <aside className="hidden lg:flex w-48 flex-col gap-4 py-8 sticky top-0 h-screen overflow-y-auto border-l border-gray-200 bg-white p-4">
           <div className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Benefits</div>
           <a 
             href="https://affiliate.iqoption.net/redir/?aff=756918&aff_model=revenue&afftrack="
             target="_blank"
             rel="noopener noreferrer"
             className="flex-1 bg-[#F2F2F2] rounded-xl p-4 flex flex-col items-center text-center hover:bg-[#e5e5e5] transition-all group border border-gray-300"
           >
              <div className="text-slate-900 font-black text-3xl mb-1">IQ</div>
              <div className="text-[#00dd00] font-bold text-sm uppercase tracking-wider mb-4">Option</div>
              
              <div className="w-full h-px bg-gray-300 mb-4"></div>
              
              <ul className="text-left w-full space-y-3 mb-6">
                <li className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
                  <span className="text-green-600">✓</span> CFDs & Forex
                </li>
                <li className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
                  <span className="text-green-600">✓</span> $10,000 Demo
                </li>
                <li className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
                  <span className="text-green-600">✓</span> Fast Withdrawals
                </li>
              </ul>

              <button className="bg-[#ff7b00] text-white font-bold py-3 px-4 rounded text-xs w-full uppercase shadow-md group-hover:shadow-lg transition-all">Start Trading</button>
           </a>
        </aside>

      </div>

      {/* 📞 FOOTER */}
      <footer className="bg-slate-950 text-gray-400 py-12 border-t border-gray-900 shrink-0">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white text-lg font-bold mb-4">StudyLite Kenya</h4>
            <p className="text-sm leading-relaxed max-w-xs">
              Empowering Kenyan citizens with data-driven insights. 
              Built for transparency, speed, and accuracy.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><button onClick={handleParticipateClick} className="hover:text-white text-left">Participate</button></li>
              <li><Link href="#results" className="hover:text-white">Live Results</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:aweolar@gmail.com" className="hover:text-white">aweolar@gmail.com</a></li>
              <li><a href="https://x.com/Ethandewatcher" target="_blank" className="hover:text-white">@Ethandewatcher</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}