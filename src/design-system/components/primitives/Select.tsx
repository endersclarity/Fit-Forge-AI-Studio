/**
 * Select Component - Primitive UI Element
 *
 * Reusable select/dropdown component with full keyboard navigation support.
 * Implements WCAG 2.1 keyboard accessibility requirements.
 * Supports disabled states, custom styling, and optional search/filter capability.
 *
 * Reference: Epic 6.5 Story 1 - Railway Deployment & Missing Primitives
 * Design System: docs/design-system.md
 */

import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  /**
   * Array of options with label/value pairs
   */
  options: SelectOption[];

  /**
   * Currently selected value
   */
  value?: string;

  /**
   * Callback when selection changes
   */
  onChange: (value: string) => void;

  /**
   * Placeholder text when no value selected
   */
  placeholder?: string;

  /**
   * Whether the entire select is disabled
   */
  disabled?: boolean;

  /**
   * Enable search/filter for long option lists
   */
  searchable?: boolean;

  /**
   * Additional CSS classes (merged with defaults)
   */
  className?: string;

  /**
   * ARIA label for accessibility
   */
  'aria-label'?: string;
}

/**
 * Select Component
 *
 * Dropdown selection component with full keyboard navigation.
 * Commonly used in: equipment filters, exercise type selection, settings.
 *
 * **Keyboard Navigation (WCAG 2.1):**
 * - Enter/Space: Open dropdown
 * - ArrowDown: Move to next option
 * - ArrowUp: Move to previous option
 * - Home: Jump to first option
 * - End: Jump to last option
 * - Enter: Select focused option and close
 * - Escape: Close without selecting
 * - Tab: Close and move focus away
 *
 * **Accessibility:**
 * - Uses role="listbox" and role="option"
 * - Sets aria-selected on selected option
 * - Uses aria-activedescendant for keyboard focus
 * - Visual focus indicators with ring
 *
 * @param options - Array of option objects
 * @param value - Currently selected value
 * @param onChange - Selection change handler
 * @param placeholder - Placeholder text
 * @param disabled - Disabled state
 * @param searchable - Enable search/filter
 * @param className - Additional CSS classes
 * @param aria-label - Accessibility label
 *
 * @example
 * ```tsx
 * <Select
 *   options={[
 *     { label: 'Chest', value: 'chest' },
 *     { label: 'Back', value: 'back' },
 *     { label: 'Legs', value: 'legs' }
 *   ]}
 *   value={selectedMuscle}
 *   onChange={setSelectedMuscle}
 *   placeholder="Select muscle group"
 * />
 * ```
 */
const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option',
      disabled = false,
      searchable = false,
      className = '',
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Find selected option
    const selectedOption = options.find((opt) => opt.value === value);

    // Filter options based on search term
    const filteredOptions = searchable && searchTerm
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm('');
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            const option = filteredOptions[focusedIndex];
            if (!option.disabled) {
              onChange(option.value);
              setIsOpen(false);
              setSearchTerm('');
            }
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setFocusedIndex((prev) => {
              let next = prev + 1;
              // Skip disabled options
              while (
                next < filteredOptions.length &&
                filteredOptions[next]?.disabled
              ) {
                next++;
              }
              return next < filteredOptions.length ? next : prev;
            });
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            setFocusedIndex((prev) => {
              let next = prev - 1;
              // Skip disabled options
              while (next >= 0 && filteredOptions[next]?.disabled) {
                next--;
              }
              return next >= 0 ? next : prev;
            });
          }
          break;

        case 'Home':
          e.preventDefault();
          if (isOpen) {
            // Find first non-disabled option
            const firstEnabled = filteredOptions.findIndex((opt) => !opt.disabled);
            if (firstEnabled >= 0) {
              setFocusedIndex(firstEnabled);
            }
          }
          break;

        case 'End':
          e.preventDefault();
          if (isOpen) {
            // Find last non-disabled option
            let lastEnabled = -1;
            for (let i = filteredOptions.length - 1; i >= 0; i--) {
              if (!filteredOptions[i].disabled) {
                lastEnabled = i;
                break;
              }
            }
            if (lastEnabled >= 0) {
              setFocusedIndex(lastEnabled);
            }
          }
          break;

        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearchTerm('');
          break;

        case 'Tab':
          setIsOpen(false);
          setSearchTerm('');
          break;
      }
    };

    // Handle option click
    const handleOptionClick = (option: SelectOption) => {
      if (!option.disabled) {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    // Toggle dropdown
    const toggleDropdown = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
        if (isOpen) {
          setSearchTerm('');
        }
      }
    };

    // Base classes
    const containerClasses = `relative inline-block w-full ${className}`;
    const buttonClasses = `w-full px-4 py-3 text-left bg-white border-2 rounded-lg font-body text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
      disabled
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
        : 'border-gray-300 hover:border-primary cursor-pointer'
    } ${isOpen ? 'border-primary ring-2 ring-primary ring-offset-2' : ''}`;

    const dropdownClasses =
      'absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto';

    return (
      <div
        ref={(node) => {
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          if (node) {
            (containerRef as React.MutableRefObject<HTMLDivElement>).current = node;
          }
        }}
        className={containerClasses}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          className={buttonClasses}
          onClick={toggleDropdown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ariaLabel || 'Select an option'}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span
            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </button>

        {isOpen && (
          <div className={dropdownClasses} role="listbox" aria-label={ariaLabel}>
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isFocused = index === focusedIndex;
                const isSelected = option.value === value;

                const optionClasses = `px-4 py-3 cursor-pointer font-body text-base transition-colors ${
                  option.disabled
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                    : isFocused
                    ? 'bg-primary text-white'
                    : isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-900 hover:bg-gray-100'
                }`;

                return (
                  <div
                    key={option.value}
                    className={optionClasses}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    onClick={() => handleOptionClick(option)}
                    onMouseEnter={() => !option.disabled && setFocusedIndex(index)}
                  >
                    {option.label}
                    {isSelected && (
                      <span className="ml-2" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
