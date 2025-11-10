import { API_BASE_URL } from './config';

export interface Account {
  _id: string;
  email: string;
  password?: string;
  imapHost: string;
  imapPort: number;
  smtpHost?: string;
  smtpPort?: number;
  name?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountData {
  email: string;
  password: string;
  imapHost: string;
  imapPort?: number;
  smtpHost?: string;
  smtpPort?: number;
  name?: string;
}

export interface UpdateAccountData {
  email?: string;
  password?: string;
  imapHost?: string;
  imapPort?: number;
  smtpHost?: string;
  smtpPort?: number;
  name?: string;
  isActive?: boolean;
}

// Get all accounts
export async function fetchAccounts(): Promise<Account[]> {
  const response = await fetch(`${API_BASE_URL}/accounts`);
  if (!response.ok) {
    throw new Error('Failed to fetch accounts');
  }
  const data = await response.json();
  return data.accounts || [];
}

// Get single account
export async function fetchAccount(id: string): Promise<Account> {
  const response = await fetch(`${API_BASE_URL}/accounts/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch account');
  }
  const data = await response.json();
  return data.account;
}

// Create new account
export async function createAccount(accountData: CreateAccountData): Promise<Account> {
  const response = await fetch(`${API_BASE_URL}/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(accountData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create account');
  }

  const data = await response.json();
  return data.account;
}

// Update account
export async function updateAccount(id: string, accountData: UpdateAccountData): Promise<Account> {
  const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(accountData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update account');
  }

  const data = await response.json();
  return data.account;
}

// Delete account
export async function deleteAccount(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete account');
  }
}

// Toggle account active status
export async function toggleAccountStatus(id: string): Promise<Account> {
  const response = await fetch(`${API_BASE_URL}/accounts/${id}/toggle`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle account status');
  }

  const data = await response.json();
  return data.account;
}
