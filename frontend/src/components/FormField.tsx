import React from 'react';
import { FieldApi, FormApi } from '@tanstack/react-form';
import { FormField as FormFieldType } from '../types';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import MultiSelect from './ui/MultiSelect';
import Switch from './ui/Switch';
import Label from './ui/Label';

interface FormFieldProps {
  field: FormFieldType;
  form: FormApi<Record<string, any>, undefined>;
  departmentSkills?: Record<string, string[]>;
  openDropdownId?: string | null;
  setOpenDropdownId?: (id: string | null) => void;
}

export default function FormField({ field, form, departmentSkills, openDropdownId, setOpenDropdownId }: FormFieldProps) {

  // Get dynamic options for skills based on department
  const departmentValue = form.useStore((state: { values: Record<string, any> }) => state.values.department);
  const dynamicOptions = React.useMemo(() => {
    if (field.id === 'skills' && departmentSkills && departmentValue) {
      return departmentSkills[departmentValue] || field.options || [];
    }
    return field.options || [];
  }, [field.id, field.options, departmentSkills, departmentValue]);


  // Validation function that uses reactive departmentValue
  // Recreate when department changes to ensure it uses latest department
  const validateValue = React.useCallback((value: any) => {
          const validation = field.validation;
          if (!validation) return undefined;

    // Always get the latest department value at validation time
    // Prioritize reactive departmentValue from useStore (always up-to-date)
    // Fallback to form.getFieldValue if departmentValue is not available
    const currentDepartment = departmentValue || form.getFieldValue('department') || '';

          // Required validation
          if (validation.required) {
            if (
              value === undefined ||
              value === null ||
              value === '' ||
              (Array.isArray(value) && value.length === 0) ||
              (typeof value === 'boolean' && !value)
            ) {
              return `${field.label} is required`;
            }
          }

          // Skip further validation if empty and not required
          if (value === undefined || value === null || value === '') {
            return undefined;
          }

          // Type-specific validations
          if (field.type === 'text' || field.type === 'textarea') {
            if (typeof value !== 'string') {
              return `${field.label} must be a string`;
            }
            if (validation.minLength && value.length < validation.minLength) {
              return `${field.label} must be at least ${validation.minLength} characters`;
            }
            if (validation.maxLength && value.length > validation.maxLength) {
              return `${field.label} must be at most ${validation.maxLength} characters`;
            }
            if (validation.regex) {
              const regex = new RegExp(validation.regex);
              if (!regex.test(value)) {
                return `${field.label} format is invalid`;
              }
            }
          }

          if (field.type === 'number') {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (isNaN(numValue)) {
              return `${field.label} must be a valid number`;
            }
            if (validation.min !== undefined && numValue < validation.min) {
              return `${field.label} must be at least ${validation.min}`;
            }
            if (validation.max !== undefined && numValue > validation.max) {
              return `${field.label} must be at most ${validation.max}`;
            }
          }

          if (field.type === 'date') {
            if (typeof value !== 'string') {
              return `${field.label} must be a valid date`;
            }
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              return `${field.label} must be a valid date`;
            }
            if (validation.minDate) {
              const minDate = new Date(validation.minDate);
              if (date < minDate) {
                return `${field.label} must be on or after ${validation.minDate}`;
              }
            }
          }

          if (field.type === 'select') {
            if (field.options && !field.options.includes(value)) {
              return `${field.label} must be one of the available options`;
            }
          }

          if (field.type === 'multi-select') {
            if (!Array.isArray(value)) {
              return `${field.label} must be an array`;
            }
      // For skills field, validate against department-specific options
      if (field.id === 'skills' && departmentSkills) {
        // If department is not selected, don't validate skills options yet
        // (department selection will be validated separately)
        if (!currentDepartment || currentDepartment === '') {
          // Skip options validation if no department is selected
          // But still check minSelected/maxSelected
        } else if (departmentSkills[currentDepartment]) {
          // Validate against department-specific skills
          const validOptions = departmentSkills[currentDepartment];
          if (validOptions && validOptions.length > 0) {
            for (const item of value) {
              if (!validOptions.includes(item)) {
                return `${field.label} contains invalid options`;
              }
            }
          }
        } else {
          // Department is set but not found in departmentSkills (shouldn't happen, but handle it)
          // Don't return error here, just skip validation
        }
      } else {
        // For other multi-select fields, use field.options
        if (field.options && field.options.length > 0) {
              for (const item of value) {
                if (!field.options.includes(item)) {
                  return `${field.label} contains invalid options`;
                }
              }
            }
      }
      // Check minSelected/maxSelected for all multi-select fields
            if (validation.minSelected !== undefined && value.length < validation.minSelected) {
              return `${field.label} must have at least ${validation.minSelected} selection(s)`;
            }
            if (validation.maxSelected !== undefined && value.length > validation.maxSelected) {
              return `${field.label} must have at most ${validation.maxSelected} selection(s)`;
            }
          }

          return undefined;
  }, [field, departmentSkills, form, departmentValue]); // Include departmentValue to recreate when it changes

  return (
    <form.Field
      name={field.id}
      validators={{
        onChange: ({ value }: { value: any }) => validateValue(value),
        onBlur: ({ value }: { value: any }) => validateValue(value),
      }}
    >
      {(fieldState: FieldApi<any, any, undefined, any, any>) => (
        <div className="space-y-2">
          <Label htmlFor={field.id}>
            {field.label}
            {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
          </Label>

          {field.type === 'text' && (
            <Input
              id={field.id}
              type="text"
              placeholder={field.placeholder}
              value={fieldState.state.value || ''}
              onChange={(e) => fieldState.handleChange(e.target.value)}
              onBlur={fieldState.handleBlur}
              className={fieldState.state.meta.errors.length > 0 ? 'border-red-500' : ''}
            />
          )}

          {field.type === 'number' && (
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              value={fieldState.state.value || ''}
              onChange={(e) => fieldState.handleChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              onBlur={fieldState.handleBlur}
              className={fieldState.state.meta.errors.length > 0 ? 'border-red-500' : ''}
            />
          )}

          {field.type === 'date' && (
            <Input
              id={field.id}
              type="date"
              placeholder={field.placeholder}
              value={fieldState.state.value || ''}
              onChange={(e) => fieldState.handleChange(e.target.value)}
              onBlur={fieldState.handleBlur}
              className={fieldState.state.meta.errors.length > 0 ? 'border-red-500' : ''}
            />
          )}

          {field.type === 'textarea' && (
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={fieldState.state.value || ''}
              onChange={(e) => fieldState.handleChange(e.target.value)}
              onBlur={fieldState.handleBlur}
              className={fieldState.state.meta.errors.length > 0 ? 'border-red-500' : ''}
            />
          )}

          {field.type === 'select' && (
            <Select
              id={field.id}
              value={fieldState.state.value || ''}
              onChange={(value) => {
                fieldState.handleChange(value);
                // Reset skills when department changes
                if (field.id === 'department') {
                  form.setFieldValue('skills', []);
                }
                // Close dropdown after selection
                if (setOpenDropdownId) {
                  setOpenDropdownId(null);
                }
              }}
              onBlur={fieldState.handleBlur}
              className={fieldState.state.meta.errors.length > 0 ? 'border-red-500' : ''}
              options={[
                { value: '', label: field.placeholder || 'Select an option' },
                ...(field.options?.map((opt) => ({ value: opt, label: opt })) || [])
              ]}
              isOpen={openDropdownId === field.id}
              onOpenChange={(open) => {
                if (setOpenDropdownId) {
                  setOpenDropdownId(open ? field.id : null);
                }
              }}
            />
          )}

          {field.type === 'multi-select' && (
            <MultiSelect
              id={field.id}
              options={dynamicOptions}
              value={fieldState.state.value || []}
              onChange={(selected) => {
                fieldState.handleChange(selected);
              }}
              onBlur={fieldState.handleBlur}
              className={fieldState.state.meta.errors.length > 0 ? 'border-red-500' : ''}
              placeholder={field.placeholder}
              isOpen={openDropdownId === field.id}
              onOpenChange={(open) => {
                if (setOpenDropdownId) {
                  setOpenDropdownId(open ? field.id : null);
                }
              }}
            />
          )}

          {field.type === 'switch' && (
            <div className="flex items-center gap-2">
              <Switch
                id={field.id}
                checked={fieldState.state.value || false}
                onChange={(e) => fieldState.handleChange(e.target.checked)}
                onBlur={fieldState.handleBlur}
              />
            </div>
          )}

          {fieldState.state.meta.errors.length > 0 && fieldState.state.meta.isTouched && (
            <p className="text-sm text-red-500">{fieldState.state.meta.errors[0]}</p>
          )}
        </div>
      )}
    </form.Field>
  );
}

