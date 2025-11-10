"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const openai_1 = __importDefault(require("openai"));
const router = (0, express_1.Router)();
const openai = new openai_1.default({
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
    }
    catch (error) {
        console.error("Reply generation error:", error.message);
        res.status(500).json({ error: "Failed to generate reply", details: error.message });
    }
});
exports.default = router;
