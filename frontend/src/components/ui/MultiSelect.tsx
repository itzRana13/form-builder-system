import { useState, forwardRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronDown } from 'lucide-react';

interface MultiSelectProps {
  id?: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ id, options, value, onChange, onBlur, className, placeholder, isOpen: controlledIsOpen, onOpenChange }, ref) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const setIsOpen = onOpenChange || setInternalIsOpen;

    const handleToggle = (option: string) => {
      if (value.includes(option)) {
        onChange(value.filter((v) => v !== option));
      } else {
        onChange([...value, option]);
      }
    };

    const handleRemove = (option: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(value.filter((v) => v !== option));
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const container = document.querySelector(`[data-multiselect-id="${id}"]`);
        if (container && !container.contains(target)) {
          setIsOpen(false);
        }
      };

      // Use setTimeout to avoid immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, id, setIsOpen]);

    const displayItems = value.slice(0, 2);
    const remainingCount = value.length - 2;

    return (
      <div className="relative" ref={ref} data-multiselect-id={id}>
        <div
          className={cn(
            'min-h-[40px] w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm cursor-pointer flex items-center flex-wrap gap-2',
            className
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          onBlur={(e) => {
            // Only call onBlur if focus is moving outside the component
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              onBlur?.();
            }
          }}
        >
          {value.length === 0 ? (
            <span className="text-gray-400 dark:text-gray-500">{placeholder || 'Select options'}</span>
          ) : (
            <>
              {displayItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-1 rounded text-xs"
                >
                  {item}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(item, e)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="inline-flex items-center bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-1 rounded text-xs">
                  +{remainingCount}
                </span>
              )}
            </>
          )}
          <ChevronDown className={cn('h-4 w-4 ml-auto text-gray-400 dark:text-gray-500 transition-transform', isOpen && 'rotate-180')} />
        </div>

        {isOpen && (
          <div 
            className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-2 space-y-1">
              {options.map((option) => (
                <label
                  key={option}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggle(option);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-blue-600 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';

export default MultiSelect;
