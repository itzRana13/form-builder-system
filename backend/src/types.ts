export type FieldType = 'text' | 'number' | 'select' | 'multi-select' | 'date' | 'textarea' | 'switch';

export interface ValidationRule {
  minLength?: number;
  maxLength?: number;
  regex?: string;
  min?: number;
  max?: number;
  minDate?: string;
  minSelected?: number;
  maxSelected?: number;
  required?: boolean;
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  validation?: ValidationRule;
}

export interface FormSchema {
  title: string;
  description: string;
  fields: FormField[];
}

export interface Submission {
  id: string;
  createdAt: string;
  data: Record<string, any>;
}

export interface SubmissionResponse {
  success: boolean;
  id?: string;
  createdAt?: string;
  errors?: Record<string, string>;
}

export interface PaginatedSubmissions {
  submissions: Submission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

