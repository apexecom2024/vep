import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// Proxy Gemini Calls if needed
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction
      }
    });
    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // WebSocket for Live API (Multi-modal Voice Assistant)
  const wss = new WebSocketServer({ server, path: "/ws/live" });

  wss.on("connection", async (ws) => {
    console.log("Client connected to Beatrice Live API");
    
    // According to gemini-api skill, we use ai.live.connect
    let session: any = null;

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'start') {
          session = await ai.live.connect({
            model: "gemini-3.1-flash-live-preview",
            callbacks: {
              onmessage: (msg: any) => {
                const audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                const text = msg.serverContent?.modelTurn?.parts[0]?.text;
                const transcript = msg.serverContent?.modelTurn?.parts[0]?.audioTranscription;
                
                if (audio) ws.send(JSON.stringify({ type: 'audio', data: audio }));
                if (text) ws.send(JSON.stringify({ type: 'text', data: text }));
                if (msg.serverContent?.interrupted) {
                  ws.send(JSON.stringify({ type: 'interrupted' }));
                }
                
                // Transcriptions if enabled
                if (msg.serverContent?.modelTurn?.parts[0]?.audioTranscription) {
                   ws.send(JSON.stringify({ type: 'transcript', data: msg.serverContent.modelTurn.parts[0].audioTranscription }));
                }
              },
            },
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }, // 'Audi' requested - using Zephyr or Puck for deep/mature feel
              },
              systemInstruction: "You are Beatrice, a sophisticated AI voice assistant. You are helpful, professional, and empathetic. You have access to Google Workspace through the user's account. Use the 'Audi' voice style (mature, steady).",
              inputAudioTranscription: {},
              outputAudioTranscription: {},
            },
          });
        }

        if (session && message.audio) {
          session.sendRealtimeInput({
            audio: { data: message.audio, mimeType: "audio/pcm;rate=16000" },
          });
        }
        
        if (session && message.video) {
          session.sendRealtimeInput({
             video: { data: message.video, mimeType: "image/jpeg" }
          });
        }

      } catch (err) {
        console.error("WS Error:", err);
      }
    });

    ws.on("close", () => {
      if (session) session.close();
      console.log("Client disconnected");
    });
  });
}

startServer();
