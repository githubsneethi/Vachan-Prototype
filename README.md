# 🗣️ Vachan (వచన్)

**AI-Assisted Communication for Unclear & Dysarthric Speech**

Vachan helps people with speech difficulties (from Parkinson's disease, ALS, stroke recovery, or cerebral palsy) communicate easily. It listens to unclear or shaky speech, understands the intended message, and speaks it out clearly in **English** or **Telugu**.

---

## 🌟 Features

- 🎙️ **Live Speech Recognition**: Listens to dysarthric or low-volume speech and repairs unclear words.
- 🔊 **Voice Output**: Speaks out the restored sentence in natural English or Telugu with adjustable speed and pitch.
- ⚡ **Quick Phrase Cards**: One-tap buttons for common needs (Water, Medicine, Pain, Restroom).
- 🚨 **Emergency SOS**: Loud alarm button with simulated caregiver dispatch.
- 📊 **Accuracy Test Bench**: Test samples with Word Error Rate (WER) metrics.
- ♿ **Accessible UI**: High-contrast mode and large font sizes for low vision or hand tremors.

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- [Node.js](https://nodejs.org/) (version 20 or higher)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/vachan.git
cd vachan

# 2. Install dependencies
npm install

# 3. Add your Gemini API key (optional)
cp .env.example .env
# Edit .env and paste your GEMINI_API_KEY (the app also works without a key using built-in offline rules)

# 4. Start the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: Allow microphone permission when prompted by your browser.

---

## 📦 How to Deploy

### Option 1: Docker (Easiest)

If you have Docker installed:

```bash
# Start the container
docker compose up -d
```
Open [http://localhost:3000](http://localhost:3000).

---

### Option 2: Render, Railway, or VPS

1. Push your code to GitHub.
2. In your hosting provider (e.g. [Render](https://render.com) or [Railway](https://railway.app)):
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variable**: `GEMINI_API_KEY` (your Google AI Studio key)
3. Deploy!

> **Microphone requirement**: Always use **HTTPS** for your production domain so browsers allow microphone access.

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

| Variable | Required? | Description |
|---|:---:|---|
| `GEMINI_API_KEY` | Optional | Google Gemini API Key for AI speech reconstruction. If omitted, built-in offline rules are used. |
| `PORT` | Optional | Server port (default: `3000`). |

---

## 🐍 Offline Python Version (Optional)

If you need a completely offline, internet-free desktop app for a clinic:

1. Look in the **"Python Codebase & Docs"** tab inside the app.
2. Download or copy the Python files.
3. Install dependencies and run:
   ```bash
   pip install customtkinter sounddevice openai-whisper pyttsx3
   python ui_app.py
   ```

---

## ⚠️ Disclaimer

Vachan is an assistive communication aid and student research prototype. It is **not** a clinical diagnostic medical device.

---

## 📄 License

MIT License — free to use, modify, and distribute.
