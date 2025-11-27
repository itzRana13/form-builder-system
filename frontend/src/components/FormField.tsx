import { useFormContext } from '@tanstack/react-form';
import { FormField as FormFieldType } from '../types';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import Switch from './ui/Switch';
import Label from './ui/Label';

interface FormFieldProps {
  field: FormFieldType;
}

export default function FormField({ field }: FormFieldProps) {
  const form = useFormContext();

  return (
    <form.Field
      name={field.id}
      validators={{
        onChange: ({ value }) => {
          const validation = field.validation;
          if (!validation) return undefined;

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
            if (field.options) {
              for (const item of value) {
                if (!field.options.includes(item)) {
                  return `${field.label} contains invalid options`;
                }
              }
            }
            if (validation.minSelected !== undefined && value.length < validation.minSelected) {
              return `${field.label} must have at least ${validation.minSelected} selection(s)`;
            }
            if (validation.maxSelected !== undefined && value.length > validation.maxSelected) {
              return `${field.label} must have at most ${validation.maxSelected} selection(s)`;
            }
          }

          return undefined;
        },
      }}
    >
      {(fieldState) => (
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
              onChange={(e) => fieldState.handleChange(e.target.value)}
              onBlur={fieldState.handleBlur}
              className={fieldState.state.meta.errors.length > 0 ? 'border-red-500' : ''}
            >
              <option value="">{field.placeholder || 'Select an option'}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )}

          {field.type === 'multi-select' && (
            <Select
              id={field.id}
              multiple
              value={fieldState.state.value || []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                fieldState.handleChange(selected);
              }}
              onBlur={fieldState.handleBlur}
              className={fieldState.state.meta.errors.length > 0 ? 'border-red-500' : ''}
              size={Math.min(field.options?.length || 5, 5)}
            >
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
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

          {fieldState.state.meta.errors.length > 0 && (
            <p className="text-sm text-red-500">{fieldState.state.meta.errors[0]}</p>
          )}
        </div>
      )}
    </form.Field>
  );
}

