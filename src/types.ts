export type AppLanguage = 'en' | 'te';

export interface TranscriptionResult {
  rawTranscription: string;
  restoredText: string;
  confidenceScore: number;
  acousticNotes: string[];
  processingDurationMs: number;
  language?: AppLanguage;
  features?: {
    rmsLevel: number;
    silenceTrimmedSeconds: number;
    detectedTremorLevel: string;
    snrDb: number;
  };
}

export interface AudioSample {
  id: string;
  name: string;
  category: 'clear_speech' | 'unclear_speech';
  language?: AppLanguage;
  referenceText: string;
  description: string;
  durationSec: number;
  simulatedAudioUrl?: string;
  simulatedAudioData?: Float32Array;
}

export interface BenchmarkResult {
  sampleId: string;
  sampleName: string;
  category: string;
  referenceText: string;
  recognizedText: string;
  wer: number;
  cer: number;
  accuracy: number;
  status: 'passed' | 'partial' | 'failed';
}

export interface MFCCFeatures {
  coefficients: number[][];
  meanMFCC: number[];
  f0Variation: number;
  energyEnvelope: number[];
  jitterEstimate: number;
  shimmerEstimate: number;
}
