import React, { useState } from 'react';
import { AlertOctagon, PhoneCall, Volume2, ShieldAlert, X, HeartPulse, User } from 'lucide-react';
import { ttsService } from '../utils/speechSynthesis';
import { AppLanguage } from '../types';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  language?: AppLanguage;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  highContrast,
  fontSize,
  language = 'en',
}) => {
  const [repeatCount, setRepeatCount] = useState(0);
  const isTelugu = language === 'te';
  const emergencyMessage = isTelugu 
    ? "నాకు అత్యవసర సహాయం కావాలి. దయచేసి సంరక్షకుడిని పిలవండి."
    : "I need help. Please contact my caregiver.";

  const handleSpeakSOS = () => {
    ttsService.speak(emergencyMessage, {
      rate: 0.85,
      pitch: 1.1,
      volume: 1.0,
      lang: isTelugu ? 'te-IN' : 'en-US',
    });
    setRepeatCount((prev) => prev + 1);
  };

  if (!isOpen) return null;

  return (
    <div
      id="sos-emergency-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
    >
      <div className={`w-full max-w-lg rounded-3xl border-2 p-6 sm:p-8 shadow-2xl transition-all ${
        highContrast
          ? 'bg-black border-red-500 text-yellow-300'
          : 'bg-[#161B22] border-[#EF4444] text-[#F9FAFB] shadow-[0_0_50px_rgba(239,68,68,0.25)]'
      }`}>
        {/* Header with pulsing alert */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-[#EF4444] text-white rounded-2xl animate-bounce shadow-lg shadow-red-500/30">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <h2 id="sos-modal-title" className="text-2xl sm:text-3xl font-black text-[#EF4444] tracking-tight">
                EMERGENCY SOS
              </h2>
              <p className={`text-xs sm:text-sm font-bold ${highContrast ? 'text-yellow-200' : 'text-[#9CA3AF]'}`}>
                Caregiver Broadcast Active
              </p>
            </div>
          </div>

          <button
            id="btn-close-sos"
            onClick={() => {
              ttsService.stop();
              onClose();
            }}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              highContrast ? 'bg-zinc-800 text-yellow-300 hover:bg-zinc-700' : 'bg-[#1F2937] hover:bg-[#2D3139] text-[#9CA3AF] hover:text-white border border-[#374151]'
            }`}
            aria-label="Close emergency modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Message Broadcast Card */}
        <div className="bg-[#0F1115] border border-red-500/40 rounded-2xl p-5 mb-6 text-center">
          <p className="text-[11px] uppercase font-extrabold text-[#EF4444] tracking-wider mb-1">
            Automated Voice Broadcast
          </p>
          <p className="text-xl sm:text-2xl font-black text-[#F9FAFB] leading-snug">
            "{emergencyMessage}"
          </p>
          {repeatCount > 0 && (
            <p className="text-xs text-[#EF4444] font-bold mt-2">
              Broadcasted {repeatCount} {repeatCount === 1 ? 'time' : 'times'}
            </p>
          )}
        </div>

        {/* Caregiver Contact Helpers */}
        <div className={`p-4 rounded-2xl border mb-6 space-y-2 text-xs sm:text-sm ${
          highContrast ? 'border-yellow-400 bg-zinc-900' : 'border-[#2D3139] bg-[#0F1115] text-[#D1D5DB]'
        }`}>
          <div className="flex items-center gap-2 font-bold text-[#F9FAFB]">
            <User className="w-4 h-4 text-[#EF4444]" />
            <span>Designated Caregiver / Emergency Contact:</span>
          </div>
          <div className="flex items-center justify-between bg-[#161B22] p-3 rounded-xl border border-[#2D3139]">
            <div>
              <p className="font-bold text-sm text-[#F9FAFB]">Primary Caregiver</p>
              <p className="text-xs text-[#9CA3AF]">Mobile: +1 (555) 019-2834</p>
            </div>
            <a
              href="tel:5550192834"
              className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-[#0F1115] font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="btn-repeat-sos-broadcast"
            onClick={handleSpeakSOS}
            className="w-full sm:flex-1 py-4 px-6 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-red-600/30 transition-all active:scale-98 cursor-pointer"
          >
            <Volume2 className="w-6 h-6" />
            <span>REPEAT ALERT</span>
          </button>

          <button
            id="btn-dismiss-sos"
            onClick={() => {
              ttsService.stop();
              onClose();
            }}
            className={`w-full sm:w-auto py-4 px-6 rounded-xl font-bold border transition-all cursor-pointer ${
              highContrast
                ? 'border-yellow-400 bg-black text-yellow-300 hover:bg-zinc-900'
                : 'border-[#374151] bg-[#1F2937] text-[#D1D5DB] hover:bg-[#2D3139]'
            }`}
          >
            I am Safe (Dismiss)
          </button>
        </div>
      </div>
    </div>
  );
};
