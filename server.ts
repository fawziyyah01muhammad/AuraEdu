import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "500mb" }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper for structured JSON schema response from Gemini
app.post("/api/simplify-course", async (req, res) => {
  try {
    const { content, title, preferredLanguage = "English", academicLevel = "Undergraduate" } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Course content text is required" });
    }

    const prompt = `
You are a master university lecturer and learning science expert specializing in breaking down complex, jargon-heavy academic content into easy-to-understand, engaging study modules for university students.

Course Context / Input:
Title: ${title || "Course Material"}
Target Academic Level: ${academicLevel}
Student Preferred Language for Explanations & Audio: ${preferredLanguage}

INSTRUCTIONS:
1. Break down the provided course material into 2 to 4 distinct, logical "Study Segments".
2. For each segment:
   - Provide a clear segment title and estimated study duration in minutes (e.g. 5-10 mins).
   - "originalContentSummary": A brief 2-sentence summary of what this segment originally covers.
   - "simplifiedContent": A friendly, crystal-clear explanation using zero unnecessary jargon. Explain as if talking to a smart friend.
   - "analogy": A memorable real-world everyday analogy that brings the abstract concept to life.
   - "jargonTerms": Extract 3-5 technical jargon words/phrases from this segment. Provide their formal definition, a "simplifiedExplanation", and if the student preferred language (${preferredLanguage}) is non-English, provide the translated or local term/explanation ("localLanguageTerm", "localLanguageTranslation"). If English, provide a conversational vernacular explanation.
   - "audioScript": Write a comprehensive, multi-paragraph, spoken-word audio lesson in ${preferredLanguage}. CRITICAL: DO NOT MERELY SUMMARIZE OR OVERVIEW THE TEXT. Act as an enthusiastic, expert personal tutor. Deeply explain HOW and WHY the concepts work, break down step-by-step mechanics, provide real-world examples, address common student misunderstandings, and teach the material in depth so the listener gains deep understanding. Include 3 key breakdown bullet points for audio review.
   - "quiz": Create 3 interactive multiple-choice questions testing key concepts of this segment. Include 4 options, the 0-indexed correct option index, and a helpful explanation why it's correct.
   - "keyTakeaways": 3 quick bullet points to memorize for exams.
3. Provide an "overallSummary" of the entire course material and suggest a clean, catchy Course Title and Subject category.

COURSE MATERIAL TO PROCESS:
"""
${content.slice(0, 15000)}
"""
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an empathetic, world-class professor who converts complex jargon into simple, relatable concepts and local language audio study guides. Always output valid JSON according to the required schema.`,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Main course title" },
            subject: { type: Type.STRING, description: "Academic subject field" },
            overallSummary: { type: Type.STRING, description: "Overall course summary" },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  durationMinutes: { type: Type.NUMBER },
                  originalContentSummary: { type: Type.STRING },
                  simplifiedContent: { type: Type.STRING },
                  analogy: { type: Type.STRING },
                  jargonTerms: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        term: { type: Type.STRING },
                        definition: { type: Type.STRING },
                        simplifiedExplanation: { type: Type.STRING },
                        localLanguageTerm: { type: Type.STRING },
                        localLanguageTranslation: { type: Type.STRING },
                      },
                      required: ["term", "definition", "simplifiedExplanation"],
                    },
                  },
                  audioScript: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      language: { type: Type.STRING },
                      narratorScript: { type: Type.STRING },
                      breakdownBulletPoints: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ["title", "language", "narratorScript", "breakdownBulletPoints"],
                  },
                  quiz: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        question: { type: Type.STRING },
                        options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        correctOptionIndex: { type: Type.NUMBER },
                        explanation: { type: Type.STRING },
                      },
                      required: ["id", "question", "options", "correctOptionIndex", "explanation"],
                    },
                  },
                  keyTakeaways: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  "id",
                  "title",
                  "durationMinutes",
                  "originalContentSummary",
                  "simplifiedContent",
                  "analogy",
                  "jargonTerms",
                  "audioScript",
                  "quiz",
                  "keyTakeaways",
                ],
              },
            },
          },
          required: ["title", "subject", "overallSummary", "segments"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from AI model");
    }

    const data = JSON.parse(text);
    const courseAnalysis = {
      id: "course-" + Date.now(),
      title: data.title || title || "Course Simplification",
      subject: data.subject || "General Academic",
      academicLevel,
      preferredLanguage,
      overallSummary: data.overallSummary || "",
      segments: (data.segments || []).map((seg: any, idx: number) => ({
        ...seg,
        id: seg.id || `seg-${idx + 1}`,
        durationMinutes: seg.durationMinutes || 7,
      })),
      createdAt: new Date().toISOString(),
    };

    return res.json(courseAnalysis);
  } catch (error: any) {
    console.error("Error in /api/simplify-course:", error);
    return res.status(500).json({
      error: error.message || "Failed to simplify course content",
    });
  }
});

// Helper to generate real spoken audio via fallback TTS service if Gemini TTS hits quota limits
async function generateFallbackSpokenAudio(text: string, languageName = "English"): Promise<{ audioBase64: string; mimeType: string } | null> {
  try {
    const langMap: Record<string, string> = {
      English: "en",
      Hausa: "ha",
      Yoruba: "yo",
      Igbo: "ig",
      Pidgin: "en",
      Spanish: "es",
      French: "fr",
      Arabic: "ar",
      Swahili: "sw",
      Hindi: "hi",
      Mandarin: "zh-CN",
      German: "de",
      Portuguese: "pt",
      Russian: "ru",
      Japanese: "ja",
    };
    const langCode = langMap[languageName] || "en";

    // Split text into chunks of <= 180 characters at sentence boundaries
    const chunks: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = "";
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= 180) {
        currentChunk += sentence;
      } else {
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());

    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks.slice(0, 12)) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${langCode}&client=tw-ob`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        audioBuffers.push(Buffer.from(arrayBuffer));
      }
    }

    if (audioBuffers.length > 0) {
      const combinedBuffer = Buffer.concat(audioBuffers);
      return {
        audioBase64: combinedBuffer.toString("base64"),
        mimeType: "audio/mp3",
      };
    }
  } catch (err) {
    console.error("Spoken fallback TTS failed:", err);
  }
  return null;
}

// Gemini TTS API for native audio generation
app.post("/api/generate-audio", async (req, res) => {
  try {
    const { text, voice = "Kore", language = "English" } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required for TTS generation" });
    }

    const textChunk = text.slice(0, 1500);
    const validVoices = ["Kore", "Puck", "Charon", "Fenrir", "Zephyr"];
    const chosenVoice = validVoices.includes(voice) ? voice : "Kore";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Say in a clear, warm tutor voice: ${textChunk}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: chosenVoice },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        return res.json({
          audioBase64: base64Audio,
          mimeType: "audio/pcm;rate=24000",
        });
      }
    } catch (geminiError: any) {
      console.warn("Gemini TTS model notice/quota, generating spoken audio via fallback engine:", geminiError?.message || geminiError);
    }

    // High-quality spoken voice audio fallback
    const fallbackAudio = await generateFallbackSpokenAudio(textChunk, language);
    if (fallbackAudio) {
      return res.json({
        audioBase64: fallbackAudio.audioBase64,
        mimeType: fallbackAudio.mimeType,
      });
    }

    return res.status(500).json({ error: "Could not generate speech audio" });
  } catch (error: any) {
    console.error("Error in /api/generate-audio:", error);
    return res.status(500).json({ error: error.message || "Failed to generate audio segment" });
  }
});

// Ask AI follow-up about specific jargon or concept
app.post("/api/ask-jargon", async (req, res) => {
  try {
    const { term, context, preferredLanguage = "English" } = req.body;

    if (!term) {
      return res.status(400).json({ error: "Term is required" });
    }

    const prompt = `
A university student is asking for a quick, simple explanation of the technical term or concept: "${term}".
Surrounding Context: "${context || ""}"
Student's Preferred Language: ${preferredLanguage}

Provide:
1. "plainEnglish": A 2-sentence breakdown in plain English with an everyday analogy.
2. "localExplanation": A 2-sentence breakdown in ${preferredLanguage}.
3. "memoryHook": A 1-sentence mnemonic or funny visual image to easily remember it for exams.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plainEnglish: { type: Type.STRING },
            localExplanation: { type: Type.STRING },
            memoryHook: { type: Type.STRING },
          },
          required: ["plainEnglish", "localExplanation", "memoryHook"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    return res.json(data);
  } catch (error: any) {
    console.error("Error in /api/ask-jargon:", error);
    return res.status(500).json({
      error: error.message || "Failed to explain term",
    });
  }
});

// Translate or generate audio script in a target language for a resource segment
app.post("/api/translate-audio-script", async (req, res) => {
  try {
    const { segmentTitle, content, targetLanguage = "English" } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required for script translation" });
    }

    const prompt = `
You are an expert educational audio narrator and master tutor.
Given the study material segment below, write a comprehensive, spoken-word audio lesson script in ${targetLanguage}.
CRITICAL INSTRUCTION: DO NOT JUST SUMMARIZE OR GIVE A SURFACE OVERVIEW. Deeply explain the concepts in detail as a top professor would:
- Explain HOW and WHY the underlying mechanics work.
- Use clear step-by-step logic and intuitive real-world examples.
- Address potential points of confusion.
- Keep the tone conversational, engaging, and clear for on-the-go listening.
Also include 3 key breakdown bullet points in ${targetLanguage} summarizing the core lessons taught.

Segment Title: ${segmentTitle || "Study Segment"}
Content:
"""
${content.slice(0, 4000)}
"""
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            language: { type: Type.STRING },
            narratorScript: { type: Type.STRING },
            breakdownBulletPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["title", "language", "narratorScript", "breakdownBulletPoints"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No script generated");
    }

    const data = JSON.parse(text);
    return res.json({
      title: data.title || segmentTitle || "Audio Study Segment",
      language: targetLanguage,
      narratorScript: data.narratorScript || "",
      breakdownBulletPoints: data.breakdownBulletPoints || [],
    });
  } catch (error: any) {
    console.error("Error in /api/translate-audio-script:", error);
    return res.status(500).json({
      error: error.message || "Failed to translate audio script",
    });
  }
});

async function startServer() {
  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () =>{
    console.log(`AuraEdu server listening on http://localhost:${PORT}`)
  });
}
console.log("KEY:", process.env.GEMINI_API_KEY);

startServer();
