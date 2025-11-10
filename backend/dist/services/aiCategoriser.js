"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorizeEmail = categorizeEmail;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});
/**
 * Analyze an email and return one of five categories:
 * Interested, Meeting Booked, Not Interested, Spam, Out of Office
 */
async function categorizeEmail(emailText) {
    try {
        const prompt = `
    Categorize the following email into one of these categories:
    - Interested
    - Meeting Booked
    - Not Interested
    - Spam
    - Out of Office

    Email:
    """
    ${emailText}
    """

    Respond only with the category name.
    `;
        const response = await openai.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
        });
        const category = response.choices[0].message?.content?.trim() || "Uncategorized";
        return category;
    }
    catch (error) {
        console.error("AI categorization error:", error.message);
        return "Uncategorized";
    }
}
