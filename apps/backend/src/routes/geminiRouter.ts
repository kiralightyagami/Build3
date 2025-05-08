import { Router } from "express";

import { GoogleGenAI } from "@google/genai";
import { getSystemPrompt } from "../prompts";
import {basePrompt as nodeBasePrompt } from "../defaults/node";
import {basePrompt as reactBasePrompt } from "../defaults/react";
import {BASE_PROMPT} from "../prompts";
import { GenerateSchema, TemplateSchema } from "../types/types";


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey:GEMINI_API_KEY });

export const geminiRouter = Router();

geminiRouter.post("/template", async (req, res) => {
    
    const parsedData = TemplateSchema.safeParse(req.body)
    if(!parsedData.success) {
        res.status(400).json({message: "Invalid request"});
        return;
    }
    const prompt = parsedData.data.prompt;

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
            prompts :[BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [reactBasePrompt]
        })
        return;
    }

    if(answer === "node") {
        res.json({
            prompts :[BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [nodeBasePrompt]
        })
        return;
    }
   
    res.status(403).json({message: "Invalid"});
    return;
        
});
    
geminiRouter.post("/generate", async (req, res) => {

    const parsedData = GenerateSchema.safeParse(req.body)
    if(!parsedData.success) {
        res.status(400).json({message: "Invalid request"});
        return;
    }
    const messages = parsedData.data.messages;
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        config:{
            maxOutputTokens: 8000,
            temperature: 0.5,
            systemInstruction: getSystemPrompt()
        },
        contents: messages
    });

    console.log(response.text);

    res.json({})

});