import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { MessageVariant } from "../types";

// Clean API for text generation
const getGenAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not defined");
  }
  return new GoogleGenerativeAI(apiKey);
};

const getModel = (modelName = "gemini-1.5-flash") => {
  const genAI = getGenAI();
  return genAI.getGenerativeModel({ model: modelName });
};

// --- HELPER FUNCTIONS FOR AUDIO ---

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// --- GEMINI LIVE CLIENT (Real-time Voice) ---

export class GeminiLiveClient {
  private ai: GoogleGenAI;
  private session: any = null;
  private audioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private isConnected: boolean = false;

  // Audio Playback Queue
  private nextStartTime: number = 0;
  private scheduledSources: AudioBufferSourceNode[] = [];

  public onAudioData: ((level: number) => void) | null = null;
  public onTextData: ((text: string, isUser: boolean) => void) | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  }

  async connect(systemInstruction: string) {
    if (this.isConnected) return;

    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)({ sampleRate: 24000 });
    this.nextStartTime = this.audioContext.currentTime;

    // Start Input Stream (Microphone)
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000,
      },
    });

    const inputContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.inputSource = inputContext.createMediaStreamSource(stream);
    this.processor = inputContext.createScriptProcessor(4096, 1, 1);

    // Initialize Session
    const sessionPromise = this.ai.live.connect({
      model: "gemini-2.5-flash-native-audio-preview-12-2025",
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: systemInstruction,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } }, // Deep, authoritative voice
        },
      },
      callbacks: {
        onopen: () => {
          this.isConnected = true;

          // Setup Audio Processing Loop
          if (this.processor) {
            this.processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);

              // Calculate volume for visualizer
              let sum = 0;
              for (let i = 0; i < inputData.length; i++)
                sum += inputData[i] * inputData[i];
              if (this.onAudioData)
                this.onAudioData(Math.sqrt(sum / inputData.length));

              // Convert to PCM 16-bit
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 32768;
              }

              const base64Audio = arrayBufferToBase64(pcmData.buffer);

              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  media: {
                    mimeType: "audio/pcm;rate=16000",
                    data: base64Audio,
                  },
                });
              });
            };
            this.inputSource?.connect(this.processor);
            this.processor.connect(inputContext.destination);
          }
        },
        onmessage: async (msg: LiveServerMessage) => {
          // Handle Audio Output
          const audioData =
            msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData && this.audioContext) {
            const audioBytes = base64ToUint8Array(audioData);

            // Raw PCM decoding
            const audioBuffer = this.audioContext.createBuffer(
              1,
              audioBytes.length / 2,
              24000
            );
            const channelData = audioBuffer.getChannelData(0);
            const dataView = new DataView(audioBytes.buffer);

            for (let i = 0; i < channelData.length; i++) {
              channelData[i] = dataView.getInt16(i * 2, true) / 32768.0;
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);

            // Schedule seamless playback
            const startTime = Math.max(
              this.audioContext.currentTime,
              this.nextStartTime
            );
            source.start(startTime);
            this.nextStartTime = startTime + audioBuffer.duration;
            this.scheduledSources.push(source);

            // Visualizer feedback for AI voice
            if (this.onAudioData) this.onAudioData(0.5 + Math.random() * 0.3);
          }

          // Handle Text Transcription (if enabled/available or inferred)
          // Note: Current preview might typically send audio, we simulate text for UI log if needed
          // or use turnComplete to trigger UI updates.
          if (msg.serverContent?.turnComplete) {
            // End of turn logic
          }
        },
        onclose: () => {
          this.disconnect();
        },
        onerror: (err) => {
          console.error("Gemini Live Error", err);
          this.disconnect();
        },
      },
    });

    this.session = sessionPromise;
  }

  disconnect() {
    this.isConnected = false;
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.inputSource) {
      this.inputSource.disconnect();
      this.inputSource = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.scheduledSources.forEach((s) => s.stop());
    this.scheduledSources = [];
  }
}

// --- STANDARD TEXT CHAT SERVICES ---

export const analyzeFieldImage = async (
  base64Image: string,
  prompt: string
) => {
  try {
    const model = getModel();
    const result = await model.generateContent([
      { inlineData: { mimeType: "image/jpeg", data: base64Image } },
      prompt + " (Answer in Arabic, focus on Lebanese election context)",
    ]);
    return result.response.text() || "تعذر تحليل الصورة.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "خطأ في تحليل الصورة.";
  }
};

export const generateMessageVariants = async (
  topic: string,
  audience: string
): Promise<Partial<MessageVariant>[]> => {
  try {
    const model = getModel();
    const result = await model.generateContent(
      `Generate 3 distinct election message variants (SMS/WhatsApp) in Arabic for: ${topic}. Target audience: ${audience}. Return JSON array with title and content.`
    );
    const text = result.response.text();
    if (!text) return [];
    return JSON.parse(text) as Partial<MessageVariant>[];
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return [];
  }
};

export const runScenarioSimulation = async (parameters: any) => {
  try {
    const model = getModel();
    const result = await model.generateContent(
      `Simulate a Lebanese parliamentary election scenario based on: ${JSON.stringify(
        parameters
      )}. Analyze threshold, preferential votes, wins/losses. Answer in Arabic.`
    );
    return result.response.text();
  } catch (error) {
    console.error("Gemini Simulation Error:", error);
    return "فشلت المحاكاة بسبب خطأ تقني.";
  }
};

export const chatWithData = async (query: string, contextData: string) => {
  try {
    const model = getModel();
    const prompt = `
      You are "Al Amid" (العميد), a strategic AI assistant for FieldOps Lebanon 2026 Elections.
      Speak Arabic. Be professional, neutral, and compliance-focused (Law 44/2017).
      
      Context: ${contextData}
      
      Question: ${query}
    `;
    const result = await model.generateContent(prompt);
    return { text: result.response.text() || "لا يوجد رد.", grounding: [] };
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return { text: "النظام غير متصل.", grounding: [] };
  }
};

export const askLegalAI = async (query: string) => {
  try {
    const model = getModel();
    const prompt = `You are a Lebanese Electoral Law expert (Law 44/2017). Answer in Arabic. Query: ${query}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    console.error("Legal AI Error:", error);
    return "عذراً، حدث خطأ في الاستشارة. الرجاء المحاولة لاحقاً.";
  }
};
