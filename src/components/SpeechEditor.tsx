import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Copy, Check, Trash2, Edit3, Sparkles, Activity, ShieldCheck, Globe } from 'lucide-react';
import { TranscriptionResult, AppLanguage } from '../types';
import { ttsService } from '../utils/speechSynthesis';

interface SpeechEditorProps {
  currentText: string;
  onTextChange: (text: string) => void;
  lastResult: TranscriptionResult | null;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  language?: AppLanguage;
}

export const SpeechEditor: React.FC<SpeechEditorProps> = ({
  currentText,
  onTextChange,
  lastResult,
  highContrast,
  fontSize,
  language = 'en',
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [showPhoneticDetails, setShowPhoneticDetails] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  useEffect(() => {
    const voices = ttsService.getVoices();
    setAvailableVoices(voices);
    if (voices.length > 0) {
      if (language === 'te') {
        const teluguVoice = voices.find(v => v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu'))
          || voices.find(v => v.lang.includes('IN') || v.name.toLowerCase().includes('india'));
        if (teluguVoice) {
          setSelectedVoiceURI(teluguVoice.voiceURI);
        }
      } else {
        const defaultVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        if (defaultVoice) {
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      }
    }
  }, [language]);

  const handleSpeak = async () => {
    if (!currentText.trim()) return;
    setIsSpeaking(true);
    try {
      await ttsService.speak(currentText, {
        rate: speechRate,
        pitch: 1.0,
        lang: language === 'te' ? 'te-IN' : 'en-US',
        voiceURI: selectedVoiceURI || undefined,
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleStopSpeech = () => {
    ttsService.stop();
    setIsSpeaking(false);
  };

  const handleCopy = () => {
    if (!currentText) return;
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    ttsService.stop();
    setIsSpeaking(false);
    onTextChange('');
  };

  const getTextareaClass = () => {
    const base = 'w-full rounded-2xl p-4 font-medium transition-all resize-y min-h-[140px] focus:outline-none focus:ring-4';
    const size = fontSize === 'xlarge' ? 'text-2xl leading-relaxed' : fontSize === 'large' ? 'text-xl leading-normal' : 'text-base';
    const theme = highContrast
      ? 'bg-black text-yellow-300 border-2 border-yellow-400 focus:ring-yellow-400/50'
      : 'bg-[#0F1115] text-[#F9FAFB] border border-[#374151] placeholder-[#4B5563] focus:border-[#10B981] focus:ring-[#10B981]/20';
    return `${base} ${size} ${theme}`;
  };

  return (
    <div id="speech-editor-module" className={`rounded-2xl border p-6 transition-all ${
      highContrast
        ? 'bg-black border-yellow-400 text-yellow-300'
        : 'bg-[#161B22] border-[#2D3139] text-[#F9FAFB] shadow-xl'
    }`}>
      {/* Module Title & Character Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-[#10B981]" />
          <h2 className="text-xl font-bold text-[#F9FAFB]">
            {language === 'te' ? 'గుర్తించబడిన సందేశం (వచన్ AAC ఎడిటర్)' : 'Recognized Message (Editable)'}
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-[#9CA3AF]">
          <span>{currentText.trim().split(/\s+/).filter(Boolean).length} {language === 'te' ? 'పదాలు' : 'Words'}</span>
          <span>•</span>
          <span>{currentText.length} {language === 'te' ? 'అక్షరాలు' : 'Characters'}</span>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative mb-4">
        <textarea
          id="speech-edit-textarea"
          value={currentText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={language === 'te' 
            ? "మైక్రోఫోన్‌లో మాట్లాడండి లేదా తెలుగులో టైప్ చేయండి (ఉదా: నాకు నీళ్లు కావాలి)..."
            : "Speak into the microphone or type here to communicate..."}
          className={getTextareaClass()}
          rows={4}
          aria-label="Editable message text"
        />

        {/* Quick Clear icon button in corner if text exists */}
        {currentText && (
          <button
            id="btn-inline-clear-text"
            onClick={handleClear}
            className={`absolute top-3.5 right-3.5 p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              highContrast ? 'bg-zinc-800 text-yellow-300 hover:bg-zinc-700' : 'bg-[#1F2937] hover:bg-[#2D3139] text-[#9CA3AF] hover:text-[#F9FAFB] border border-[#374151]'
            }`}
            title="Clear text"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Acoustic Restoration & Raw Input Drawer */}
      {lastResult && (
        <div id="acoustic-diagnostics-card" className={`mb-5 p-4 rounded-xl border text-xs ${
          highContrast ? 'bg-zinc-950 border-yellow-500/50' : 'bg-[#0F1115] border-[#2D3139] text-[#D1D5DB]'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-[#10B981]" />
              <span>Acoustic Intent Reconstruction:</span>
              <span className={`px-2 py-0.5 rounded font-mono ${
                lastResult.confidenceScore >= 80 
                  ? (highContrast ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40')
                  : (highContrast ? 'bg-yellow-950 text-yellow-300 border border-yellow-500' : 'bg-amber-950/40 text-amber-400 border border-amber-500/30')
              }`}>
                {lastResult.confidenceScore}% Confidence
              </span>
            </div>

            <button
              onClick={() => setShowPhoneticDetails(!showPhoneticDetails)}
              className="text-xs font-bold text-[#10B981] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{showPhoneticDetails ? 'Hide Diagnostics' : 'View Acoustic Notes'}</span>
            </button>
          </div>

          {showPhoneticDetails && (
            <div className="mt-3 pt-3 border-t border-[#2D3139] space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="font-semibold block text-[#9CA3AF]">Raw Phonetic Syllables Heard:</span>
                  <p className="font-mono bg-[#161B22] text-[#D1D5DB] p-2 rounded-lg border border-[#2D3139] mt-0.5">
                    "{lastResult.rawTranscription || 'N/A'}"
                  </p>
                </div>
                <div>
                  <span className="font-semibold block text-[#9CA3AF]">Tremor & Signal Analysis:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-[#161B22] text-[#D1D5DB] rounded-lg border border-[#2D3139]">
                      Tremor: {lastResult.features?.detectedTremorLevel || 'Low'}
                    </span>
                    <span className="px-2 py-1 bg-[#161B22] text-[#D1D5DB] rounded-lg border border-[#2D3139]">
                      SNR: {lastResult.features?.snrDb || 24} dB
                    </span>
                  </div>
                </div>
              </div>

              {lastResult.acousticNotes && lastResult.acousticNotes.length > 0 && (
                <div className="mt-2">
                  <span className="font-semibold block text-[#9CA3AF] mb-1">DSP Processing Notes:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#9CA3AF]">
                    {lastResult.acousticNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Speech Output Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Left Action Buttons: Speak & Clear */}
        <div className="flex items-center gap-3 flex-1">
          <button
            id="btn-speak-text"
            onClick={isSpeaking ? handleStopSpeech : handleSpeak}
            disabled={!currentText.trim()}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-extrabold transition-all cursor-pointer shadow-md focus:outline-none focus:ring-4 ${
              fontSize === 'xlarge' ? 'text-xl min-h-[64px]' : 'text-base min-h-[56px]'
            } ${
              !currentText.trim()
                ? 'opacity-40 cursor-not-allowed bg-[#1F2937] text-[#6B7280]'
                : isSpeaking
                ? (highContrast
                    ? 'bg-red-500 hover:bg-red-600 text-white border-2 border-yellow-300 animate-pulse'
                    : 'bg-[#EF4444] hover:bg-[#DC2626] text-white ring-red-400 animate-pulse')
                : (highContrast
                    ? 'bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-yellow-500 ring-yellow-400'
                    : 'bg-[#10B981] hover:bg-[#059669] text-[#0F1115] shadow-lg shadow-emerald-500/20')
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-6 h-6" />
                <span>{language === 'te' ? 'ఆపండి (STOP)' : 'STOP SPEAKING'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-6 h-6" />
                <span>{language === 'te' ? 'వాయిస్ ప్లే చేయండి (SPEAK ALOUD)' : 'SPEAK ALOUD'}</span>
              </>
            )}
          </button>

          <button
            id="btn-copy-text"
            onClick={handleCopy}
            disabled={!currentText.trim()}
            className={`px-4 py-4 rounded-xl border font-bold flex items-center gap-2 transition-all cursor-pointer ${
              !currentText.trim() ? 'opacity-40 cursor-not-allowed bg-[#161B22] text-[#4B5563] border-[#2D3139]' : ''
            } ${
              highContrast
                ? 'border-yellow-400 hover:bg-yellow-950 text-yellow-300'
                : 'border-[#374151] bg-[#1F2937] hover:bg-[#2D3139] text-[#D1D5DB]'
            }`}
            title="Copy message to clipboard"
          >
            {copied ? <Check className="w-5 h-5 text-[#10B981]" /> : <Copy className="w-5 h-5" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            id="btn-clear-all"
            onClick={handleClear}
            disabled={!currentText.trim()}
            className={`px-4 py-4 rounded-xl border font-bold flex items-center gap-2 transition-all cursor-pointer ${
              !currentText.trim() ? 'opacity-40 cursor-not-allowed bg-[#161B22] text-[#4B5563] border-[#2D3139]' : ''
            } ${
              highContrast
                ? 'border-yellow-400 hover:bg-yellow-950 text-yellow-300'
                : 'border-[#374151] bg-[#1F2937] hover:bg-[#2D3139] text-[#D1D5DB]'
            }`}
            title="Clear text box"
          >
            <Trash2 className="w-5 h-5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

        {/* TTS Speech Rate / Speed Adjuster */}
        <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-semibold ${
          highContrast ? 'border-yellow-500/60 bg-zinc-900' : 'border-[#374151] bg-[#1F2937] text-[#D1D5DB]'
        }`}>
          <span className="whitespace-nowrap text-[#9CA3AF]">TTS Speed:</span>
          <input
            id="tts-speed-slider"
            type="range"
            min="0.6"
            max="1.3"
            step="0.05"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-24 accent-[#10B981] cursor-pointer"
            title="Adjust speech synthesis speed"
          />
          <span className="font-mono w-10 text-right text-[#10B981]">{speechRate.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
};
