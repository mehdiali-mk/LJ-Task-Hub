import { useState, useEffect, useRef, useCallback } from 'react';

interface UsernameValidationResult {
  isValid: boolean | null;
  isChecking: boolean;
  error: string | null;
  suggestions: string[];
}

interface UseUsernameValidatorOptions {
  debounceMs?: number;
  minLength?: number;
  maxLength?: number;
  checkAvailability?: (username: string) => Promise<boolean>;
}

/**
 * Real-time Username Validator Hook
 * 
 * Features:
 * - 300ms debounce to prevent network saturation
 * - AbortController to cancel stale requests
 * - Format validation (alphanumeric, underscores)
 * - Availability checking via API
 * - Smart suggestions for taken usernames
 */
export function useUsernameValidator(
  username: string,
  options: UseUsernameValidatorOptions = {}
): UsernameValidationResult {
  const {
    debounceMs = 300,
    minLength = 3,
    maxLength = 30,
    checkAvailability,
  } = options;

  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // AbortController for cancelling stale requests
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Format validation (sync, immediate)
  const validateFormat = useCallback((value: string): string | null => {
    if (!value) {
      return null; // Empty is neutral, not an error
    }
    
    if (value.length < minLength) {
      return `Username must be at least ${minLength} characters`;
    }
    
    if (value.length > maxLength) {
      return `Username must be less than ${maxLength} characters`;
    }
    
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
      if (/^[0-9]/.test(value)) {
        return 'Username must start with a letter';
      }
      return 'Username can only contain letters, numbers, and underscores';
    }
    
    // Reserved usernames
    const reserved = ['admin', 'root', 'system', 'support', 'help', 'TaskForge'];
    if (reserved.includes(value.toLowerCase())) {
      return 'This username is reserved';
    }
    
    return null;
  }, [minLength, maxLength]);

  // Generate suggestions for taken usernames
  const generateSuggestions = useCallback((base: string): string[] => {
    const suggestions: string[] = [];
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000);
    
    suggestions.push(`${base}${year}`);
    suggestions.push(`${base}_${random}`);
    suggestions.push(`the_${base}`);
    suggestions.push(`${base}_real`);
    suggestions.push(`${base}${Math.floor(Math.random() * 100)}`);
    
    return suggestions.slice(0, 3);
  }, []);

  // Main validation effect
  useEffect(() => {
    // Cancel any pending operations
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset state for empty input
    if (!username) {
      setIsValid(null);
      setError(null);
      setIsChecking(false);
      setSuggestions([]);
      return;
    }

    // Immediate format validation
    const formatError = validateFormat(username);
    if (formatError) {
      setIsValid(false);
      setError(formatError);
      setIsChecking(false);
      setSuggestions([]);
      return;
    }

    // If no availability check function, format is valid
    if (!checkAvailability) {
      setIsValid(true);
      setError(null);
      setIsChecking(false);
      setSuggestions([]);
      return;
    }

    // Debounced availability check
    setIsChecking(true);
    setIsValid(null);
    setError(null);

    debounceTimerRef.current = setTimeout(async () => {
      // Create new AbortController for this request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const isAvailable = await checkAvailability(username);
        
        // Check if this request was aborted
        if (controller.signal.aborted) return;

        if (isAvailable) {
          setIsValid(true);
          setError(null);
          setSuggestions([]);
        } else {
          setIsValid(false);
          setError('Username is already taken');
          setSuggestions(generateSuggestions(username));
        }
      } catch (err) {
        // Check if this is an abort error
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        // Only set error if not aborted
        if (!controller.signal.aborted) {
          setIsValid(null);
          setError('Failed to check availability');
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsChecking(false);
        }
      }
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [username, debounceMs, validateFormat, checkAvailability, generateSuggestions]);

  return {
    isValid,
    isChecking,
    error,
    suggestions,
  };
}

/**
 * Username Input Component
 * Displays validation state inline
 */
interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  validation: UsernameValidationResult;
  onSelectSuggestion?: (suggestion: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function UsernameInput({
  value,
  onChange,
  validation,
  onSelectSuggestion,
  placeholder = 'Enter username',
  disabled = false,
  className = '',
}: UsernameInputProps) {
  const { isValid, isChecking, error, suggestions } = validation;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/\s/g, ''))}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-12 input-glass rounded-xl
            transition-all duration-200
            ${isValid === true ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : ''}
            ${isValid === false ? 'border-rose-500/50 ring-1 ring-rose-500/20' : ''}
          `}
        />
        
        {/* Status indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isChecking && (
            <svg className="w-5 h-5 kinetic-loader text-glass-secondary" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
            </svg>
          )}
          {!isChecking && isValid === true && (
            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {!isChecking && isValid === false && (
            <svg className="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-rose-400 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-glass-muted">Try one of these:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSelectSuggestion?.(suggestion)}
                className="px-3 py-1.5 text-sm deep-glass-sm rounded-lg hover:bg-white/10 transition-colors text-glass-secondary"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
