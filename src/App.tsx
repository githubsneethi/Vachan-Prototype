import React, { useState } from 'react';
import { Header } from './components/Header';
import { LiveRecorder } from './components/LiveRecorder';
import { SpeechEditor } from './components/SpeechEditor';
import { QuickPhrases } from './components/QuickPhrases';
import { SosModal } from './components/SosModal';
import { TestingSuite } from './components/TestingSuite';
import { PythonProjectViewer } from './components/PythonProjectViewer';
import { TranscriptionResult, AppLanguage } from './types';
import { AlertOctagon, Volume2, Sparkles, Shield, Info, HeartHandshake } from 'lucide-react';
import { ttsService } from './utils/speechSynthesis';

export default function App() {
  const [activeTab, setActiveTab] = useState<'live' | 'testing' | 'code'>('live');
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [language, setLanguage] = useState<AppLanguage>('en');

  const [currentText, setCurrentText] = useState<string>('');
  const [lastResult, setLastResult] = useState<TranscriptionResult | null>(null);
  const [isSosOpen, setIsSosOpen] = useState(false);

  const handleTranscriptionComplete = (result: TranscriptionResult) => {
    setLastResult(result);
    setCurrentText(result.restoredText || result.rawTranscription);
  };

  const handleSelectQuickPhrase = (phrase: string) => {
    setCurrentText(phrase);
  };

  const handleTriggerSOS = () => {
    setIsSosOpen(true);
    const sosMessage = language === 'te' 
      ? 'నాకు అత్యవసర సహాయం కావాలి. దయచేసి సంరక్షకుడిని పిలవండి.'
      : 'I need help. Please contact my caregiver.';
    
    ttsService.speak(sosMessage, {
      rate: 0.85,
      pitch: 1.1,
      volume: 1.0,
      lang: language === 'te' ? 'te-IN' : 'en-US',
    });
  };

  const handleLoadTestToMain = (text: string, result: TranscriptionResult) => {
    setCurrentText(text);
    setLastResult(result);
    setActiveTab('live');
  };

  return (
    <div
      id="vachan-root-app"
      className={`min-h-screen transition-colors flex flex-col font-sans ${
        highContrast
          ? 'bg-black text-yellow-300'
          : 'bg-[#0F1115] text-[#F9FAFB]'
      }`}
    >
      {/* Top Header & Accessibility Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        fontSize={fontSize}
        setFontSize={setFontSize}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* TAB 1: Live Speech Bridge (Core AAC Mode) */}
        {activeTab === 'live' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Grid: Live Recording Input + Speech Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Live Microphone Recorder (5 cols) */}
              <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                <LiveRecorder
                  onTranscriptionComplete={handleTranscriptionComplete}
                  highContrast={highContrast}
                  fontSize={fontSize}
                  language={language}
                  setLanguage={setLanguage}
                />

                {/* Fixed Emergency SOS Action Banner */}
                <div className={`rounded-2xl border p-5 flex items-center justify-between gap-4 transition-all shadow-lg ${
                  highContrast
                    ? 'border-red-500 bg-red-950/40 text-yellow-300'
                    : 'border-[#374151] bg-[#161B22] text-[#F9FAFB]'
                }`}>
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-[#EF4444] text-white rounded-xl shadow-md shadow-red-500/20">
                      <AlertOctagon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#F9FAFB]">
                        {language === 'te' ? 'అత్యవసర సహాయం (Emergency SOS)' : 'Emergency Assistance'}
                      </h3>
                      <p className="text-xs text-[#9CA3AF]">
                        {language === 'te' 
                          ? 'స్పీకర్: "నాకు అత్యవసర సహాయం కావాలి."' 
                          : 'Instantly speaks: "I need help. Please contact my caregiver."'}
                      </p>
                    </div>
                  </div>

                  <button
                    id="btn-trigger-sos-main"
                    onClick={handleTriggerSOS}
                    className="px-5 py-3 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/25 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    {language === 'te' ? 'SOS - సహాయం' : 'SOS - HELP'}
                  </button>
                </div>
              </div>

              {/* Right Column: Speech Editor & TTS Player (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <SpeechEditor
                  currentText={currentText}
                  onTextChange={setCurrentText}
                  lastResult={lastResult}
                  highContrast={highContrast}
                  fontSize={fontSize}
                  language={language}
                />
              </div>
            </div>

            {/* Bottom Row: Quick Phrase Cards */}
            <div>
              <QuickPhrases
                onSelectPhrase={handleSelectQuickPhrase}
                highContrast={highContrast}
                fontSize={fontSize}
                language={language}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Testing Bench & Benchmark Metrics */}
        {activeTab === 'testing' && (
          <TestingSuite
            onLoadTranscriptionToMain={handleLoadTestToMain}
            highContrast={highContrast}
            fontSize={fontSize}
            language={language}
          />
        )}

        {/* TAB 3: Python Codebase & Docs */}
        {activeTab === 'code' && (
          <PythonProjectViewer
            highContrast={highContrast}
            fontSize={fontSize}
          />
        )}
      </main>

      {/* Floating Caregiver Emergency SOS Modal */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        highContrast={highContrast}
        fontSize={fontSize}
      />

      {/* Footer & Research Notice */}
      <footer className={`mt-auto border-t py-4 px-6 text-xs transition-colors ${
        highContrast ? 'border-zinc-800 bg-black text-yellow-300/70' : 'border-[#1F2937] bg-[#0A0C10] text-[#9CA3AF]'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#10B981] rounded-full shadow-[0_0_8px_#10B981]"></span>
            <span className="font-bold text-[#D1D5DB]">Vachan AAC Engine: Ready</span>
            <span className="text-[#4B5563]">•</span>
            <span className="text-[#6B7280]">Private & Secure Local Processing</span>
          </div>
          <div className="flex items-center gap-3 text-[#6B7280]">
            <span>Student Research Feasibility Prototype</span>
            <span>•</span>
            <span>Non-diagnostic</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
