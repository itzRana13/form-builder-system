import { FormSchema, SubmissionResponse, PaginatedSubmissions, Submission } from '../types';

// Use VITE_API_URL when defined (Vercel/production), otherwise default to Render backend URL
// Vite replaces import.meta.env at build time, so we need to handle undefined/empty strings
const getApiBaseUrl = (): string => {
  // Access the env variable - Vite will replace this at build time
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  
  // Check if it's a valid non-empty string
  if (envUrl && typeof envUrl === 'string') {
    const trimmed = envUrl.trim();
    if (trimmed !== '' && trimmed !== 'undefined' && trimmed.startsWith('http')) {
      // Ensure API_BASE_URL ends with /api (fetch calls append paths like /form-schema, /submissions)
      return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    }
  }
  
  // Default fallback to Render backend
  return 'https://form-builder-system.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

// Debug log in development (will be removed in production build)
if ((import.meta as any).env?.DEV) {
  console.log('API_BASE_URL:', API_BASE_URL);
}

export async function fetchFormSchema(): Promise<FormSchema> {
  const response = await fetch(`${API_BASE_URL}/form-schema`);
  if (!response.ok) {
    throw new Error('Failed to fetch form schema');
  }
  return response.json();
}

export async function submitForm(data: Record<string, any>): Promise<SubmissionResponse> {
  const response = await fetch(`${API_BASE_URL}/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function fetchSubmissions(
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc',
  search?: string
): Promise<PaginatedSubmissions> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });
  if (search && search.trim().length > 0) {
    params.set('search', search.trim());
  }
  const response = await fetch(`${API_BASE_URL}/submissions?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }
  return response.json();
}

export async function fetchSubmission(id: string): Promise<Submission> {
  const response = await fetch(`${API_BASE_URL}/submissions/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch submission');
  }
  return response.json();
}

export async function updateSubmission(
  id: string,
  data: Record<string, any>
): Promise<SubmissionResponse> {
  const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteSubmission(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete submission');
  }
}

