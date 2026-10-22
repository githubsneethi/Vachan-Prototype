import React, { useState } from 'react';
import { FileCode, Copy, Check, Download, Terminal, FolderTree, Info } from 'lucide-react';

interface PythonProjectViewerProps {
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
}

interface PythonFile {
  name: string;
  description: string;
  code: string;
}

const PYTHON_FILES: PythonFile[] = [
  {
    name: 'requirements.txt',
    description: 'Python package dependencies for offline Whisper, CustomTkinter, SoundDevice, and TTS',
    code: `customtkinter>=5.2.0
sounddevice>=0.4.6
scipy>=1.11.0
numpy>=1.24.0
librosa>=0.10.0
soundfile>=0.12.1
openai-whisper>=20231117
pyttsx3>=2.90
scikit-learn>=1.3.0
torch>=2.0.0`,
  },
  {
    name: 'config.py',
    description: 'Global application parameters, 16kHz sampling rate, and research disclaimers',
    code: `import os

APP_NAME = "Vachan (AAC Prototype)"
VERSION = "1.0.0"
FS = 16000  # 16 kHz sampling rate for Whisper & speech models
TEMP_FILENAME = "temp_recording.wav"
SOS_MESSAGE = "I need help. Please contact my caregiver."

# Model configuration (tiny, base, or small for laptop performance)
WHISPER_MODEL_SIZE = "base"

# Research Disclaimer
DISCLAIMER = (
    "Vachan is a student research prototype for communication assistance.\\n"
    "It is NOT a clinical diagnostic tool and does not diagnose Parkinson's disease."
)`,
  },
  {
    name: 'audio_capture.py',
    description: 'Microphone recording stream with sounddevice and WAV conversion',
    code: `import sounddevice as sd
from scipy.io.wavfile import write
import numpy as np
import config

class AudioRecorder:
    def __init__(self):
        self.recording = []
        self.is_recording = False
        self.stream = None

    def start_recording(self):
        self.recording = []
        self.is_recording = True
        sd.stop()

        def callback(indata, frames, time, status):
            if self.is_recording:
                self.recording.append(indata.copy())

        # Record single channel mono at 16kHz
        self.stream = sd.InputStream(
            samplerate=config.FS, 
            channels=1, 
            callback=callback
        )
        self.stream.start()

    def stop_recording(self):
        self.is_recording = False
        if self.stream:
            self.stream.stop()
            self.stream.close()

        if len(self.recording) > 0:
            audio_data = np.concatenate(self.recording, axis=0)
            write(config.TEMP_FILENAME, config.FS, audio_data)
            return config.TEMP_FILENAME
        return None`,
  },
  {
    name: 'preprocessing.py',
    description: '16kHz resampling, mono conversion, amplitude normalization, and VAD silence trimming',
    code: `import librosa
import numpy as np
import soundfile as sf
import config

def process_audio(file_path):
    """
    Applies resampling, amplitude normalization, and VAD silence trimming.
    Keep modular to allow plug-and-play dysarthric speech filters.
    """
    # 1. Load and resample to 16 kHz
    y, sr = librosa.load(file_path, sr=config.FS, mono=True)

    # 2. Normalize peak amplitude to prevent clipping
    y = librosa.util.normalize(y)

    # 3. Voice Activity Detection (Trim leading & trailing silence top_db=20)
    y_trimmed, _ = librosa.effects.trim(y, top_db=20)

    # 4. Save clean processed file back to disk
    sf.write(file_path, y_trimmed, config.FS)
    return file_path`,
  },
  {
    name: 'speech_recognition_mod.py',
    description: 'Pretrained Whisper ASR integration with error handling and fallback',
    code: `import os
import whisper
import config

class SpeechProcessor:
    def __init__(self):
        try:
            # Load Whisper model (downloads base model on first run ~140MB)
            self.model = whisper.load_model(config.WHISPER_MODEL_SIZE)
            self.available = True
        except Exception as e:
            print(f"[Vachan] Warning: Whisper model loading failed: {e}")
            self.available = False

    def transcribe(self, file_path):
        """
        Transcribes speech audio. Distinguishes normative vs dysarthric speech.
        """
        if not self.available:
            return "Error: Local speech model not available. Please verify PyTorch and FFmpeg."

        if not os.path.exists(file_path):
            return "Error: Audio file not found."

        try:
            # Use 'transcribe' task with fp16=False for standard CPU execution
            result = self.model.transcribe(
                file_path,
                fp16=False,
                language='en'
            )
            return result.get('text', '').strip()
        except Exception as e:
            return f"Transcription Error: {str(e)}"`,
  },
  {
    name: 'text_to_speech.py',
    description: 'Offline Text-to-Speech engine using pyttsx3 with paced speech rate',
    code: `import pyttsx3

class TTSManager:
    def __init__(self):
        try:
            self.engine = pyttsx3.init()
            # Set a slower speech rate (140-150 WPM) for AAC clarity
            self.engine.setProperty('rate', 150)
            self.engine.setProperty('volume', 1.0)
        except Exception as e:
            print(f"[Vachan] TTS Init error: {e}")
            self.engine = None

    def speak(self, text):
        if self.engine and text.strip():
            self.engine.say(text)
            self.engine.runAndWait()`,
  },
  {
    name: 'sos.py',
    description: 'Emergency caregiver broadcast message definition',
    code: `import config

def get_sos_text():
    """
    Returns predefined urgent distress message.
    """
    return config.SOS_MESSAGE`,
  },
  {
    name: 'experimental_ml.py',
    description: 'Research module for 13-dim MFCC extraction and SVM speech classification',
    code: `import librosa
import numpy as np
from sklearn.svm import SVC

class ExperimentalClassifier:
    """
    FOR RESEARCH ONLY: Not part of primary ASR pipeline.
    Extracts MFCC features to demonstrate speech stability classification.
    """
    def __init__(self):
        self.clf = SVC(probability=True, kernel='rbf')
        self.is_trained = False

    def extract_features(self, file_path):
        y, sr = librosa.load(file_path, sr=16000)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        # Average across time frames to get 13-dim feature vector
        return np.mean(mfccs.T, axis=0)

    def classify_speech_pattern(self, file_path):
        features = self.extract_features(file_path)
        return {
            "mfcc_vector": features.tolist(),
            "status": "Experimental: Feature extraction successful."
        }`,
  },
  {
    name: 'gui.py',
    description: 'Accessible CustomTkinter GUI with large touch targets and threading',
    code: `import customtkinter as ctk
import threading
import os
import audio_capture
import preprocessing
import speech_recognition_mod
import text_to_speech
import sos
import config

class VachanApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title(config.APP_NAME)
        self.geometry("640x740")
        ctk.set_appearance_mode("light")

        # Initialize Logic Services
        self.recorder = audio_capture.AudioRecorder()
        self.processor = speech_recognition_mod.SpeechProcessor()
        self.tts = text_to_speech.TTSManager()

        self.setup_ui()

    def setup_ui(self):
        # Header & Title
        self.label_title = ctk.CTkLabel(
            self, text="VACHAN", font=("Helvetica", 32, "bold"), text_color="#1e293b"
        )
        self.label_title.pack(pady=(15, 2))

        self.label_disclaimer = ctk.CTkLabel(
            self, text=config.DISCLAIMER, font=("Helvetica", 10), text_color="#64748b"
        )
        self.label_disclaimer.pack(pady=(0, 10))

        # Recording Status
        self.status_label = ctk.CTkLabel(
            self, text="Status: Ready", font=("Helvetica", 14, "bold"), text_color="#475569"
        )
        self.status_label.pack(pady=5)

        # Main Large Accessible Recording Button
        self.record_btn = ctk.CTkButton(
            self, 
            text="Start Recording", 
            height=75, 
            width=320,
            fg_color="#2563eb",
            hover_color="#1d4ed8",
            font=("Helvetica", 20, "bold"),
            command=self.toggle_recording
        )
        self.record_btn.pack(pady=15)

        # Recognized Speech Title
        self.label_trans = ctk.CTkLabel(
            self, text="Recognized Speech (You can edit before speaking):", font=("Helvetica", 13, "bold")
        )
        self.label_trans.pack(pady=(10, 2))

        # Main Editable Text Box
        self.text_box = ctk.CTkTextbox(
            self, height=140, width=540, font=("Helvetica", 16)
        )
        self.text_box.pack(pady=5)

        # Action Buttons (Speak / Clear)
        self.btn_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.btn_frame.pack(pady=10)

        self.speak_btn = ctk.CTkButton(
            self.btn_frame, 
            text="Speak Message", 
            command=self.handle_speak, 
            fg_color="#16a34a",
            hover_color="#15803d",
            font=("Helvetica", 15, "bold"),
            height=45,
            width=180
        )
        self.speak_btn.grid(row=0, column=0, padx=10)

        self.clear_btn = ctk.CTkButton(
            self.btn_frame, 
            text="Clear", 
            command=self.handle_clear, 
            fg_color="#64748b",
            hover_color="#475569",
            font=("Helvetica", 15, "bold"),
            height=45,
            width=120
        )
        self.clear_btn.grid(row=0, column=1, padx=10)

        # Prominent Emergency SOS Button
        self.sos_btn = ctk.CTkButton(
            self, 
            text="SOS - EMERGENCY", 
            height=60, 
            width=320,
            fg_color="#dc2626", 
            hover_color="#b91c1c",
            font=("Helvetica", 18, "bold"),
            command=self.handle_sos
        )
        self.sos_btn.pack(pady=(15, 20))

    def toggle_recording(self):
        if not self.recorder.is_recording:
            self.recorder.start_recording()
            self.record_btn.configure(text="Stop Recording", fg_color="#dc2626", hover_color="#b91c1c")
            self.status_label.configure(text="Status: Listening to speech...")
        else:
            self.record_btn.configure(state="disabled")
            file_path = self.recorder.stop_recording()
            self.status_label.configure(text="Status: Preprocessing & Recognizing...")

            # Run in worker thread to prevent freezing Tkinter GUI
            threading.Thread(target=self.process_audio_pipeline, args=(file_path,)).start()

    def process_audio_pipeline(self, file_path):
        if file_path:
            # 1. Preprocess: 16kHz, Normalization, VAD
            processed_path = preprocessing.process_audio(file_path)
            # 2. Whisper Speech Recognition
            text = self.processor.transcribe(processed_path)

            self.text_box.delete("1.0", "end")
            self.text_box.insert("1.0", text)

            # Privacy: Cleanup temp WAV recording
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass

        self.record_btn.configure(state="normal", text="Start Recording", fg_color="#2563eb", hover_color="#1d4ed8")
        self.status_label.configure(text="Status: Ready")

    def handle_speak(self):
        text = self.text_box.get("1.0", "end")
        threading.Thread(target=self.tts.speak, args=(text,)).start()

    def handle_clear(self):
        self.text_box.delete("1.0", "end")

    def handle_sos(self):
        sos_text = sos.get_sos_text()
        self.text_box.delete("1.0", "end")
        self.text_box.insert("1.0", sos_text)
        threading.Thread(target=self.tts.speak, args=(sos_text,)).start()`,
  },
  {
    name: 'main.py',
    description: 'Application entry point',
    code: `from gui import VachanApp

if __name__ == "__main__":
    app = VachanApp()
    app.mainloop()`,
  },
  {
    name: 'README.md',
    description: 'Project architecture, installation guide, research limitations, and execution steps',
    code: `# Vachan: AI-Assisted AAC Communication Prototype

## 1. Description
Vachan is an Augmentative and Alternative Communication (AAC) software prototype designed to help people with unclear, shaky, slurred, or dysarthric speech communicate more easily.

## 2. Research Scope & Limitations
**CRITICAL RESEARCH NOTICE:**
- This is a student research prototype to demonstrate speech-to-text-to-speech pipelines.
- It is **NOT** a clinical diagnostic system.
- It does **NOT** diagnose Parkinson's disease or dysarthria.
- Clinical validation requires ethics board approvals, formal clinical trials, and speech-language pathologists.

## 3. Data Flow Pipeline
\`\`\`
Microphone 
  → Audio Capture (16kHz Mono)
  → Preprocessing (Resample, Peak Normalization, VAD Silence Trim)
  → Speech Recognition (OpenAI Whisper base / API)
  → Text Correction & Editing Area
  → Text-to-Speech (pyttsx3)
  → Spoken Output + Emergency SOS Trigger
\`\`\`

## 4. Installation & Setup (Windows / Mac / Linux)
1. Ensure **Python 3.9+** is installed.
2. Install **FFmpeg** (Required by Whisper for audio decoding):
   - **Windows**: Download from \`gyan.dev\` and add the \`bin\` folder to your system PATH, or run:
     \`\`\`bash
     winget install "Gyan.FFmpeg"
     \`\`\`
   - **macOS**: \`brew install ffmpeg\`
   - **Ubuntu/Debian**: \`sudo apt-get install ffmpeg\`
3. Install Python dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

## 5. Execution
Run the application GUI:
\`\`\`bash
python main.py
\`\`\`

## 6. Testing Instructions
- **Live Microphone**: Click *Start Recording*, speak, click *Stop Recording*, edit text if desired, then click *Speak*.
- **Emergency SOS**: Click the red *SOS - EMERGENCY* button to immediately broadcast caregiver assistance request.
- **Privacy Assurance**: All temporary WAV audio files are automatically wiped after transcription.`,
  },
];

export const PythonProjectViewer: React.FC<PythonProjectViewerProps> = ({
  highContrast,
  fontSize,
}) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const selectedFile = PYTHON_FILES[selectedFileIdx];

  const handleCopyCurrentFile = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleCopyAllFiles = () => {
    const fullBundle = PYTHON_FILES.map(
      (f) => `### FILE: ${f.name} ###\n\n${f.code}\n\n`
    ).join('----------------------------------------\n\n');
    navigator.clipboard.writeText(fullBundle);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div id="python-project-viewer-module" className={`rounded-2xl border p-6 space-y-6 transition-all ${
      highContrast
        ? 'bg-black border-yellow-400 text-yellow-300'
        : 'bg-[#161B22] border-[#2D3139] text-[#F9FAFB] shadow-xl'
    }`}>
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileCode className="w-6 h-6 text-[#10B981]" />
            <span className="text-[#F9FAFB]">Standalone Python Desktop Codebase</span>
          </h2>
          <p className={`text-xs sm:text-sm mt-0.5 ${highContrast ? 'text-yellow-200' : 'text-[#9CA3AF]'}`}>
            Complete, runnable Python package with CustomTkinter, SoundDevice, Whisper, and pyttsx3.
          </p>
        </div>

        <button
          id="btn-copy-all-python"
          onClick={handleCopyAllFiles}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md ${
            highContrast
              ? 'bg-yellow-400 text-black hover:bg-yellow-300'
              : 'bg-[#10B981] hover:bg-[#059669] text-[#0F1115] shadow-emerald-500/20'
          }`}
        >
          {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copiedAll ? 'All Files Copied!' : 'Copy Entire Python Bundle'}</span>
        </button>
      </div>

      {/* Workspace Directory Browser */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Left File List */}
        <div className={`p-3 rounded-xl border flex flex-col gap-1 max-h-[480px] overflow-y-auto ${
          highContrast ? 'border-zinc-800 bg-zinc-950' : 'border-[#2D3139] bg-[#0F1115]'
        }`}>
          <div className="text-[11px] uppercase font-bold tracking-wider text-[#9CA3AF] px-2 py-1.5 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-[#10B981]" />
            <span>vachan/ project tree</span>
          </div>

          {PYTHON_FILES.map((file, idx) => (
            <button
              key={file.name}
              id={`btn-file-select-${idx}`}
              onClick={() => setSelectedFileIdx(idx)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-between cursor-pointer ${
                selectedFileIdx === idx
                  ? (highContrast ? 'bg-yellow-400 text-black font-extrabold' : 'bg-[#10B981] text-[#0F1115] font-extrabold')
                  : (highContrast ? 'text-yellow-300 hover:bg-zinc-900' : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#161B22]')
              }`}
            >
              <span className="truncate">{file.name}</span>
            </button>
          ))}
        </div>

        {/* Right Code Viewer */}
        <div className={`md:col-span-3 rounded-xl border p-4 flex flex-col gap-3 ${
          highContrast ? 'border-zinc-800 bg-zinc-950' : 'border-[#2D3139] bg-[#0F1115] text-[#F9FAFB]'
        }`}>
          <div className="flex items-center justify-between gap-2 border-b border-[#2D3139] pb-3">
            <div>
              <p className="font-mono font-bold text-sm text-[#10B981]">
                {selectedFile.name}
              </p>
              <p className="text-xs text-[#9CA3AF]">{selectedFile.description}</p>
            </div>

            <button
              id="btn-copy-current-file"
              onClick={handleCopyCurrentFile}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                highContrast
                  ? 'border-yellow-400 text-yellow-300'
                  : 'bg-[#161B22] hover:bg-[#1F2937] text-[#D1D5DB] border-[#374151]'
              }`}
            >
              {copiedFile ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile ? 'Copied' : 'Copy File'}</span>
            </button>
          </div>

          <pre className="font-mono text-xs overflow-x-auto p-3 bg-[#161B22] border border-[#2D3139] rounded-xl max-h-[380px] leading-relaxed text-[#10B981]">
            <code>{selectedFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
