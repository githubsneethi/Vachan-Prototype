/**
 * Audio Preprocessing Module for Vachan
 * Handles 16kHz resampling, mono conversion, amplitude normalization,
 * voice activity detection (VAD silence trimming), and WAV encoding.
 */

export interface PreprocessingStats {
  originalSampleRate: number;
  targetSampleRate: number;
  originalDuration: number;
  trimmedDuration: number;
  silenceRemovedSeconds: number;
  originalPeak: number;
  normalizedPeak: number;
  snrEstimateDb: number;
}

/**
 * Resamples an AudioBuffer to 16kHz mono, applies normalization & VAD silence trimming
 */
export async function preprocessAudioBuffer(
  audioBuffer: AudioBuffer,
  options = {
    targetSampleRate: 16000,
    normalize: true,
    trimSilence: true,
    silenceThresholdDb: -30,
  }
): Promise<{ processedBuffer: AudioBuffer; wavBlob: Blob; stats: PreprocessingStats }> {
  const originalSr = audioBuffer.sampleRate;
  const originalDuration = audioBuffer.duration;

  // 1. Convert to Mono
  const numberOfChannels = audioBuffer.numberOfChannels;
  let monoData: Float32Array;

  if (numberOfChannels === 1) {
    monoData = new Float32Array(audioBuffer.getChannelData(0));
  } else {
    monoData = new Float32Array(audioBuffer.length);
    for (let c = 0; c < numberOfChannels; c++) {
      const channelData = audioBuffer.getChannelData(c);
      for (let i = 0; i < audioBuffer.length; i++) {
        monoData[i] += channelData[i] / numberOfChannels;
      }
    }
  }

  // Calculate original peak
  let origMax = 0;
  for (let i = 0; i < monoData.length; i++) {
    const abs = Math.abs(monoData[i]);
    if (abs > origMax) origMax = abs;
  }

  // 2. Resample to 16 kHz using OfflineAudioContext
  const targetLength = Math.round((monoData.length * options.targetSampleRate) / originalSr);
  const offlineCtx = new OfflineAudioContext(1, targetLength, options.targetSampleRate);
  
  const sourceBuffer = offlineCtx.createBuffer(1, monoData.length, originalSr);
  sourceBuffer.copyToChannel(monoData, 0);

  const source = offlineCtx.createBufferSource();
  source.buffer = sourceBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  const resampledBuffer = await offlineCtx.startRendering();
  let resampledData = new Float32Array(resampledBuffer.getChannelData(0));

  // 3. Amplitude Normalization (Peak / RMS)
  let normMax = 0;
  if (options.normalize) {
    let peak = 0;
    for (let i = 0; i < resampledData.length; i++) {
      const abs = Math.abs(resampledData[i]);
      if (abs > peak) peak = abs;
    }
    if (peak > 0.0001) {
      const scale = 0.95 / peak;
      for (let i = 0; i < resampledData.length; i++) {
        resampledData[i] = Math.max(-1, Math.min(1, resampledData[i] * scale));
      }
      normMax = 0.95;
    } else {
      normMax = peak;
    }
  }

  // 4. Voice Activity Detection (Trim leading & trailing silence)
  let trimmedData = resampledData;
  let silenceRemovedSec = 0;

  if (options.trimSilence && resampledData.length > 0) {
    const thresholdLinear = Math.pow(10, options.silenceThresholdDb / 20);
    const windowSize = Math.floor(options.targetSampleRate * 0.02); // 20ms window
    
    // Find start index
    let startIdx = 0;
    for (let i = 0; i < resampledData.length - windowSize; i += windowSize) {
      let rms = 0;
      for (let j = 0; j < windowSize; j++) {
        rms += resampledData[i + j] * resampledData[i + j];
      }
      rms = Math.sqrt(rms / windowSize);
      if (rms > thresholdLinear) {
        startIdx = Math.max(0, i - windowSize * 2); // keep slight pre-padding
        break;
      }
    }

    // Find end index
    let endIdx = resampledData.length;
    for (let i = resampledData.length - windowSize; i >= 0; i -= windowSize) {
      let rms = 0;
      for (let j = 0; j < windowSize; j++) {
        rms += resampledData[i + j] * resampledData[i + j];
      }
      rms = Math.sqrt(rms / windowSize);
      if (rms > thresholdLinear) {
        endIdx = Math.min(resampledData.length, i + windowSize * 3); // keep slight post-padding
        break;
      }
    }

    if (endIdx > startIdx + windowSize) {
      trimmedData = resampledData.slice(startIdx, endIdx);
      silenceRemovedSec = (resampledData.length - trimmedData.length) / options.targetSampleRate;
    }
  }

  // 5. Build final AudioBuffer
  const finalCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const finalBuffer = finalCtx.createBuffer(1, trimmedData.length, options.targetSampleRate);
  finalBuffer.copyToChannel(trimmedData, 0);

  // 6. Encode to 16-bit PCM WAV Blob
  const wavBlob = audioBufferToWavBlob(finalBuffer);

  // Estimate SNR in dB
  let signalPower = 0;
  let noisePower = 0.00001;
  const sampleCount = trimmedData.length;
  for (let i = 0; i < sampleCount; i++) {
    const val = trimmedData[i];
    signalPower += val * val;
  }
  signalPower /= Math.max(1, sampleCount);
  const snrEstimateDb = Math.round(10 * Math.log10(signalPower / noisePower));

  const stats: PreprocessingStats = {
    originalSampleRate: originalSr,
    targetSampleRate: options.targetSampleRate,
    originalDuration: Number(originalDuration.toFixed(2)),
    trimmedDuration: Number(finalBuffer.duration.toFixed(2)),
    silenceRemovedSeconds: Number(silenceRemovedSec.toFixed(2)),
    originalPeak: Number(origMax.toFixed(3)),
    normalizedPeak: Number(normMax.toFixed(3)),
    snrEstimateDb: Math.min(48, Math.max(6, snrEstimateDb)),
  };

  return {
    processedBuffer: finalBuffer,
    wavBlob,
    stats,
  };
}

/**
 * Converts an AudioBuffer to a standard 16-bit PCM WAV Blob
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  
  // 'fmt ' chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // 'data' chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Creates simulated speech audio buffer for testing clear vs dysarthric speech
 */
export function createSyntheticSampleAudio(
  phrase: string,
  dysarthric: boolean = false
): AudioBuffer {
  const sampleRate = 16000;
  const words = phrase.split(' ');
  const durationPerWord = dysarthric ? 0.75 : 0.45;
  const totalDuration = words.length * durationPerWord + 0.6;
  const numSamples = Math.floor(sampleRate * totalDuration);

  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  let sampleOffset = Math.floor(sampleRate * 0.2);

  words.forEach((word, wIdx) => {
    const wordSamples = Math.floor(sampleRate * durationPerWord);
    // Base pitch: around 120-180Hz (fundamental vocal frequency)
    const baseFreq = 140 + Math.sin(wIdx * 1.2) * 20;

    for (let i = 0; i < wordSamples && (sampleOffset + i) < numSamples; i++) {
      const t = i / sampleRate;
      const progress = i / wordSamples;
      
      // Envelope
      const env = Math.sin(progress * Math.PI);
      
      // Dysarthric acoustic characteristics simulation:
      // 1. Vocal tremor: 4-7 Hz frequency/amplitude modulation
      // 2. Breathiness/Noise component
      // 3. Imprecise consonant transitions
      let tremorMod = 1.0;
      let pitchDrift = 0;
      if (dysarthric) {
        tremorMod = 1.0 + 0.35 * Math.sin(2 * Math.PI * 5.5 * t);
        pitchDrift = 15 * Math.sin(2 * Math.PI * 3.8 * t);
      }

      const freq = baseFreq + pitchDrift;
      // Formant harmonics
      const f1 = Math.sin(2 * Math.PI * freq * t);
      const f2 = 0.5 * Math.sin(2 * Math.PI * (freq * 2.1) * t);
      const f3 = 0.25 * Math.sin(2 * Math.PI * (freq * 3.2) * t);
      
      let sample = (f1 + f2 + f3) * env * tremorMod;

      // Add vocal aspiration noise
      if (dysarthric) {
        const aspirationNoise = (Math.random() * 2 - 1) * 0.12 * env;
        sample = sample * 0.85 + aspirationNoise;
      }

      data[sampleOffset + i] = sample * 0.4;
    }
    sampleOffset += wordSamples + (dysarthric ? Math.floor(sampleRate * 0.15) : Math.floor(sampleRate * 0.05));
  });

  return buffer;
}
