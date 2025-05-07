import z from "zod";

export const TemplateSchema = z.object({
    prompt: z.string(),
})

export const GenerateSchema = z.object({
    messages: z.array(z.object({
            role: z.enum(["user", "assistant", "system"]),
            parts: z.array(z.object({
                "text": z.string(),
            })),
        })),
})
  
