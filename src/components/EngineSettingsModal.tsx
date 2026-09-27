import React from 'react';
import { X, Cpu, Zap, Shield, Check, Info } from 'lucide-react';
import { EngineSettings, ModelQuality } from '../types';

interface EngineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EngineSettings;
  onUpdateSettings: (newSettings: EngineSettings) => void;
}

export const EngineSettingsModal: React.FC<EngineSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const models: { id: ModelQuality; name: string; size: string; desc: string }[] = [
    {
      id: 'isnet_quint8',
      name: 'ISNet Quint8 (Fastest)',
      size: '~15 MB',
      desc: 'Optimized 8-bit quantized weights for rapid processing and low RAM usage.',
    },
    {
      id: 'isnet_fp16',
      name: 'ISNet FP16 (Balanced)',
      size: '~29 MB',
      desc: 'Half-precision floating point. Optimal balance of fine edge hair detail and speed.',
    },
    {
      id: 'isnet',
      name: 'ISNet Full Precision (Max Quality)',
      size: '~44 MB',
      desc: '32-bit unquantized model for maximum boundary accuracy on intricate subjects.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">WASM Neural Engine Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model Selection */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-neutral-200 uppercase tracking-wider block">
            Segmentation Model Precision
          </label>
          <div className="space-y-2">
            {models.map((m) => {
              const isSelected = settings.modelQuality === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onUpdateSettings({ ...settings, modelQuality: m.id })}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-neutral-800 bg-neutral-950/50 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-950'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-2">
                      <span>{m.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </span>
                    <span className="text-neutral-500 font-mono text-[11px]">{m.size}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Runtime Diagnostics */}
        <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800/80 text-xs space-y-2">
          <div className="font-semibold text-neutral-300 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local Execution Environment</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400 font-mono tabular-nums">
            <div>WASM Runtime: <span className="text-emerald-400">Supported</span></div>
            <div>Web Workers: <span className="text-emerald-400">Enabled</span></div>
            <div>CPU Cores: <span className="text-neutral-200">{navigator.hardwareConcurrency || 4} threads</span></div>
            <div>Privacy: <span className="text-emerald-400">100% Client-Side</span></div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
