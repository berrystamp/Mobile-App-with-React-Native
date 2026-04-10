import { AccountType } from '@/store/authStore';

const API_BASE_URL = 'https://your-api.example.com/api/v1';

interface AuthPayload {
  email: string;
  password: string;
  fullName?: string;
}

export async function signUpRequest(role: AccountType, payload: AuthPayload) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role,
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error('Sign up failed');
  }

  return response.json();
}

export async function loginRequest(role: AccountType, payload: AuthPayload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role,
      email: payload.email,
      password: payload.password,
    }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}

export async function saveInterestsRequest(interests: string[]) {
  const response = await fetch(`${API_BASE_URL}/customer/interests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ interests }),
  });

  if (!response.ok) {
    throw new Error('Saving interests failed');
  }

  return response.json();
}

export async function getInterestsStatusRequest() {
  const response = await fetch(`${API_BASE_URL}/customer/interests/status`);

  if (!response.ok) {
    throw new Error('Unable to read interests status');
  }

  return response.json() as Promise<{ hasSelectedInterests: boolean }>;
}
