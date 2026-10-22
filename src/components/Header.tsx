import React from 'react';
import { Volume2, AlertTriangle, Sparkles, Sliders, FileCode, Beaker, CheckCircle2, Languages } from 'lucide-react';
import { AppLanguage } from '../types';

interface HeaderProps {
  activeTab: 'live' | 'testing' | 'code';
  setActiveTab: (tab: 'live' | 'testing' | 'code') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  highContrast,
  setHighContrast,
  fontSize,
  setFontSize,
  language,
  setLanguage,
}) => {
  return (
    <header id="vachan-header" className={`border-b transition-colors ${
      highContrast 
        ? 'bg-black border-yellow-400 text-yellow-300' 
        : 'bg-[#0F1115] border-[#2D3139] text-[#F9FAFB]'
    }`}>
      {/* Research Disclaimer Banner */}
      <div id="research-disclaimer-banner" className={`px-6 py-2 text-xs md:text-sm font-medium flex items-center justify-between gap-4 border-b ${
        highContrast
          ? 'bg-yellow-400 text-black font-bold border-yellow-500'
          : 'bg-[#161B22] text-[#9CA3AF] border-[#2D3139]'
      }`}>
        <div className="flex items-center gap-2 max-w-4xl">
          <AlertTriangle className={`w-4 h-4 shrink-0 ${highContrast ? 'text-black' : 'text-[#F59E0B]'}`} />
          <span>
            <strong className={highContrast ? 'text-black' : 'text-[#D1D5DB]'}>Student Research Prototype:</strong> Vachan is an experimental AAC speech aid, NOT a clinical diagnostic tool.
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-[#6B7280]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          <span>16kHz Sampling • Offline Ready</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded-2xl flex items-center justify-center transition-all ${
              highContrast
                ? 'bg-yellow-400 text-black'
                : 'bg-[#1F2937] border border-[#374151] text-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.15)]'
            }`}>
              <Volume2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  highContrast ? 'text-yellow-300' : 'text-[#10B981]'
                }`}>
                  VACHAN
                </h1>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${
                  highContrast
                    ? 'border border-yellow-400 bg-yellow-950 text-yellow-300'
                    : 'bg-[#1F2937] text-[#9CA3AF] border border-[#374151]'
                }`}>
                  v1.0.0
                </span>
              </div>
              <p className={`text-xs font-medium tracking-wide mt-0.5 ${
                highContrast ? 'text-yellow-200' : 'text-[#6B7280]'
              }`}>
                AI-Assisted Speech Bridge for Dysarthric & Shaky Speech
              </p>
            </div>
          </div>

          {/* Accessibility Controls & Status */}
          <div className="flex items-center gap-3 flex-wrap self-end md:self-auto">
            {/* Status Pill */}
            <div className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium ${
              highContrast
                ? 'border-yellow-400 bg-zinc-950 text-yellow-300'
                : 'bg-[#1F2937] border-[#374151] text-[#D1D5DB]'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                highContrast ? 'bg-yellow-400' : 'bg-[#10B981] shadow-[0_0_8px_#10B981]'
              }`}></div>
              <span className="uppercase tracking-wider text-[11px] font-semibold">Ready</span>
            </div>

            {/* Language Switcher (EN / తెలుగు) */}
            <div className={`flex items-center rounded-xl border p-1 text-xs font-semibold ${
              highContrast ? 'border-yellow-400 bg-black' : 'border-[#374151] bg-[#1F2937]'
            }`}>
              <div className="flex items-center gap-1 px-2 text-[#6B7280]">
                <Languages className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="hidden sm:inline text-[11px] uppercase tracking-wider">Lang</span>
              </div>
              <button
                id="btn-lang-en"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-all text-xs font-bold cursor-pointer ${
                  language === 'en'
                    ? (highContrast ? 'bg-yellow-400 text-black font-extrabold' : 'bg-[#10B981] text-[#0F1115] font-extrabold shadow-sm')
                    : (highContrast ? 'text-yellow-300 hover:text-white' : 'text-[#9CA3AF] hover:text-[#F9FAFB]')
                }`}
                title="English ASR & AAC"
              >
                EN
              </button>
              <button
                id="btn-lang-te"
                onClick={() => setLanguage('te')}
                className={`px-2.5 py-1 rounded-lg transition-all text-xs font-bold cursor-pointer flex items-center gap-1 ${
                  language === 'te'
                    ? (highContrast ? 'bg-yellow-400 text-black font-extrabold' : 'bg-[#10B981] text-[#0F1115] font-extrabold shadow-sm')
                    : (highContrast ? 'text-yellow-300 hover:text-white' : 'text-[#9CA3AF] hover:text-[#F9FAFB]')
                }`}
                title="తెలుగు (Telugu) ASR & AAC"
              >
                <span>తెలుగు</span>
                <span className="text-[10px] opacity-75">TE</span>
              </button>
            </div>

            {/* Font Size Scaler */}
            <div className={`flex items-center rounded-xl border p-1 text-xs font-semibold ${
              highContrast ? 'border-yellow-400 bg-black' : 'border-[#374151] bg-[#1F2937]'
            }`}>
              <span className="px-2 text-[#6B7280] hidden sm:inline text-[11px] uppercase tracking-wider">Text</span>
              <button
                id="btn-font-normal"
                onClick={() => setFontSize('normal')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  fontSize === 'normal'
                    ? (highContrast ? 'bg-yellow-400 text-black font-bold' : 'bg-[#10B981] text-[#0F1115] font-bold')
                    : (highContrast ? 'text-yellow-300 hover:text-white' : 'text-[#9CA3AF] hover:text-[#F9FAFB]')
                }`}
                title="Normal Font Size"
              >
                A
              </button>
              <button
                id="btn-font-large"
                onClick={() => setFontSize('large')}
                className={`px-2.5 py-1 rounded-lg transition-all text-sm font-bold ${
                  fontSize === 'large'
                    ? (highContrast ? 'bg-yellow-400 text-black font-bold' : 'bg-[#10B981] text-[#0F1115] font-bold')
                    : (highContrast ? 'text-yellow-300 hover:text-white' : 'text-[#9CA3AF] hover:text-[#F9FAFB]')
                }`}
                title="Large Font Size"
              >
                A+
              </button>
              <button
                id="btn-font-xlarge"
                onClick={() => setFontSize('xlarge')}
                className={`px-2.5 py-1 rounded-lg transition-all text-base font-extrabold ${
                  fontSize === 'xlarge'
                    ? (highContrast ? 'bg-yellow-400 text-black font-bold' : 'bg-[#10B981] text-[#0F1115] font-bold')
                    : (highContrast ? 'text-yellow-300 hover:text-white' : 'text-[#9CA3AF] hover:text-[#F9FAFB]')
                }`}
                title="Extra Large Font Size"
              >
                A++
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              id="btn-high-contrast-toggle"
              onClick={() => setHighContrast(!highContrast)}
              className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-[#1F2937] hover:bg-[#2D3139] text-[#D1D5DB] border-[#374151]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{highContrast ? 'High Contrast: ON' : 'High Contrast'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav id="vachan-nav-tabs" className="flex items-center gap-2.5 mt-5 overflow-x-auto pb-1 scrollbar-none" aria-label="Main Navigation">
          <button
            id="tab-live-aac"
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'live'
                ? (highContrast 
                    ? 'bg-yellow-400 text-black' 
                    : 'bg-[#10B981] text-[#0F1115] shadow-[0_0_20px_rgba(16,185,129,0.25)]')
                : (highContrast 
                    ? 'border border-yellow-400 text-yellow-300 hover:bg-yellow-950' 
                    : 'bg-[#161B22] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937] border border-[#2D3139]')
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>1. Live Speech Bridge</span>
          </button>

          <button
            id="tab-testing-bench"
            onClick={() => setActiveTab('testing')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'testing'
                ? (highContrast 
                    ? 'bg-yellow-400 text-black' 
                    : 'bg-[#10B981] text-[#0F1115] shadow-[0_0_20px_rgba(16,185,129,0.25)]')
                : (highContrast 
                    ? 'border border-yellow-400 text-yellow-300 hover:bg-yellow-950' 
                    : 'bg-[#161B22] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937] border border-[#2D3139]')
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>2. Test Bench & Metrics</span>
          </button>

          <button
            id="tab-python-code"
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'code'
                ? (highContrast 
                    ? 'bg-yellow-400 text-black' 
                    : 'bg-[#10B981] text-[#0F1115] shadow-[0_0_20px_rgba(16,185,129,0.25)]')
                : (highContrast 
                    ? 'border border-yellow-400 text-yellow-300 hover:bg-yellow-950' 
                    : 'bg-[#161B22] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937] border border-[#2D3139]')
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>3. Python Codebase & Docs</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
