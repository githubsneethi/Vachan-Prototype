/**
 * Text-to-Speech Engine for Vachan
 * Uses offline browser SpeechSynthesis with AAC-optimized speech rate, pitch, and voice selection.
 */

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceURI?: string;
  lang?: string;
}

class TTSService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;
  private currentAudio: HTMLAudioElement | null = null;
  private isAudioPlaying = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    this.isInitialized = true;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  private playViaAudioEndpoint(text: string, lang: string, options: TTSOptions): Promise<void> {
    return new Promise((resolve) => {
      this.stop();

      const shortLang = lang.startsWith('te') ? 'te' : 'en';
      const audioUrl = `/api/tts?lang=${encodeURIComponent(shortLang)}&text=${encodeURIComponent(text)}`;
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      this.isAudioPlaying = true;

      audio.playbackRate = Math.max(0.75, Math.min(1.5, options.rate ?? 0.95));
      audio.volume = options.volume ?? 1.0;

      audio.onended = () => {
        this.isAudioPlaying = false;
        this.currentAudio = null;
        resolve();
      };

      audio.onerror = (err) => {
        console.warn('Network TTS playback error, falling back to local synthesis:', err);
        this.isAudioPlaying = false;
        this.currentAudio = null;
        // Fallback to local synthesis
        this.speakViaLocalSynth(text, options).then(resolve);
      };

      audio.play().catch((playErr) => {
        console.warn('Audio play request failed (autoplay policy or network):', playErr);
        this.isAudioPlaying = false;
        this.currentAudio = null;
        this.speakViaLocalSynth(text, options).then(resolve);
      });
    });
  }

  private speakViaLocalSynth(text: string, options: TTSOptions): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate ?? 0.92;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;
      const targetLang = options.lang ?? 'en-US';
      utterance.lang = targetLang;

      if (options.voiceURI) {
        const selectedVoice = this.voices.find(v => v.voiceURI === options.voiceURI);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      } else {
        if (targetLang.startsWith('te')) {
          const teluguVoice = this.voices.find(
            v => v.lang.startsWith('te') || v.lang === 'te-IN' || v.name.toLowerCase().includes('telugu')
          ) || this.voices.find(
            v => v.lang.includes('IN') || v.lang.startsWith('hi') || v.name.toLowerCase().includes('india')
          );
          if (teluguVoice) {
            utterance.voice = teluguVoice;
          }
        } else {
          const preferredVoice = this.voices.find(
            v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.default)
          ) || this.voices.find(v => v.lang.startsWith('en'));
          
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synth.speak(utterance);
    });
  }

  public async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!text.trim()) return;

    // Check if text is Telugu (either lang is te or contains Telugu characters)
    const containsTeluguChars = /[\u0C00-\u0C7F]/.test(text);
    const isTelugu = (options.lang && options.lang.startsWith('te')) || containsTeluguChars;

    if (isTelugu) {
      // Check if browser has a high quality local Telugu voice
      const hasLocalTeluguVoice = this.voices.some(v => v.lang.startsWith('te') || v.lang === 'te-IN' || v.name.toLowerCase().includes('telugu'));
      
      // If voice URI is explicitly chosen and valid, or browser has Telugu voice, can use local, otherwise use high-fidelity server TTS
      if (options.voiceURI && hasLocalTeluguVoice) {
        return this.speakViaLocalSynth(text, { ...options, lang: 'te-IN' });
      }
      
      // Use direct native high-clarity Telugu speech endpoint
      return this.playViaAudioEndpoint(text, 'te', options);
    }

    // For English: If browser has synthesis, use local synthesis
    if (this.synth) {
      this.stop();
      return this.speakViaLocalSynth(text, options);
    }

    // If no synth, play via endpoint
    return this.playViaAudioEndpoint(text, 'en', options);
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isAudioPlaying = false;
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public isSpeaking(): boolean {
    const synthSpeaking = this.synth ? this.synth.speaking : false;
    return synthSpeaking || this.isAudioPlaying;
  }
}

export const ttsService = new TTSService();
