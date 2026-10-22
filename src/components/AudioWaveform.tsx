import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isRecording: boolean;
  analyserNode: AnalyserNode | null;
  highContrast: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isRecording,
  analyserNode,
  highContrast,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bufferLength = 128;
    let dataArray = new Uint8Array(bufferLength);

    if (analyserNode) {
      bufferLength = analyserNode.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background styling
      ctx.fillStyle = highContrast ? '#050505' : '#0F1115';
      ctx.fillRect(0, 0, width, height);

      // Center baseline guide
      ctx.strokeStyle = highContrast ? '#262626' : '#2D3139';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (isRecording) {
        if (analyserNode) {
          analyserNode.getByteTimeDomainData(dataArray);
        }

        ctx.lineWidth = 3;
        ctx.strokeStyle = highContrast ? '#facc15' : '#10B981';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          let v = 128;
          if (analyserNode) {
            v = dataArray[i];
          } else {
            // Simulated live responsive wave if raw stream isn't hooked yet
            phase += 0.0005;
            v = 128 + Math.sin(i * 0.15 + phase) * 35 + Math.sin(i * 0.05 + phase * 2) * 20;
          }

          const y = (v / 255.0) * height;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();

        // Overlay RMS glow dots
        const avgEnergy = analyserNode 
          ? (dataArray.reduce((acc, val) => acc + Math.abs(val - 128), 0) / bufferLength)
          : 25;
        
        ctx.fillStyle = highContrast 
          ? (avgEnergy > 20 ? '#22c55e' : '#facc15')
          : (avgEnergy > 20 ? '#10b981' : '#059669');

        ctx.beginPath();
        ctx.arc(width - 24, 24, Math.min(14, Math.max(6, avgEnergy / 3)), 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Idle gentle flatline with subtle pulse
        ctx.lineWidth = 2;
        ctx.strokeStyle = highContrast ? '#eab308' : '#374151';
        ctx.beginPath();
        const sliceWidth = width / 64;
        let x = 0;
        phase += 0.02;

        for (let i = 0; i < 64; i++) {
          const y = (height / 2) + Math.sin(i * 0.1 + phase) * 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isRecording, analyserNode, highContrast]);

  return (
    <div id="waveform-container" className="relative w-full overflow-hidden rounded-2xl border border-[#2D3139] bg-[#0F1115] shadow-inner">
      <canvas
        id="live-audio-canvas"
        ref={canvasRef}
        width={720}
        height={110}
        className="w-full h-24 sm:h-28 block"
      />
      <div className="absolute top-2.5 left-3.5 flex items-center gap-2 pointer-events-none">
        <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full ${
          isRecording
            ? (highContrast ? 'bg-red-500 text-white animate-pulse' : 'bg-[#EF4444] text-white animate-pulse shadow-[0_0_8px_#EF4444]')
            : (highContrast ? 'bg-zinc-800 text-yellow-300' : 'bg-[#1F2937] text-[#9CA3AF] border border-[#374151]')
        }`}>
          {isRecording ? 'LIVE INPUT • 16 kHz MONO' : 'AUDIO OSCILLOSCOPE'}
        </span>
      </div>
    </div>
  );
};
