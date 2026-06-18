import { GoogleGenAI } from "@google/genai";

const googleAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY! });

export default googleAI;
