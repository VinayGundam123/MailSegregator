import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

/**
 * Analyze an email and return one of five categories:
 * Interested, Meeting Booked, Not Interested, Spam, Out of Office
 */
export async function categorizeEmail(emailText: string): Promise<string> {
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
  } catch (error: any) {
    console.error("AI categorization error:", error.message);
    return "Uncategorized";
  }
}
