const API_BASE = 'http://localhost:3000';

export interface Email {
  id: string;
  accountId: string;
  folder: string;
  from?: string;
  to?: string;
  subject?: string;
  text?: string;
  date: Date;
  label?: string;
}

export interface EmailFilters {
  q?: string;
  folder?: string;
  accountId?: string;
}

export async function fetchEmails(filters: EmailFilters = {}): Promise<Email[]> {
  const params = new URLSearchParams();
  
  if (filters.q) params.append('q', filters.q);
  if (filters.folder) params.append('folder', filters.folder);
  if (filters.accountId) params.append('accountId', filters.accountId);
  
  const url = `${API_BASE}/emails${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch emails');
  }
  
  return response.json();
}
