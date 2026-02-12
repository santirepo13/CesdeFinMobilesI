import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  message,
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const getAlertClasses = () => {
    const baseClasses = 'alert d-flex align-items-center';
    const typeClasses = {
      success: 'alert-success',
      error: 'alert-danger',
      warning: 'alert-warning',
      info: 'alert-info'
    };
    
    return `${baseClasses} ${typeClasses[type]} ${className}`;
  };

  const getIcon = () => {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    return icons[type];
  };

  return (
    <div className={getAlertClasses()} role="alert">
      <span className="me-2" style={{ fontSize: '1.2rem' }}>
        {getIcon()}
      </span>
      <div className="flex-grow-1">
        {message}
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          className="btn-close"
          onClick={onDismiss}
          aria-label="Close"
        />
      )}
    </div>
  );
};

// Error message component for form fields
interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  className = '' 
}) => {
  if (!message) return null;
  
  return (
    <div className={`text-danger small mt-1 ${className}`}>
      <span className="me-1">✕</span>
      {message}
    </div>
  );
};

// Success message component
interface SuccessMessageProps {
  message: string;
  className?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
  message, 
  className = '' 
}) => {
  if (!message) return null;
  
  return (
    <div className={`text-success small mt-1 ${className}`}>
      <span className="me-1">✓</span>
      {message}
    </div>
  );
};

// Loading spinner component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };
  
  return (
    <div className={`spinner-border ${sizeClasses[size]} ${className}`} role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
  );
};

// Form submission button with loading state
interface SubmitButtonProps {
  isSubmitting: boolean;
  text: string;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  text,
  loadingText = 'Procesando...',
  className = '',
  disabled = false
}) => {
  return (
    <button
      type="submit"
      className={`btn btn-primary ${className}`}
      disabled={disabled || isSubmitting}
    >
      {isSubmitting ? (
        <>
          <LoadingSpinner size="sm" className="me-2" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  );
};