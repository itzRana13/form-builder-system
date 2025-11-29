import { FormSchema, ValidationRule, FieldType } from './types';
import { departmentSkills } from './schema';

export function validateSubmission(data: Record<string, any>, schema: FormSchema): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of schema.fields) {
    const value = data[field.id];
    const validation = field.validation;

    if (!validation) continue;

    // Required validation
    if (validation.required) {
      if (value === undefined || value === null || value === '' || 
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'boolean' && !value)) {
        errors[field.id] = `${field.label} is required`;
        continue;
      }
    }

    // Skip further validation if field is empty and not required
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // Type-specific validations
    switch (field.type) {
      case 'text':
      case 'textarea':
        validateTextField(field.id, value, validation, errors, field.label);
        break;
      case 'number':
        validateNumberField(field.id, value, validation, errors, field.label);
        break;
      case 'date':
        validateDateField(field.id, value, validation, errors, field.label);
        break;
      case 'select':
        validateSelectField(field.id, value, field.options, errors, field.label);
        break;
      case 'multi-select':
        // For skills field, use department-specific options
        let validOptions = field.options;
        if (field.id === 'skills' && departmentSkills) {
          const selectedDepartment = data['department'];
          if (selectedDepartment && departmentSkills[selectedDepartment]) {
            validOptions = departmentSkills[selectedDepartment];
          }
        }
        validateMultiSelectField(field.id, value, validation, validOptions, errors, field.label);
        break;
      case 'switch':
        if (typeof value !== 'boolean') {
          errors[field.id] = `${field.label} must be a boolean value`;
        }
        break;
    }
  }

  return errors;
}

function validateTextField(
  fieldId: string,
  value: any,
  validation: ValidationRule,
  errors: Record<string, string>,
  label: string
) {
  if (typeof value !== 'string') {
    errors[fieldId] = `${label} must be a string`;
    return;
  }

  if (validation.minLength !== undefined && value.length < validation.minLength) {
    errors[fieldId] = `${label} must be at least ${validation.minLength} characters`;
  }

  if (validation.maxLength !== undefined && value.length > validation.maxLength) {
    errors[fieldId] = `${label} must be at most ${validation.maxLength} characters`;
  }

  if (validation.regex) {
    const regex = new RegExp(validation.regex);
    if (!regex.test(value)) {
      errors[fieldId] = `${label} format is invalid`;
    }
  }
}

function validateNumberField(
  fieldId: string,
  value: any,
  validation: ValidationRule,
  errors: Record<string, string>,
  label: string
) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    errors[fieldId] = `${label} must be a valid number`;
    return;
  }

  if (validation.min !== undefined && numValue < validation.min) {
    errors[fieldId] = `${label} must be at least ${validation.min}`;
  }

  if (validation.max !== undefined && numValue > validation.max) {
    errors[fieldId] = `${label} must be at most ${validation.max}`;
  }
}

function validateDateField(
  fieldId: string,
  value: any,
  validation: ValidationRule,
  errors: Record<string, string>,
  label: string
) {
  if (typeof value !== 'string') {
    errors[fieldId] = `${label} must be a valid date`;
    return;
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    errors[fieldId] = `${label} must be a valid date`;
    return;
  }

  if (validation.minDate) {
    const minDate = new Date(validation.minDate);
    if (date < minDate) {
      errors[fieldId] = `${label} must be on or after ${validation.minDate}`;
    }
  }
}

function validateSelectField(
  fieldId: string,
  value: any,
  options: string[] | undefined,
  errors: Record<string, string>,
  label: string
) {
  if (!options || !options.includes(value)) {
    errors[fieldId] = `${label} must be one of the available options`;
  }
}

function validateMultiSelectField(
  fieldId: string,
  value: any,
  validation: ValidationRule,
  options: string[] | undefined,
  errors: Record<string, string>,
  label: string
) {
  if (!Array.isArray(value)) {
    errors[fieldId] = `${label} must be an array`;
    return;
  }

  if (options) {
    for (const item of value) {
      if (!options.includes(item)) {
        errors[fieldId] = `${label} contains invalid options`;
        return;
      }
    }
  }

  if (validation.minSelected !== undefined && value.length < validation.minSelected) {
    errors[fieldId] = `${label} must have at least ${validation.minSelected} selection(s)`;
  }

  if (validation.maxSelected !== undefined && value.length > validation.maxSelected) {
    errors[fieldId] = `${label} must have at most ${validation.maxSelected} selection(s)`;
  }
}

