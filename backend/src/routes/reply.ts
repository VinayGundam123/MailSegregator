import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// POST /reply/suggest
router.post("/suggest", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Email text is required" });
    }

    const prompt = `
    You are a professional email assistant. Based on the following email, generate a polite, professional, and contextually appropriate reply.
    Keep the reply concise and actionable.
    
    Email:
    """
    ${text}
    """
    
    Generate a reply:
    `;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = response.choices[0].message?.content?.trim() || "Sorry, I couldn't generate a reply.";
    
    res.json({ reply });
  } catch (error: any) {
    console.error("Reply generation error:", error.message);
    res.status(500).json({ error: "Failed to generate reply", details: error.message });
  }
});

export default router;
