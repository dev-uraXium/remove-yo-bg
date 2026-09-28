import React from 'react';
import { Cpu, Shield, Check } from 'lucide-react';
import { EngineSettings, ModelQuality } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const models: { id: ModelQuality; name: string; size: string; desc: string }[] = [
    {
      id: 'isnet_quint8',
      name: 'ISNet Quint8 (Fastest)',
      size: '~15 MB',
      desc: 'Optimized 8-bit quantized weights for rapid processing and low memory footprint.',
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-[#171717] border border-[#a89f94]/30 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-[#fff4d8]">
        {/* Header */}
        <DialogHeader className="gap-1.5 pb-2 border-b border-[#a89f94]/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F6DFA6]/15 border border-[#F6DFA6]/30 flex items-center justify-center text-[#F6DFA6]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-[#fff4d8]">
                Neural Engine Settings
              </DialogTitle>
              <DialogDescription className="text-[11px] text-[#a89f94] font-mono mt-0.5">
                WASM / ONNX Web Runtime
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Model Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#F6DFA6] uppercase tracking-wider block font-mono">
              Model Precision Tier
            </label>
            <Badge variant="outline" className="text-[10px] border-[#F6DFA6]/30 text-[#F6DFA6] font-mono">
              ONNX
            </Badge>
          </div>
          <div className="space-y-2">
            {models.map((m) => {
              const isSelected = settings.modelQuality === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onUpdateSettings({ ...settings, modelQuality: m.id })}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs cursor-pointer ${
                    isSelected
                      ? 'border-[#F6DFA6] bg-[#F6DFA6]/10 text-[#fff4d8] shadow-md glow-gold'
                      : 'border-[#a89f94]/20 bg-[#222222]/50 text-[#a89f94] hover:border-[#a89f94]/40 hover:bg-[#222222]'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-2 text-[#fff4d8]">
                      <span>{m.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#F6DFA6]" />}
                    </span>
                    <span className="text-[#F6DFA6] font-mono text-[11px] bg-[#171717] px-2 py-0.5 rounded border border-[#a89f94]/25">
                      {m.size}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a89f94] mt-1.5 leading-relaxed">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Runtime Diagnostics */}
        <div className="bg-[#222222]/60 rounded-2xl p-4 border border-[#a89f94]/20 text-xs space-y-2.5">
          <div className="font-semibold text-[#fff4d8] flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#F6DFA6]" />
            <span>Local Environment Telemetry</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#a89f94] font-mono tabular-nums">
            <div>WASM Engine: <span className="text-[#F6DFA6]">Active</span></div>
            <div>Web Workers: <span className="text-[#F6DFA6]">Enabled</span></div>
            <div>CPU Threads: <span className="text-[#fff4d8]">{navigator.hardwareConcurrency || 4} Cores</span></div>
            <div>Device Privacy: <span className="text-[#F6DFA6]">100% On-Device</span></div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-[#171717] bg-gradient-to-r from-[#F6DFA6] to-[#c9833b] hover:brightness-110 rounded-full transition-all shadow-md glow-gold cursor-pointer"
          >
            Apply & Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
