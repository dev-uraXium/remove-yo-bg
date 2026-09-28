import React from 'react';
import { ShieldCheck, Scale, Layers } from 'lucide-react';
import { UraxiumBottomWave } from './WaveGraphics';

interface FooterProps {
  onNavigate: (page: 'workspace' | 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative w-full z-20 overflow-hidden mt-auto">
      {/* Wave top border matching exact uraxium.vercel.app footer */}
      <div className="w-full leading-none overflow-hidden select-none pointer-events-none -mb-[1px]">
        <UraxiumBottomWave className="w-full h-16 sm:h-24 md:h-32 block" />
      </div>

      {/* Footer Content Bar in warm rich dark tone */}
      <div className="px-5 sm:px-8 md:px-10 pb-12 pt-6 bg-[#222222] border-t border-[#F6DFA6]/10 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#F6DFA6] to-[#c9833b] p-[1.5px] shadow-sm">
              <div className="w-full h-full rounded-[9px] bg-[#171717] flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-[#F6DFA6]" />
              </div>
            </div>
            <span className="font-extrabold text-[#fff4d8] text-base tracking-tight drop-shadow-sm">
              IsolateBG
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6 font-semibold uppercase tracking-wider text-xs sm:text-sm">
            <button
              onClick={() => onNavigate('workspace')}
              className="text-[#a89f94] hover:text-[#F6DFA6] transition-colors"
            >
              Studio
            </button>
            <button
              onClick={() => onNavigate('privacy')}
              className="text-[#a89f94] hover:text-[#F6DFA6] transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#F6DFA6]" />
              <span>Privacy Policy</span>
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="text-[#a89f94] hover:text-[#F6DFA6] transition-colors flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-[#F6DFA6]" />
              <span>Terms & Conditions</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
