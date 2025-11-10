import { API_BASE_URL } from './config';

const API_BASE = API_BASE_URL;

export interface SuggestReplyRequest {
  text: string;
}

export interface SuggestReplyResponse {
  reply: string;
}

export async function suggestReply(text: string): Promise<string> {
  const response = await fetch(`${API_BASE}/reply/suggest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get reply suggestion');
  }
  
  const data: SuggestReplyResponse = await response.json();
  return data.reply;
}
