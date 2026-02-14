/**
 * Error Handling Utilities
 * 
 * Centralized error handling, logging, and reporting for the application.
 */

import * as Sentry from '@sentry/nextjs';

export enum ErrorCode {
  // Authentication
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS',
  
  // Database
  DB_QUERY_FAILED = 'DB_QUERY_FAILED',
  DB_CONSTRAINT_VIOLATION = 'DB_CONSTRAINT_VIOLATION',
  DB_NOT_FOUND = 'DB_NOT_FOUND',
  DB_CONNECTION_FAILED = 'DB_CONNECTION_FAILED',
  
  // Validation
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  VALIDATION_INVALID_INPUT = 'VALIDATION_INVALID_INPUT',
  
  // School Isolation
  SCHOOL_ISOLATION_VIOLATION = 'SCHOOL_ISOLATION_VIOLATION',
  SCHOOL_NOT_FOUND = 'SCHOOL_NOT_FOUND',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // General
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: any;
  stack?: string;
}

export class ApplicationError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: any;

  constructor(code: ErrorCode, message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
    };
  }
}

/**
 * Log error to monitoring service (Sentry)
 */
export function logError(error: Error | ApplicationError, context?: Record<string, any>) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
    if (context) {
      console.error('Context:', context);
    }
  }

  // Send to Sentry
  Sentry.captureException(error, {
    extra: context,
    level: error instanceof ApplicationError && error.statusCode < 500 ? 'warning' : 'error',
  });
}

/**
 * Create standardized API error response
 */
export function createErrorResponse(error: Error | ApplicationError) {
  if (error instanceof ApplicationError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.details : undefined,
      },
    };
  }

  // Unknown error - don't expose details in production
  return {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An unexpected error occurred',
    },
  };
}

/**
 * Authentication error helpers
 */
export const AuthError = {
  required: () => new ApplicationError(
    ErrorCode.AUTH_REQUIRED,
    'Authentication required',
    401
  ),
  
  invalidCredentials: () => new ApplicationError(
    ErrorCode.AUTH_INVALID_CREDENTIALS,
    'Invalid email or password',
    401
  ),
  
  sessionExpired: () => new ApplicationError(
    ErrorCode.AUTH_SESSION_EXPIRED,
    'Your session has expired. Please sign in again.',
    401
  ),
  
  insufficientPermissions: (requiredRole?: string) => new ApplicationError(
    ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
    `You don't have permission to perform this action${requiredRole ? ` (requires ${requiredRole} role)` : ''}`,
    403
  ),
};

/**
 * Database error helpers
 */
export const DatabaseError = {
  queryFailed: (details?: any) => new ApplicationError(
    ErrorCode.DB_QUERY_FAILED,
    'Database query failed',
    500,
    details
  ),
  
  notFound: (resource: string) => new ApplicationError(
    ErrorCode.DB_NOT_FOUND,
    `${resource} not found`,
    404
  ),
  
  constraintViolation: (constraint: string) => new ApplicationError(
    ErrorCode.DB_CONSTRAINT_VIOLATION,
    `Database constraint violated: ${constraint}`,
    400
  ),
};

/**
 * Validation error helpers
 */
export const ValidationError = {
  failed: (details: any) => new ApplicationError(
    ErrorCode.VALIDATION_FAILED,
    'Validation failed',
    400,
    details
  ),
  
  invalidInput: (field: string, reason: string) => new ApplicationError(
    ErrorCode.VALIDATION_INVALID_INPUT,
    `Invalid input for ${field}: ${reason}`,
    400
  ),
};

/**
 * School isolation error
 */
export const SchoolError = {
  isolationViolation: () => new ApplicationError(
    ErrorCode.SCHOOL_ISOLATION_VIOLATION,
    'Access denied: This resource belongs to a different school',
    403
  ),
  
  notFound: () => new ApplicationError(
    ErrorCode.SCHOOL_NOT_FOUND,
    'School not found',
    404
  ),
};
