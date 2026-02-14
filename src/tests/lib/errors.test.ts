import { describe, it, expect } from 'vitest';
import { 
  ApplicationError, 
  ErrorCode, 
  AuthError, 
  DatabaseError, 
  ValidationError,
  createErrorResponse 
} from '@/lib/errors';

describe('Error Handling', () => {
  describe('ApplicationError', () => {
    it('should create error with correct properties', () => {
      const error = new ApplicationError(
        ErrorCode.AUTH_REQUIRED,
        'Authentication required',
        401
      );

      expect(error.code).toBe(ErrorCode.AUTH_REQUIRED);
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('ApplicationError');
    });

    it('should serialize to JSON correctly', () => {
      const error = new ApplicationError(
        ErrorCode.VALIDATION_FAILED,
        'Invalid input',
        400,
        { field: 'email' }
      );

      const json = error.toJSON();
      expect(json.code).toBe(ErrorCode.VALIDATION_FAILED);
      expect(json.message).toBe('Invalid input');
      expect(json.statusCode).toBe(400);
      expect(json.details).toEqual({ field: 'email' });
    });
  });

  describe('AuthError helpers', () => {
    it('should create auth required error', () => {
      const error = AuthError.required();
      expect(error.code).toBe(ErrorCode.AUTH_REQUIRED);
      expect(error.statusCode).toBe(401);
    });

    it('should create invalid credentials error', () => {
      const error = AuthError.invalidCredentials();
      expect(error.code).toBe(ErrorCode.AUTH_INVALID_CREDENTIALS);
      expect(error.statusCode).toBe(401);
    });

    it('should create insufficient permissions error', () => {
      const error = AuthError.insufficientPermissions('ADMIN');
      expect(error.code).toBe(ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS);
      expect(error.message).toContain('ADMIN');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('DatabaseError helpers', () => {
    it('should create not found error', () => {
      const error = DatabaseError.notFound('School');
      expect(error.code).toBe(ErrorCode.DB_NOT_FOUND);
      expect(error.message).toContain('School');
      expect(error.statusCode).toBe(404);
    });

    it('should create constraint violation error', () => {
      const error = DatabaseError.constraintViolation('unique_email');
      expect(error.code).toBe(ErrorCode.DB_CONSTRAINT_VIOLATION);
      expect(error.message).toContain('unique_email');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('ValidationError helpers', () => {
    it('should create validation failed error', () => {
      const details = { email: 'Invalid format' };
      const error = ValidationError.failed(details);
      expect(error.code).toBe(ErrorCode.VALIDATION_FAILED);
      expect(error.details).toEqual(details);
      expect(error.statusCode).toBe(400);
    });

    it('should create invalid input error', () => {
      const error = ValidationError.invalidInput('age', 'must be positive');
      expect(error.code).toBe(ErrorCode.VALIDATION_INVALID_INPUT);
      expect(error.message).toContain('age');
      expect(error.message).toContain('must be positive');
    });
  });

  describe('createErrorResponse', () => {
    it('should format ApplicationError correctly', () => {
      const error = new ApplicationError(
        ErrorCode.NOT_FOUND,
        'Resource not found',
        404
      );

      const response = createErrorResponse(error);
      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.NOT_FOUND);
      expect(response.error.message).toBe('Resource not found');
    });

    it('should format generic Error safely', () => {
      const error = new Error('Something broke');
      const response = createErrorResponse(error);
      
      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      // Message should be generic in production
    });
  });
});
