export type TemporalRules = {
  blockPastDate?: boolean;
  minDate?: Date;
  maxDate?: Date;
  startDate?: Date; // For end_date < start_date check
};

export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

/**
 * Lightweight Temporal Constraint Engine
 * Optimized for sub-ms execution.
 */
export const temporalEngine = {
  validateDate(date: Date, rules: TemporalRules): ValidationResult {
    const now = new Date();
    // Normalize "today" to start of day for accurate comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // 1. Block Past Dates
    if (rules.blockPastDate) {
      if (checkDate < today) {
        return { isValid: false, error: "Past dates are not allowed." };
      }
    }

    // 2. Min Date (e.g., Start Date Constraint)
    if (rules.minDate) {
       const min = new Date(rules.minDate.getFullYear(), rules.minDate.getMonth(), rules.minDate.getDate());
       if (checkDate < min) {
        return { isValid: false, error: "Date cannot be before the start date." };
      }
    }
    
    // Support for explicit start date key if used differently
    if (rules.startDate) {
        const start = new Date(rules.startDate.getFullYear(), rules.startDate.getMonth(), rules.startDate.getDate());
        if (checkDate < start) {
            return { isValid: false, error: "End date cannot be before start date." };
        }
    }

    // 3. Max Date (e.g., Deadline)
    if (rules.maxDate) {
       const max = new Date(rules.maxDate.getFullYear(), rules.maxDate.getMonth(), rules.maxDate.getDate());
       if (checkDate > max) {
        return { isValid: false, error: "Date cannot be after the deadline." };
      }
    }

    return { isValid: true };
  },
};
