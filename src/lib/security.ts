
import DOMPurify from 'isomorphic-dompurify';

// File validation configuration
export const FILE_VALIDATION = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_EXTENSIONS: [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.png', '.jpg', '.jpeg', '.gif', '.txt', '.csv'
  ],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg',
    'image/gif',
    'text/plain',
    'text/csv'
  ]
};

// File validation function - updated to be more permissive for business documents
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > FILE_VALIDATION.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${FILE_VALIDATION.MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!FILE_VALIDATION.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${FILE_VALIDATION.ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  // Check MIME type
  if (!FILE_VALIDATION.ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Please ensure the file is not corrupted.`
    };
  }

  // Updated filename validation - more permissive for business documents
  // Check base filename (without extension) against reserved names
  const baseName = file.name.split('.')[0];
  const reservedNamePattern = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
  
  if (reservedNamePattern.test(baseName)) {
    return {
      isValid: false,
      error: `Filename uses a reserved system name. Please rename the file.`
    };
  }

  // Check for dangerous patterns individually
  if (/\.\./.test(file.name)) {
    return {
      isValid: false,
      error: `Filename contains path traversal patterns. Please rename the file.`
    };
  }

  if (/[<>:"|?*]/.test(file.name)) {
    return {
      isValid: false,
      error: `Filename contains invalid characters. Please avoid: < > : " | ? *`
    };
  }

  if (/^\..*\..*$/.test(file.name)) {
    return {
      isValid: false,
      error: `Invalid filename format. Please rename the file.`
    };
  }

  if (/\.(exe|bat|cmd|scr|pif|com|vbs|js|jar|app|dmg)$/i.test(file.name)) {
    return {
      isValid: false,
      error: `Executable file types are not allowed for security reasons.`
    };
  }

  // Check filename length
  if (file.name.length > 255) {
    return {
      isValid: false,
      error: `Filename is too long. Maximum 255 characters allowed.`
    };
  }

  return { isValid: true };
};

// Password strength validation
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: true
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`);
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_SYMBOLS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  const validation = validatePassword(password);
  if (!validation.isValid) return 'weak';
  
  let score = 0;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  if (password.length >= 16) score++;

  if (score <= 3) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};

// Input sanitization
export const sanitizeInput = (input: string, maxLength?: number): string => {
  let sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  return sanitized.trim();
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Rate limiting storage (client-side tracking)
const rateLimitStore = new Map<string, { attempts: number; lastAttempt: number }>();

export const checkRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    rateLimitStore.set(key, { attempts: 1, lastAttempt: now });
    return true;
  }

  // Reset if window has passed
  if (now - record.lastAttempt > windowMs) {
    rateLimitStore.set(key, { attempts: 1, lastAttempt: now });
    return true;
  }

  // Check if within limits
  if (record.attempts >= maxAttempts) {
    return false;
  }

  // Increment attempts
  record.attempts++;
  record.lastAttempt = now;
  return true;
};

// Security event logging
export const logSecurityEvent = async (eventType: string, eventData?: any) => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.rpc('log_security_event', {
      p_event_type: eventType,
      p_event_data: eventData || null
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Safe error messages (avoid exposing sensitive information)
export const getSafeErrorMessage = (error: any): string => {
  const safeMessages: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password',
    'Email not confirmed': 'Please verify your email address',
    'User not found': 'Invalid email or password',
    'Password is too weak': 'Password does not meet requirements',
    'Rate limit exceeded': 'Too many attempts. Please try again later.',
    'Network error': 'Connection failed. Please check your internet connection.',
    'Database error': 'Service temporarily unavailable. Please try again later.',
    'Storage error': 'File upload failed. Please try again.',
    'Unauthorized': 'You do not have permission to perform this action',
    'Forbidden': 'Access denied'
  };

  const errorMessage = error?.message || 'An unexpected error occurred';
  
  // Return safe message if we have one, otherwise generic message
  return safeMessages[errorMessage] || 'An error occurred. Please try again.';
};
