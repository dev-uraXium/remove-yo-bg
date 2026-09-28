import React from 'react';
import { Scale, AlertTriangle } from 'lucide-react';

interface TermsAndConditionsProps {
  onBack: () => void;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border border-[#a89f94]/25 bg-gradient-to-b from-[#222222]/80 to-[#171717] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl glass-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#F6DFA6] text-xs font-bold uppercase tracking-wider mb-1 font-mono">
              <Scale className="w-4 h-4" />
              <span>Legal Agreement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#fff4d8]">
              Terms & Conditions
            </h1>
            <p className="text-xs text-[#a89f94] mt-1 font-mono">
              Last updated: September 2026 · Please review before use
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold text-[#171717] bg-gradient-to-r from-[#F6DFA6] to-[#c9833b] hover:brightness-110 rounded-xl transition-all shadow-md glow-gold"
          >
            ← Back to App
          </button>
        </div>

        <p className="text-xs text-[#a89f94] leading-relaxed">
          Welcome to IsolateBG. By accessing or using this in-browser background removal application, you agree to be bound by these Terms and Conditions.
        </p>
      </div>

      {/* Terms Sections */}
      <div className="border border-[#a89f94]/20 bg-[#222222]/40 rounded-3xl p-6 sm:p-8 space-y-8 text-[#fff4d8]/90 text-xs leading-relaxed glass-panel">
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-[#F6DFA6] uppercase tracking-wider flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#c9833b] inline-block" />
            1. Nature of the Service
          </h2>
          <p className="text-[#a89f94]">
            IsolateBG is an on-device, client-side utility designed to remove backgrounds from digital images using WebAssembly (WASM) neural network segmentation. The tool executes directly in the user's web browser environment without transmitting image data across external servers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-[#F6DFA6] uppercase tracking-wider flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#c9833b] inline-block" />
            2. Intellectual Property & Your Content
          </h2>
          <div className="space-y-2 text-[#a89f94]">
            <p>
              <strong className="text-[#fff4d8]">You retain 100% ownership</strong> of all photos, graphics, artwork, and visual materials you process with IsolateBG.
            </p>
            <p>
              Because your images remain solely in your device's memory, we do not claim any copyright, license, or distribution rights over your uploaded materials or the resulting transparent PNG files.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-[#F6DFA6] uppercase tracking-wider flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#c9833b] inline-block" />
            3. Disclaimer of Warranties
          </h2>
          <div className="p-4 bg-[#171717] rounded-2xl border border-[#a89f94]/25 text-[#a89f94] space-y-1.5">
            <div className="flex items-center gap-2 text-[#F6DFA6] font-bold text-xs font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-[#c9833b]" />
              <span>Provided "As Is"</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              The application is provided without warranties of any kind. While the neural segmentation algorithm achieves high edge accuracy on human hair, product rims, and animals, results may vary depending on lighting conditions and contrast.
            </p>
          </div>
        </section>
      </div>

      {/* Back button bottom */}
      <div className="flex justify-center">
        <button
          onClick={onBack}
          className="px-6 py-2.5 text-xs font-bold text-[#171717] bg-gradient-to-r from-[#F6DFA6] to-[#c9833b] hover:brightness-110 rounded-xl transition-all shadow-md glow-gold"
        >
          ← Return to IsolateBG
        </button>
      </div>
    </div>
  );
};
