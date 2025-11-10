import OpenAI from 'openai';
import TrainingKnowledge from '../models/trainingKnowledge.model';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = 'text-embedding-3-small';
const CHAT_MODEL = 'gpt-4o-mini';

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });

    return response.data[0].embedding;
  } catch (error: any) {
    console.error('Error generating embedding:', error.message);
    throw new Error('Failed to generate embedding');
  }
}

export async function storeTrainingData(texts: string[]): Promise<void> {
  console.log(`Storing ${texts.length} training texts with embeddings`);

  const storedCount = { success: 0, failed: 0 };

  for (const text of texts) {
    try {
      const exists = await TrainingKnowledge.findOne({ text });
      if (exists) {
        console.log(`Skipped (exists): "${text.substring(0, 50)}..."`);
        continue;
      }

      const embedding = await generateEmbedding(text);

      await TrainingKnowledge.create({
        text,
        embedding,
      });

      storedCount.success++;
      console.log(`Stored: "${text.substring(0, 50)}..."`);
    } catch (error: any) {
      storedCount.failed++;
      console.error(`Failed to store: "${text.substring(0, 50)}..." - ${error.message}`);
    }
  }

  console.log(`Training data stored: ${storedCount.success} success, ${storedCount.failed} failed`);
}

async function retrieveSimilarKnowledge(
  queryEmbedding: number[],
  topK: number = 3
): Promise<Array<{ text: string; similarity: number }>> {
  const allKnowledge = await TrainingKnowledge.find({}).lean();

  if (allKnowledge.length === 0) {
    console.warn('No training data found in database');
    return [];
  }

  const results = allKnowledge.map((doc) => ({
    text: doc.text,
    similarity: cosineSimilarity(queryEmbedding, doc.embedding),
  }));

  results.sort((a, b) => b.similarity - a.similarity);

  return results.slice(0, topK);
}

export async function suggestReply(emailText: string): Promise<string> {
  try {
    console.log(`Generating AI reply for email: "${emailText.substring(0, 50)}..."`);

    const emailEmbedding = await generateEmbedding(emailText);
    const similarKnowledge = await retrieveSimilarKnowledge(emailEmbedding, 3);

    let context = '';
    if (similarKnowledge.length > 0) {
      context = 'Here are some relevant examples from our knowledge base:\n\n';
      similarKnowledge.forEach((item, index) => {
        context += `Example ${index + 1} (similarity: ${(item.similarity * 100).toFixed(1)}%):\n${item.text}\n\n`;
      });
    } else {
      context = 'No relevant training data found. Generate a generic professional reply.\n\n';
    }

    const systemPrompt = `You are a professional email assistant. Your task is to generate a polite, context-aware reply to incoming emails.

Use the provided context from our knowledge base to inform your response, but make the reply sound natural and personalized.

Guidelines:
- Be professional and polite
- Keep the reply concise (2-4 sentences)
- Address the main point of the email
- Use a friendly but professional tone
- If unsure, ask for clarification or suggest next steps`;

    const userPrompt = `${context}

Incoming Email:
"${emailText}"

Generate a professional reply:`;

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const suggestedReply = completion.choices[0].message.content || 'Thank you for your email. I will get back to you shortly.';

    console.log(`AI reply generated: "${suggestedReply.substring(0, 60)}..."`);

    return suggestedReply;
  } catch (error: any) {
    console.error('Error generating AI reply:', error.message);
    return 'Thank you for your email. I will review it and get back to you as soon as possible.';
  }
}

export async function initializeTrainingData(): Promise<void> {
  const sampleTrainingData = [
    'When asked about interview availability: I appreciate your interest! I am available for an interview next week. Could you please share some available time slots? I am flexible with my schedule.',
    'When asked about project timeline: Thank you for reaching out. Our typical project timeline is 4-6 weeks depending on complexity. I would be happy to discuss your specific requirements and provide a detailed estimate.',
    'When asked about pricing: Thank you for your inquiry. Our pricing varies based on project scope and requirements. I would love to schedule a call to understand your needs better and provide an accurate quote.',
    'When someone asks about our services: Thank you for your interest in our services. We specialize in web development, mobile apps, and cloud solutions. I would be happy to discuss how we can help with your specific project.',
    'When asked for a meeting: I would be delighted to meet. I am available this week on Tuesday and Thursday afternoons. Please let me know what works best for you, and I will send a calendar invite.',
    'When receiving a job application: Thank you for applying! We have received your application and our team is reviewing it. We will get back to you within 5-7 business days with next steps.',
    'When asked about technical support: Thank you for contacting support. I understand you are experiencing issues. Could you please provide more details about the problem? In the meantime, have you tried clearing your cache or restarting the application?',
    'When receiving a partnership proposal: Thank you for your partnership proposal. This sounds interesting! I would like to learn more about your company and how we can collaborate. Would you be available for a call next week?',
    'When asked about product features: Thank you for your interest in our product. The features you mentioned are indeed available in our Pro plan. I would be happy to provide a demo or answer any specific questions you have.',
    'When receiving a complaint: I sincerely apologize for the inconvenience you have experienced. Your feedback is valuable to us. I would like to resolve this issue immediately. Could you please provide your order number so I can investigate?',
  ];

  await storeTrainingData(sampleTrainingData);
}
