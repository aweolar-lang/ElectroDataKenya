"use client";

import { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  onAccept: () => void;
  onClose: () => void;
};

export default function ConsentModal({ isOpen, onAccept, onClose }: Props) {
  const [animate, setAnimate] = useState(false);

  // Handle animation when 'isOpen' changes
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow render before animating in
      requestAnimationFrame(() => setAnimate(true));
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-[100] flex items-center justify-center p-4 
        bg-slate-900/70 backdrop-blur-sm transition-opacity duration-300 ease-out
        ${animate ? "opacity-100" : "opacity-0"}
      `}
    >
      <div 
        className={`
          bg-white dark:bg-slate-950 w-full max-w-lg rounded-2xl shadow-2xl 
          border border-slate-200 dark:border-slate-800 overflow-hidden 
          transform transition-all duration-300 ease-out
          ${animate ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}
        `}
      >
        
        {/* Decorative Top Strip (Kenya Colors) */}
        <div className="h-1.5 w-full bg-gradient-to-r from-black via-[#BB0000] to-[#006600]"></div>

        {/* Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🇰🇪</span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Civic Observer <span className="text-[#006600]">2027</span>
            </h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Independent Data Collection & Privacy Agreement
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-2 space-y-4 max-h-[60vh] overflow-y-auto">
           
           {/* Info Alert */}
           <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
             <div className="flex gap-3 items-start">
               <span className="text-lg">⚖️</span>
               <div>
                 <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm">Legal Disclaimer</h4>
                 <p className="text-xs text-blue-800 dark:text-blue-400 mt-1 leading-relaxed">
                   This platform is for <strong>civic education and statistical observation only</strong>. It is not affiliated with the IEBC or the Government of Kenya. Results shown are aggregated from user submissions on this site.
                 </p>
               </div>
             </div>
           </div>

           {/* Privacy Points */}
           <div className="space-y-3 pt-2">
             <div className="flex gap-3 items-start">
               <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                 🛡️
               </div>
               <div>
                 <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">100% Anonymous</h5>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                   We strictly <strong>do not collect</strong> names, phone numbers, ID numbers, or biometric data. Your vote is linked only to a random session ID.
                 </p>
               </div>
             </div>

             <div className="flex gap-3 items-start">
               <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                 🍪
               </div>
               <div>
                 <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Local Storage Policy</h5>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                   We use browser local storage to prevent double voting and maintain session integrity. By continuing, you consent to this data usage.
                 </p>
               </div>
             </div>
           </div>
        </div>

        {/* Footer / Action */}
        <div className="p-6 mt-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
           <button 
             onClick={onClose}
             className="text-xs text-slate-400 font-bold hover:text-slate-600 uppercase tracking-wider"
           >
             Decline & Exit
           </button>
           <button 
             onClick={onAccept}
             className="w-full sm:w-auto px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:transform hover:scale-[1.02] active:scale-95 transition-all"
           >
             I Understand & Accept
           </button>
        </div>

      </div>
    </div>
  );
}