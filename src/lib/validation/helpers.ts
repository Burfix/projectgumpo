/**
 * Validation utility helpers
 * Provides reusable functions for validating requests in API routes and server actions
 */

import { NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError, createErrorResponse } from '@/lib/errors';

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: Record<string, string[]> };

/**
 * Validate data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with typed data or error
 */
export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const details: Record<string, string[]> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        if (!details[path]) {
          details[path] = [];
        }
        details[path].push(err.message);
      });

      return {
        success: false,
        error: 'Validation failed',
        details,
      };
    }

    return {
      success: false,
      error: 'An unexpected validation error occurred',
    };
  }
}

/**
 * Validate and parse request body for API routes
 * @param request - Next.js Request object
 * @param schema - Zod schema to validate against
 * @returns Validation result or NextResponse error
 * 
 * @example
 * ```ts
 * export async function POST(request: Request) {
 *   const result = await validateRequest(request, SchoolSchemas.create);
 *   if (!result.success) {
 *     return result.response;
 *   }
 *   const { data } = result;
 *   // ... use validated data
 * }
 * ```
 */
export async function validateRequest<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<
  | { success: true; data: T }
  | { success: false; response: NextResponse }
> {
  try {
    const body = await request.json();
    const result = validate(schema, body);

    if (!result.success) {
      const error = ValidationError.failed(result.details || {});
      return {
        success: false,
        response: NextResponse.json(
          { error: error.message, details: result.details },
          { status: error.statusCode }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid JSON or malformed request' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate data for server actions
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result for server actions
 * 
 * @example
 * ```ts
 * export async function createUser(input: any) {
 *   const result = validateServerAction(UserSchemas.create, input);
 *   if (!result.success) {
 *     return { success: false, error: result.error };
 *   }
 *   const { data } = result;
 *   // ... use validated data
 * }
 * ```
 */
export function validateServerAction<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  return validate(schema, data);
}

/**
 * Validate query parameters from URL search params
 * @param searchParams - URLSearchParams object
 * @param schema - Zod schema to validate against
 * @returns Validation result
 * 
 * @example
 * ```ts
 * export async function GET(request: Request) {
 *   const { searchParams } = new URL(request.url);
 *   const result = validateQueryParams(searchParams, SearchSchemas.search);
 *   if (!result.success) {
 *     return NextResponse.json({ error: result.error }, { status: 400 });
 *   }
 *   const { data } = result;
 *   // ... use validated query params
 * }
 * ```
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): ValidationResult<T> {
  const params: Record<string, any> = {};
  searchParams.forEach((value, key) => {
    // Try to parse numbers
    if (!isNaN(Number(value)) && value !== '') {
      params[key] = Number(value);
    } else if (value === 'true') {
      params[key] = true;
    } else if (value === 'false') {
      params[key] = false;
    } else {
      params[key] = value;
    }
  });

  return validate(schema, params);
}

/**
 * Format Zod errors for user-friendly display
 * @param error - ZodError instance
 * @returns Formatted error message
 */
export function formatZodError(error: ZodError): string {
  const firstError = error.issues[0];
  if (firstError) {
    const path = firstError.path.length > 0 ? `${firstError.path.join('.')}: ` : '';
    return `${path}${firstError.message}`;
  }
  return 'Validation failed';
}

/**
 * Sanitize and validate file uploads
 * @param file - File object
 * @param options - Upload options
 * @returns Validation result
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): ValidationResult<File> {
  const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB default
  const allowedTypes = options.allowedTypes || [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (file.size > maxSize) {
    return {
      success: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: `File type must be one of: ${allowedTypes.join(', ')}`,
    };
  }

  return { success: true, data: file };
}

/**
 * Validate and sanitize HTML input to prevent XSS
 * @param input - User input string
 * @param options - Sanitization options
 * @returns Sanitized string
 */
export function sanitizeInput(
  input: string,
  options: {
    allowHtml?: boolean;
    maxLength?: number;
  } = {}
): string {
  let sanitized = input.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // If HTML is not allowed, escape HTML entities
  if (!options.allowHtml) {
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Truncate if max length is specified
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
}

/**
 * Validate email format (additional checks beyond Zod)
 * @param email - Email address to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  // Check for valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  // Check for common disposable email domains (basic list)
  const disposableDomains = [
    'tempmail.com',
    'guerrillamail.com',
    '10minutemail.com',
    'throwaway.email',
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    return false;
  }

  return true;
}

/**
 * Validate phone number format (additional checks beyond Zod)
 * @param phone - Phone number to validate
 * @returns True if valid
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Check if it has between 10 and 15 digits
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Validate date is not in the future
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if valid
 */
export function isDateInPast(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
}

/**
 * Validate date of birth is reasonable (not too old or in future)
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if valid
 */
export function isValidDateOfBirth(dateString: string): boolean {
  const dob = new Date(dateString);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();

  // Must be in the past
  if (!isDateInPast(dateString)) {
    return false;
  }

  // Reasonable age range (0-10 for children in preschool)
  return age >= 0 && age <= 10;
}

/**
 * Create a type-safe validator function for repeated use
 * @param schema - Zod schema
 * @returns Validator function
 * 
 * @example
 * ```ts
 * const validateSchool = createValidator(SchoolSchemas.create);
 * const result = validateSchool(data);
 * ```
 */
export function createValidator<T>(schema: ZodSchema<T>) {
  return (data: unknown): ValidationResult<T> => validate(schema, data);
}

/**
 * Batch validate multiple inputs
 * @param validations - Array of validation operations
 * @returns Combined validation result
 */
export function validateBatch<T extends Record<string, any>>(
  validations: Array<{
    key: keyof T;
    schema: ZodSchema<any>;
    data: unknown;
  }>
): ValidationResult<T> {
  const result: any = {};
  const errors: Record<string, string[]> = {};

  for (const { key, schema, data } of validations) {
    const validation = validate(schema, data);

    if (validation.success) {
      result[key] = validation.data;
    } else {
      errors[key as string] = [validation.error];
      if (validation.details) {
        Object.assign(errors, validation.details);
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      error: 'Validation failed for one or more fields',
      details: errors,
    };
  }

  return { success: true, data: result as T };
}
