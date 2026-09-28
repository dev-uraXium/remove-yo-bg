import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, HardDrive } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border border-[#a89f94]/25 bg-gradient-to-b from-[#222222]/80 to-[#171717] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl glass-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#F6DFA6] text-xs font-bold uppercase tracking-wider mb-1 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Knowledge Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#fff4d8]">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#a89f94] mt-1 font-mono">
              Last updated: September 2026 · Effective immediately
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold text-[#171717] bg-gradient-to-r from-[#F6DFA6] to-[#c9833b] hover:brightness-110 rounded-xl transition-all shadow-md glow-gold"
          >
            ← Back to App
          </button>
        </div>

        {/* Highlight Callout */}
        <div className="p-4 bg-[#F6DFA6]/10 border border-[#F6DFA6]/30 rounded-2xl text-xs text-[#fff4d8] leading-relaxed flex items-start gap-3">
          <Lock className="w-5 h-5 text-[#F6DFA6] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#F6DFA6]">Core Guarantee: </span>
            Your images never leave your computer or phone. All background segmentation, neural inference, and image compositing happen strictly inside your browser via client-side WebAssembly (WASM). No files are uploaded to any server or cloud storage.
          </div>
        </div>
      </div>

      {/* Policy Content Sections */}
      <div className="border border-[#a89f94]/20 bg-[#222222]/40 rounded-3xl p-6 sm:p-8 space-y-8 text-[#fff4d8]/90 text-xs leading-relaxed glass-panel">
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-[#F6DFA6] uppercase tracking-wider flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#c9833b] inline-block" />
            1. Information We Do Not Collect
          </h2>
          <p className="text-[#a89f94]">
            Because IsolateBG operates as a client-side WebAssembly application, we do not collect, view, transmit, process, or store:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-[#a89f94] pl-2">
            <li>Any photos, graphics, scans, or imagery uploaded by you.</li>
            <li>Biometric, facial recognition, or facial geometry data.</li>
            <li>Metadata or EXIF tags embedded within uploaded media (e.g. camera model, GPS coordinates, timestamps).</li>
            <li>Account credentials or personal identifiers (we do not require accounts or logins).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-[#F6DFA6] uppercase tracking-wider flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#c9833b] inline-block" />
            2. How Local Processing Works
          </h2>
          <p className="text-[#a89f94]">
            When you add an image by drag-and-drop, browsing files, or clipboard paste:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-4 bg-[#171717] rounded-2xl border border-[#a89f94]/25 space-y-1.5">
              <div className="font-bold text-[#fff4d8] flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#F6DFA6]" />
                <span>Local Memory Only</span>
              </div>
              <p className="text-[11px] text-[#a89f94]">
                The image file is loaded strictly into your device's browser heap memory via an ephemeral <code className="text-[#F6DFA6]">blob:</code> URL.
              </p>
            </div>

            <div className="p-4 bg-[#171717] rounded-2xl border border-[#a89f94]/25 space-y-1.5">
              <div className="font-bold text-[#fff4d8] flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#F6DFA6]" />
                <span>Zero Server Handoff</span>
              </div>
              <p className="text-[11px] text-[#a89f94]">
                The neural segmentation calculations execute locally using on-device CPU threads through WebAssembly.
              </p>
            </div>

            <div className="p-4 bg-[#171717] rounded-2xl border border-[#a89f94]/25 space-y-1.5">
              <div className="font-bold text-[#fff4d8] flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-[#F6DFA6]" />
                <span>Instant Deletion</span>
              </div>
              <p className="text-[11px] text-[#a89f94]">
                When you click "Clear Queue" or close your browser tab, all allocated image memory is immediately purged.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-[#F6DFA6] uppercase tracking-wider flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#c9833b] inline-block" />
            3. Model Weights & Content Delivery (CDN)
          </h2>
          <p className="text-[#a89f94]">
            To perform neural background segmentation, the browser may download static, open-source model weights (such as ISNet ONNX weights) from a content delivery network (CDN) upon first run. These requests download the neural network weights into your browser's standard cache. Your photos are never sent back in return.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-[#F6DFA6] uppercase tracking-wider flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#c9833b] inline-block" />
            4. Cookies and Local Storage
          </h2>
          <p className="text-[#a89f94]">
            We do not use advertising cookies, tracking pixels, or third-party profiling scripts. Optional user preferences (such as selected model precision) are retained solely in client-side runtime state.
          </p>
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
