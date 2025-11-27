import { FormSchema, SubmissionResponse, PaginatedSubmissions } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<PaginatedSubmissions> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });
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

