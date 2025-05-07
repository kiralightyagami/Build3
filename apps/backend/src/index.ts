require("dotenv").config();
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { getSystemPrompt } from "./prompts";
import {basePrompt as nodeBasePrompt } from "./defaults/node";
import {basePrompt as reactBasePrompt } from "./defaults/react";
import {BASE_PROMPT} from "./prompts";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey:GEMINI_API_KEY });
const app = express();
app.use(express.json());

app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        config:{
            maxOutputTokens: 200,
            systemInstruction: " Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anthing extra"
        },
        contents: [{
            role: "user",
            parts: [{ text: prompt }]
        }]
    });

    const answer = response.text?.trim().toLowerCase();
    console.log('Answer:', answer);
    console.log('Answer type:', typeof answer);
    console.log('Answer length:', answer?.length);
    
    if(answer === "react") {
        res.json({
            prompts :[BASE_PROMPT, reactBasePrompt],
            uiPrompts: []
        })
        return;
    }

    if(answer === "node") {
        res.json({
            prompts :[BASE_PROMPT, nodeBasePrompt],
            uiPrompts: []
        })
        return;
    }
   
    res.status(403).json({message: "Invalid answer"});
    return;
        
    });
    
    

// //async function main() {
  
//   const response = await ai.models.generateContentStream({
//     model: "gemini-2.0-flash",
//     config:{
//         maxOutputTokens: 8000,
//         temperature: 0.5,
//         systemInstruction: getSystemPrompt()

//     },
//     contents: [{
//       role: "user",
//       parts: [{ text: 'write a short story about a cat' },
//               { text: 'write a short story about a dog'},
//               { text: 'write a short story about a bird'}] 
//       }]
//   });
  
//   for await (const chunk of response) {
//     console.log(chunk.text);
//   }
// //}

//main();

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
