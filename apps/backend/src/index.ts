require("dotenv").config();

import { GoogleGenAI } from "@google/genai";
import { getSystemPrompt } from "./prompts";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey:GEMINI_API_KEY });

async function main() {
  
  const response = await ai.models.generateContentStream({
    model: "gemini-2.0-flash",
    config:{
        maxOutputTokens: 8000,
        temperature: 0.5,
        systemInstruction: getSystemPrompt()

    },
    contents: [{
      role: "user",
      parts: [{ text: 'write a short story about a cat' },
              { text: 'write a short story about a dog'},
              { text: 'write a short story about a bird'}] 
      }]
  });
  
  for await (const chunk of response) {
    console.log(chunk.text);
  }
}

main();

