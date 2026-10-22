import React, { useState } from 'react';
import { Sparkles, MessageSquare, Heart, Coffee, Check, AlertCircle, HelpCircle, Volume2, Loader2 } from 'lucide-react';
import { ttsService } from '../utils/speechSynthesis';
import { AppLanguage } from '../types';

interface QuickPhrasesProps {
  onSelectPhrase: (phrase: string) => void;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  language?: AppLanguage;
}

interface PhraseItem {
  textEn: string;
  textTe: string;
  phoneticTe?: string;
}

interface CategoryGroup {
  categoryEn: string;
  categoryTe: string;
  icon: any;
  items: PhraseItem[];
}

const BILINGUAL_PHRASE_CATEGORIES: CategoryGroup[] = [
  {
    categoryEn: 'Essential Needs',
    categoryTe: 'అత్యవసర అవసరాలు',
    icon: Coffee,
    items: [
      {
        textEn: 'I would like a glass of water please.',
        textTe: 'నాకు కొంచెం నీళ్లు కావాలి, దయచేసి.',
        phoneticTe: 'Naaku konchem neellu kaavali',
      },
      {
        textEn: 'I need my medication now.',
        textTe: 'నాకు ఇప్పుడు మందులు కావాలి.',
        phoneticTe: 'Naaku ippudu mandulu kaavali',
      },
      {
        textEn: 'I need to use the restroom.',
        textTe: 'నేను వాష్‌రూమ్‌కి వెళ్లాలి.',
        phoneticTe: 'Nenu washroom ki vellali',
      },
      {
        textEn: 'I am hungry and need food.',
        textTe: 'నాకు ఆకలిగా ఉంది, ఆహారం కావాలి.',
        phoneticTe: 'Naaku aakaliga undi',
      },
      {
        textEn: 'I am feeling tired and need to rest.',
        textTe: 'నాకు అలసటగా ఉంది, విశ్రాంతి కావాలి.',
        phoneticTe: 'Naaku alasataga undi',
      },
    ],
  },
  {
    categoryEn: 'Quick Responses',
    categoryTe: 'త్వరిత సమాధానాలు',
    icon: Check,
    items: [
      {
        textEn: 'Yes, please.',
        textTe: 'అవును, దయచేసి.',
        phoneticTe: 'Avunu, dayachesi',
      },
      {
        textEn: 'No, thank you.',
        textTe: 'వద్దు, ధన్యవాదాలు.',
        phoneticTe: 'Vaddu, dhanyavaadaalu',
      },
      {
        textEn: 'Please give me a moment to speak.',
        textTe: 'దయచేసి నాకు ఒక నిమిషం సమయం ఇవ్వండి.',
        phoneticTe: 'Oka nimisham samayam ivvandi',
      },
      {
        textEn: 'I understand what you are saying.',
        textTe: 'మీరు చెప్పేది నాకు అర్థమైంది.',
        phoneticTe: 'Meeru cheppedi arthamaindi',
      },
      {
        textEn: 'Thank you very much for your help.',
        textTe: 'మీ సహాయానికి చాలా ధన్యవాదాలు.',
        phoneticTe: 'Chaala dhanyavaadaalu',
      },
    ],
  },
  {
    categoryEn: 'Comfort & Health',
    categoryTe: 'ఆరోగ్యం & సౌకర్యం',
    icon: Heart,
    items: [
      {
        textEn: 'I am in severe pain right now.',
        textTe: 'నాకు ప్రస్తుతం చాలా నొప్పిగా ఉంది.',
        phoneticTe: 'Naaku chaala noppiga undi',
      },
      {
        textEn: 'Please call the doctor or nurse.',
        textTe: 'దయచేసి డాక్టర్ లేదా నర్స్‌ని పిలవండి.',
        phoneticTe: 'Doctor ni pilavandi',
      },
      {
        textEn: 'Please adjust my sitting position.',
        textTe: 'దయచేసి నా కూర్చునే భంగిమను మార్చండి.',
        phoneticTe: 'Naa position marchandi',
      },
      {
        textEn: 'I am feeling cold.',
        textTe: 'నాకు చలిగా ఉంది.',
        phoneticTe: 'Naaku chaliga undi',
      },
      {
        textEn: 'Please sit with me for a moment.',
        textTe: 'దయచేసి నాతో కాసేపు ఇక్కడే ఉండండి.',
        phoneticTe: 'Naatho kaasepu undandi',
      },
    ],
  },
];

export const QuickPhrases: React.FC<QuickPhrasesProps> = ({
  onSelectPhrase,
  highContrast,
  fontSize,
  language = 'en',
}) => {
  const [activeSpeakingKey, setActiveSpeakingKey] = useState<string | null>(null);
  const isTelugu = language === 'te';

  const handleQuickSpeak = async (item: PhraseItem, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const phraseToUse = isTelugu ? item.textTe : item.textEn;
    onSelectPhrase(phraseToUse);
    setActiveSpeakingKey(key);

    try {
      await ttsService.speak(phraseToUse, {
        rate: 0.9,
        lang: isTelugu ? 'te-IN' : 'en-US',
      });
    } finally {
      setActiveSpeakingKey((curr) => (curr === key ? null : curr));
    }
  };

  return (
    <div id="quick-phrases-module" className={`rounded-2xl border p-6 transition-all ${
      highContrast
        ? 'bg-black border-yellow-400 text-yellow-300'
        : 'bg-[#161B22] border-[#2D3139] text-[#F9FAFB] shadow-xl'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#10B981]" />
          <h2 className="text-xl font-bold text-[#F9FAFB]">
            {isTelugu ? 'త్వరిత AAC కమ్యూనికేషన్ కార్డులు (Quick Cards)' : 'Quick AAC Communication Cards'}
          </h2>
        </div>
        <span className={`text-xs ${highContrast ? 'text-yellow-200' : 'text-[#9CA3AF]'}`}>
          {isTelugu ? 'తక్షణమే మాట్లాడటానికి కార్డ్‌పై నొక్కండి' : 'Tap to insert and speak instantly'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BILINGUAL_PHRASE_CATEGORIES.map((cat, cIdx) => {
          const Icon = cat.icon;
          return (
            <div
              key={cIdx}
              className={`p-4 rounded-xl border flex flex-col gap-2 ${
                highContrast
                  ? 'border-yellow-500/50 bg-zinc-950'
                  : 'border-[#2D3139] bg-[#0F1115]'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#10B981] mb-1">
                <Icon className="w-4 h-4" />
                <span>{isTelugu ? cat.categoryTe : cat.categoryEn}</span>
                <span className="text-[10px] text-[#6B7280] font-normal lowercase">
                  ({isTelugu ? cat.categoryEn : cat.categoryTe})
                </span>
              </div>

              <div className="space-y-2 flex-1">
                {cat.items.map((item, pIdx) => {
                  const itemKey = `${cIdx}-${pIdx}`;
                  const isPlayingThis = activeSpeakingKey === itemKey;
                  const mainText = isTelugu ? item.textTe : item.textEn;
                  const subText = isTelugu ? item.textEn : item.textTe;

                  return (
                    <button
                      key={pIdx}
                      id={`btn-phrase-${cIdx}-${pIdx}`}
                      onClick={(e) => handleQuickSpeak(item, itemKey, e)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 border cursor-pointer ${
                        isPlayingThis
                          ? (highContrast
                              ? 'border-yellow-400 bg-yellow-950/60 ring-2 ring-yellow-400'
                              : 'border-[#10B981] bg-[#10B981]/15 ring-1 ring-[#10B981]')
                          : (highContrast
                              ? 'border-yellow-500/30 hover:border-yellow-400 bg-black text-yellow-200 hover:text-yellow-400 hover:bg-zinc-900'
                              : 'border-[#2D3139] hover:border-[#10B981]/50 bg-[#161B22] hover:bg-[#1F2937] text-[#D1D5DB] hover:text-[#F9FAFB]')
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className={`text-xs sm:text-sm font-semibold truncate ${isPlayingThis ? 'text-[#10B981]' : ''}`}>
                          {mainText}
                        </span>
                        <span className="text-[11px] text-[#9CA3AF] truncate">
                          {subText}
                        </span>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded shrink-0 flex items-center gap-1 ${
                        isPlayingThis
                          ? (highContrast ? 'bg-yellow-400 text-black animate-pulse' : 'bg-[#10B981] text-[#0F1115] animate-pulse')
                          : (highContrast ? 'bg-yellow-900/60 text-yellow-300' : 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30')
                      }`}>
                        {isPlayingThis ? (
                          <>
                            <Volume2 className="w-3 h-3 animate-bounce" />
                            <span>{isTelugu ? 'వినిపిస్తోంది' : 'Playing'}</span>
                          </>
                        ) : (
                          <span>{isTelugu ? 'వాయిస్' : 'Speak'}</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
