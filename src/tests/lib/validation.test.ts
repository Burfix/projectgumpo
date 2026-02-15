import { describe, it, expect } from 'vitest';
import { validate, validateBatch, sanitizeInput, isValidEmail, isValidPhone, isValidDateOfBirth } from '@/lib/validation/helpers';
import { ValidationSchemas } from '@/lib/validation/schemas';

describe('Validation Helpers', () => {
  describe('validate', () => {
    it('should validate correct email format', () => {
      const result = validate(ValidationSchemas.common.email, 'test@example.com');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('should fail invalid email format', () => {
      const result = validate(ValidationSchemas.common.email, 'invalid-email');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
      }
    });

    it('should validate password with requirements', () => {
      const result = validate(ValidationSchemas.common.password, 'SecurePass123');
      expect(result.success).toBe(true);
    });

    it('should fail weak password', () => {
      const result = validate(ValidationSchemas.common.password, 'weak');
      expect(result.success).toBe(false);
    });
  });

  describe('School validation', () => {
    it('should validate valid school creation data', () => {
      const schoolData = {
        name: 'Happy Kids Academy',
        city: 'Cape Town',
        type: 'Preschool' as const,
      };

      const result = validate(ValidationSchemas.school.create, schoolData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Happy Kids Academy');
        expect(result.data.type).toBe('Preschool');
      }
    });

    it('should fail invalid school type', () => {
      const schoolData = {
        name: 'Test School',
        city: 'Test City',
        type: 'InvalidType',
      };

      const result = validate(ValidationSchemas.school.create, schoolData);
      expect(result.success).toBe(false);
    });

    it('should fail missing required fields', () => {
      const schoolData = {
        name: 'Test School',
      };

      const result = validate(ValidationSchemas.school.create, schoolData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details).toBeTruthy();
      }
    });
  });

  describe('User validation', () => {
    it('should validate user creation data', () => {
      const userData = {
        email: 'teacher@school.com',
        name: 'Jane Doe',
        role: 'TEACHER' as const,
        schoolId: 1,
      };

      const result = validate(ValidationSchemas.user.create, userData);
      expect(result.success).toBe(true);
    });

    it('should validate optional phone number', () => {
      const userData = {
        email: 'teacher@school.com',
        name: 'Jane Doe',
        role: 'TEACHER' as const,
        schoolId: 1,
        phone: '+27 12 345 6789',
      };

      const result = validate(ValidationSchemas.user.create, userData);
      expect(result.success).toBe(true);
    });

    it('should fail invalid phone format', () => {
      const userData = {
        email: 'teacher@school.com',
        name: 'Jane Doe',
        role: 'TEACHER' as const,
        schoolId: 1,
        phone: 'abc',
      };

      const result = validate(ValidationSchemas.user.create, userData);
      expect(result.success).toBe(false);
    });
  });

  describe('Child validation', () => {
    it('should validate child creation data', () => {
      const childData = {
        first_name: 'Emma',
        last_name: 'Smith',
        date_of_birth: '2021-05-15',
        schoolId: 1,
      };

      const result = validate(ValidationSchemas.child.create, childData);
      expect(result.success).toBe(true);
    });

    it('should fail invalid date format', () => {
      const childData = {
        first_name: 'Emma',
        last_name: 'Smith',
        date_of_birth: '05/15/2021',
        schoolId: 1,
      };

      const result = validate(ValidationSchemas.child.create, childData);
      expect(result.success).toBe(false);
    });

    it('should validate optional medical info', () => {
      const childData = {
        first_name: 'Emma',
        last_name: 'Smith',
        date_of_birth: '2021-05-15',
        medical_info: 'Asthma',
        allergies: 'Peanuts, dairy',
        schoolId: 1,
      };

      const result = validate(ValidationSchemas.child.create, childData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.medical_info).toBe('Asthma');
      }
    });
  });

  describe('Activity validation', () => {
    it('should validate meal logging', () => {
      const mealData = {
        childId: 1,
        meal_type: 'lunch' as const,
        food_items: 'Pasta, vegetables, apple',
        amount_eaten: 'most' as const,
        schoolId: 1,
      };

      const result = validate(ValidationSchemas.activity.meal, mealData);
      expect(result.success).toBe(true);
    });

    it('should validate nap time logging', () => {
      const napData = {
        childId: 1,
        start_time: '13:00',
        end_time: '14:30',
        schoolId: 1,
      };

      const result = validate(ValidationSchemas.activity.nap, napData);
      expect(result.success).toBe(true);
    });

    it('should fail invalid nap times (end before start)', () => {
      const napData = {
        childId: 1,
        start_time: '14:30',
        end_time: '13:00',
        schoolId: 1,
      };

      const result = validate(ValidationSchemas.activity.nap, napData);
      expect(result.success).toBe(false);
    });

    it('should validate incident reporting', () => {
      const incidentData = {
        childId: 1,
        incident_type: 'injury' as const,
        description: 'Minor scrape on knee during outdoor play',
        action_taken: 'Cleaned wound, applied bandage',
        notify_parent: true,
        schoolId: 1,
      };

      const result = validate(ValidationSchemas.activity.incident, incidentData);
      expect(result.success).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('should escape HTML entities', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    it('should trim whitespace', () => {
      const input = '  test input  ';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('test input');
    });

    it('should remove null bytes', () => {
      const input = 'test\0input';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('\0');
    });

    it('should truncate to max length', () => {
      const input = 'a'.repeat(100);
      const sanitized = sanitizeInput(input, { maxLength: 50 });
      expect(sanitized.length).toBe(50);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email format', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.za')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });

    it('should reject disposable email domains', () => {
      expect(isValidEmail('test@tempmail.com')).toBe(false);
      expect(isValidEmail('user@10minutemail.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate phone numbers with 10-15 digits', () => {
      expect(isValidPhone('0123456789')).toBe(true);
      expect(isValidPhone('+27 12 345 6789')).toBe(true);
      expect(isValidPhone('(012) 345-6789')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });

  describe('isValidDateOfBirth', () => {
    it('should validate reasonable dates of birth', () => {
      expect(isValidDateOfBirth('2020-01-15')).toBe(true);
      expect(isValidDateOfBirth('2018-06-30')).toBe(true);
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const dateString = futureDate.toISOString().split('T')[0];
      expect(isValidDateOfBirth(dateString)).toBe(false);
    });

    it('should reject dates outside reasonable age range', () => {
      expect(isValidDateOfBirth('2005-01-01')).toBe(false); // Too old for preschool
    });
  });

  describe('validateBatch', () => {
    it('should validate multiple inputs successfully', () => {
      const result = validateBatch([
        {
          key: 'email',
          schema: ValidationSchemas.common.email,
          data: 'test@example.com',
        },
        {
          key: 'name',
          schema: ValidationSchemas.common.name,
          data: 'John Doe',
        },
      ]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.name).toBe('John Doe');
      }
    });

    it('should fail if any validation fails', () => {
      const result = validateBatch([
        {
          key: 'email',
          schema: ValidationSchemas.common.email,
          data: 'invalid-email',
        },
        {
          key: 'name',
          schema: ValidationSchemas.common.name,
          data: 'John Doe',
        },
      ]);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.details).toBeTruthy();
      }
    });
  });
});
