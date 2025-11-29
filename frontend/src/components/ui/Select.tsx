import { SelectHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options?: { value: string; label: string }[];
  onChange?: (value: string) => void;
  showSelectedCount?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, options, onChange, value, showSelectedCount, isOpen: controlledIsOpen, onOpenChange, ...props }, ref) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const setIsOpen = onOpenChange || setInternalIsOpen;

    // If it's a native select (children provided), use native select
    if (children) {
      return (
        <select
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ring-offset-white dark:ring-offset-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          value={value}
          onChange={(e) => {
            if (onChange) {
              onChange(e.target.value);
            }
          }}
          {...props}
        >
          {children}
        </select>
      );
    }

    // Custom dropdown for better UX
    if (options) {
      const selectedOption = options.find((opt) => opt.value === value);
      let selectedLabel = 'Select an option';
      if (selectedOption) {
        selectedLabel = selectedOption.label || selectedOption.value;
      } else if (value && value !== '') {
        selectedLabel = String(value);
      } else if (options.length > 0 && options[0].value === '') {
        selectedLabel = options[0].label;
      }

      // Close dropdown when clicking outside
      useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          const element = document.querySelector(`[data-select-id="${props.id}"]`);
          if (element && !element.contains(target)) {
            setIsOpen(false);
          }
        };

        const timeoutId = setTimeout(() => {
          document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => {
          clearTimeout(timeoutId);
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [isOpen, props.id, setIsOpen]);

      return (
        <div className="relative" data-select-id={props.id}>
          <button
            type="button"
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-white dark:ring-offset-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            onBlur={() => {
              setTimeout(() => setIsOpen(false), 200);
            }}
          >
            <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>{selectedLabel}</span>
            <ChevronDown className={cn('h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform', isOpen && 'rotate-180')} />
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-700',
                    value === option.value && 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                  )}
                  onClick={() => {
                    if (onChange) {
                      onChange(option.value);
                    }
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  }
);

Select.displayName = 'Select';

export default Select;
