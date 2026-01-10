import React, { useRef, useState, useCallback, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  onChange?: (otp: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

/**
 * High-Performance OTP Input Component
 * 
 * Features:
 * - GPU-accelerated transitions via translate3d
 * - Optimistic UI with 6ms response (targeting 165Hz)
 * - Auto-focus navigation between digits
 * - Paste support for full OTP
 */
export function OTPInput({
  length = 6,
  onComplete,
  onChange,
  disabled = false,
  autoFocus = true,
  className = '',
}: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);
  const [isActive, setIsActive] = useState<boolean[]>(Array(length).fill(false));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Optimistic UI: immediate visual feedback
  const handleChange = useCallback((index: number, value: string) => {
    // Only accept single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newValues = [...values];
    newValues[index] = digit;
    setValues(newValues);
    
    // Immediate visual feedback (optimistic UI)
    const newActive = [...isActive];
    newActive[index] = !!digit;
    setIsActive(newActive);

    // Notify parent
    const otp = newValues.join('');
    onChange?.(otp);

    // Auto-advance to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check completion
    if (newValues.every(v => v) && newValues.join('').length === length) {
      onComplete?.(newValues.join(''));
    }
  }, [values, isActive, length, onChange, onComplete]);

  // Handle backspace
  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [values]);

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (pastedData.length > 0) {
      const newValues = Array(length).fill('');
      const newActive = Array(length).fill(false);
      
      for (let i = 0; i < pastedData.length; i++) {
        newValues[i] = pastedData[i];
        newActive[i] = true;
      }
      
      setValues(newValues);
      setIsActive(newActive);
      
      const otp = newValues.join('');
      onChange?.(otp);
      
      if (pastedData.length === length) {
        onComplete?.(otp);
      } else {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  }, [length, onChange, onComplete]);

  // Auto-focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  return (
    <div 
      className={`flex items-center justify-center gap-2 sm:gap-3 ${className}`}
      onPaste={handlePaste}
    >
      {Array.from({ length }).map((_, index) => (
        <div
          key={index}
          className="relative"
          style={{
            // GPU-accelerated container
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform',
          }}
        >
          <input
            ref={el => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={values[index]}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            className={`
              w-12 h-14 sm:w-14 sm:h-16
              text-center text-2xl sm:text-3xl font-bold
              input-glass
              rounded-xl
              transition-all duration-150
              ${focusedIndex === index 
                ? 'ring-2 ring-white/30 border-white/25' 
                : ''
              }
              ${isActive[index] 
                ? 'border-white/20 text-glass-primary' 
                : 'text-glass-muted'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            style={{
              // GPU-accelerated transforms for 165Hz
              transform: isActive[index] 
                ? 'translate3d(0, -2px, 0) scale(1.02)' 
                : 'translate3d(0, 0, 0) scale(1)',
              transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
            aria-label={`Digit ${index + 1}`}
          />
          
          {/* Active indicator dot */}
          <div
            className={`
              absolute bottom-1 left-1/2 -translate-x-1/2
              w-1.5 h-1.5 rounded-full
              transition-all duration-200
              ${isActive[index] 
                ? 'bg-emerald-400 opacity-100' 
                : 'bg-white/20 opacity-0'
              }
            `}
            style={{
              transform: isActive[index] 
                ? 'translate3d(-50%, 0, 0) scale(1)' 
                : 'translate3d(-50%, 0, 0) scale(0)',
            }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * OTP Verification Component with loading state
 */
interface OTPVerificationProps {
  title?: string;
  description?: string;
  onVerify: (otp: string) => Promise<boolean>;
  onResend?: () => Promise<void>;
  resendCooldown?: number;
}

export function OTPVerification({
  title = "Enter Verification Code",
  description = "We've sent a 6-digit code to your email",
  onVerify,
  onResend,
  resendCooldown = 60,
}: OTPVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleComplete = async (otp: string) => {
    setIsVerifying(true);
    setError(null);
    
    try {
      const success = await onVerify(otp);
      if (!success) {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending || !onResend) return;
    
    setIsResending(true);
    try {
      await onResend();
      setResendTimer(resendCooldown);
      setError(null);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-glass-heading">{title}</h2>
        <p className="text-glass-secondary">{description}</p>
      </div>

      <OTPInput
        onComplete={handleComplete}
        disabled={isVerifying}
        autoFocus
      />

      {error && (
        <p className="text-rose-400 text-sm animate-in fade-in slide-in-from-top-2">
          {error}
        </p>
      )}

      {isVerifying && (
        <div className="flex items-center gap-2 text-glass-secondary">
          <svg className="w-5 h-5 kinetic-loader" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
          </svg>
          <span>Verifying...</span>
        </div>
      )}

      {onResend && (
        <button
          onClick={handleResend}
          disabled={resendTimer > 0 || isResending}
          className={`
            text-sm transition-all duration-200
            ${resendTimer > 0 
              ? 'text-glass-muted cursor-not-allowed' 
              : 'text-glass-secondary hover:text-glass-primary'
            }
          `}
        >
          {isResending ? 'Sending...' : 
           resendTimer > 0 ? `Resend code in ${resendTimer}s` : 
           'Resend code'}
        </button>
      )}
    </div>
  );
}
