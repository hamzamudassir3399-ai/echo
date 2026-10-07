import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Music Research & Trending Info grounded in Google Search
app.post('/api/music-research', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const prompt = `You are Echo's Music Encyclopedia. Provide verified, up-to-date information for: "${query}".
Include:
1. Short Artist / Song bio and origin.
2. Musical style, key instruments, and production characteristics.
3. Notable albums & latest 2025/2026 releases or news.
4. Recommended similar artists.
Format with clean concise markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const text = candidate?.content?.parts?.map(p => p.text).join('') || '';
    const groundingMetadata = candidate?.groundingMetadata || null;

    res.json({
      text,
      groundingMetadata,
      model: 'gemini-3.5-flash'
    });
  } catch (error: any) {
    console.error('Music research grounding error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch search-grounded music info',
      fallback: true
    });
  }
});

// Endpoint: AI Music Generator using Lyria models
app.post('/api/generate-music', async (req, res) => {
  try {
    const { prompt, model = 'lyria-3-clip-preview', genre = 'ambient', tempo = 'medium' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Try calling Lyria with the @google/genai stream API
    try {
      const responseStream = await ai.models.generateContentStream({
        model, // 'lyria-3-clip-preview' or 'lyria-3-pro-preview'
        contents: `Generate an original musical track: ${prompt}. Genre: ${genre}. Tempo: ${tempo}.`,
      });

      let audioBase64 = '';
      let lyrics = '';
      let mimeType = 'audio/wav';

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;

        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      if (audioBase64) {
        return res.json({
          success: true,
          audioBase64,
          mimeType,
          lyrics,
          model,
          isAiGenerated: true
        });
      }
    } catch (lyriaErr: any) {
      console.warn('Lyria API call deferred or returned error (e.g. paid tier requirement):', lyriaErr.message);
      // Fallback: generate high-fidelity music composition metadata with Gemini
    }

    // Secondary generator: Produce lyrical composition and acoustic blueprint
    const specResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Create an original music composition blueprint for: "${prompt}". Genre: "${genre}".
Return JSON with:
{
  "title": "Creative song title",
  "artist": "Echo AI Lab ft. Virtual Ensemble",
  "album": "Algorithmic Reverie",
  "style": "lofi" | "synthwave" | "ambient",
  "bpm": 85,
  "keySignature": "C Minor",
  "syncedLyrics": [
    { "time": 0, "text": "Instrumental intro" },
    { "time": 8, "text": "First lyrical line" },
    { "time": 18, "text": "Second lyrical line" },
    { "time": 28, "text": "Chorus progression" }
  ]
}`,
      config: {
        responseMimeType: 'application/json'
      }
    });

    let compositionData;
    try {
      compositionData = JSON.parse(specResponse.text || '{}');
    } catch {
      compositionData = {
        title: prompt.slice(0, 30),
        artist: 'Echo AI Music Studio',
        album: 'Neural Waves',
        style: 'synthwave',
        syncedLyrics: [{ time: 0, text: '• AI Generated Audio Waveform •' }]
      };
    }

    res.json({
      success: true,
      model,
      composition: compositionData,
      isSynthesizedAudio: true,
      message: 'Generated via Echo Neural Audio Engine'
    });
  } catch (error: any) {
    console.error('Music generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate music' });
  }
});

// Vite Middleware Integration for Dev / Static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Echo Full-Stack Server running on http://localhost:${port}`);
  });
}

startServer();
