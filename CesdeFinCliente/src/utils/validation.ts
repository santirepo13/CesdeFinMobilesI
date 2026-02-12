// Form validation utilities

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
  amount: /^\d+(\.\d{1,2})?$/
};

// Validation messages
export const messages = {
  required: 'Este campo es obligatorio',
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `No puede tener más de ${max} caracteres`,
  email: 'Ingrese un correo electrónico válido',
  password: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos',
  username: 'El usuario debe tener entre 3 y 20 caracteres, solo letras, números y guiones bajos',
  name: 'El nombre solo puede contener letras y espacios',
  amount: 'Ingrese un monto válido',
  passwordMatch: 'Las contraseñas no coinciden'
};

// Validate a single field
export const validateField = (name: string, value: string, rules: ValidationRule): string | null => {
  // Required validation
  if (rules.required && (!value || value.trim() === '')) {
    return messages.required;
  }

  // Skip other validations if field is empty and not required
  if (!value || value.trim() === '') {
    return null;
  }

  // Min length validation
  if (rules.minLength && value.length < rules.minLength) {
    return messages.minLength(rules.minLength);
  }

  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    return messages.maxLength(rules.maxLength);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    // Check if it's a known pattern
    if (rules.pattern === patterns.email) return messages.email;
    if (rules.pattern === patterns.password) return messages.password;
    if (rules.pattern === patterns.username) return messages.username;
    if (rules.pattern === patterns.name) return messages.name;
    if (rules.pattern === patterns.amount) return messages.amount;
    return 'Formato inválido';
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

// Validate entire form
export const validateForm = (formData: { [key: string]: string }, validationRules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(validationRules).forEach(fieldName => {
    const fieldValue = formData[fieldName] || '';
    const fieldRules = validationRules[fieldName];
    const error = validateField(fieldName, fieldValue, fieldRules);
    
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

// Login form validation rules (less strict for password)
export const loginValidationRules: ValidationRules = {
  identifier: {
    required: true,
    minLength: 3
  },
  clave: {
    required: true
  }
};

// Registration form validation rules (strict password validation)
export const registrationValidationRules: ValidationRules = {
  identifier: {
    required: true,
    minLength: 3
  },
  clave: {
    required: true,
    minLength: 8,
    pattern: patterns.password
  },
  nombre: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: patterns.name
  },
  correo: {
    required: true,
    pattern: patterns.email
  },
  usuario: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: patterns.username
  },
  confirmPassword: {
    required: true,
    custom: (value: string) => {
      // This will be handled in the component with access to both password fields
      return null;
    }
  }
};

// Keep for backward compatibility
export const authValidationRules = registrationValidationRules;

// Validate password match
export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) {
    return messages.passwordMatch;
  }
  return null;
};

// Real-time validation hook helper
export const createValidationHelper = (rules: ValidationRules) => {
  return (formData: { [key: string]: string }, fieldName?: string) => {
    if (fieldName) {
      // Validate single field
      const error = validateField(fieldName, formData[fieldName] || '', rules[fieldName]);
      return error ? { [fieldName]: error } : {};
    } else {
      // Validate entire form
      return validateForm(formData, rules);
    }
  };
};