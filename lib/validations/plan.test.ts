import { describe, it, expect } from 'vitest';
import { createPlanSchema } from './plan';

describe('Plan Validation Schemas', () => {
  describe('createPlanSchema', () => {
    it('should validate a valid plan creation payload', () => {
      const validData = {
        name: 'Premium Plan',
        description: 'High-speed premium access',
        price: 29.99,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 100,
        active: true,
      };

      const result = createPlanSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept zero price for free plans', () => {
      const validData = {
        name: 'Free Plan',
        description: 'Basic free access',
        price: 0,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 10,
        active: true,
      };

      const result = createPlanSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept zero data limit for unlimited plans', () => {
      const validData = {
        name: 'Unlimited Plan',
        description: 'Unlimited data access',
        price: 99.99,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 0,
        active: true,
      };

      const result = createPlanSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept inactive plan', () => {
      const validData = {
        name: 'Legacy Plan',
        description: 'Old plan no longer available',
        price: 19.99,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 50,
        active: false,
      };

      const result = createPlanSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept various valid currency codes', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
      
      currencies.forEach((currency) => {
        const validData = {
          name: 'Test Plan',
          description: 'Test description',
          price: 10,
          currency,
          duration_days: 30,
          data_limit_gb: 10,
          active: true,
        };

        const result = createPlanSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });

    it('should reject empty plan name', () => {
      const invalidData = {
        name: '',
        description: 'Test description',
        price: 29.99,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 100,
        active: true,
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('name is required');
      }
    });

    it('should reject empty plan description', () => {
      const invalidData = {
        name: 'Test Plan',
        description: '',
        price: 29.99,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 100,
        active: true,
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('description is required');
      }
    });

    it('should reject negative price', () => {
      const invalidData = {
        name: 'Test Plan',
        description: 'Test description',
        price: -10,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: 100,
        active: true,
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('non-negative');
      }
    });

    it('should reject lowercase currency code', () => {
      const invalidData = {
        name: 'Test Plan',
        description: 'Test description',
        price: 29.99,
        currency: 'usd',
        duration_days: 30,
        data_limit_gb: 100,
        active: true,
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('uppercase');
      }
    });

    it('should reject mixed-case currency code', () => {
      const invalidData = {
        name: 'Test Plan',
        description: 'Test description',
        price: 29.99,
        currency: 'Usd',
        duration_days: 30,
        data_limit_gb: 100,
        active: true,
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('uppercase');
      }
    });

    it('should reject currency code shorter than 3 characters', () => {
      const invalidData = {
        name: 'Test Plan',
        description: 'Test description',
        price: 29.99,
        currency: 'US',
        duration_days: 30,
        data_limit_gb: 100,
        active: true,
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('exactly 3 characters');
      }
    });

    it('should reject currency code longer than 3 characters', () => {
      const invalidData = {
        name: 'Test Plan',
        description: 'Test description',
        price: 29.99,
        currency: 'USDD',
        duration_days: 30,
        data_limit_gb: 100,
        active: true,
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('exactly 3 characters');
      }
    });

    it('should reject currency code with numbers', () => {
      const invalidData = {
        name: 'Test Plan',
        description: 'Test description',
        price: 29.99,
        currency: 'US1',
        duration_days: 30,
        data_limit_gb: 100,
        active: true,
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('uppercase');
      }
    });

    it('should reject zero duration', () => {
      const invalidData = {
        name: 'Test Plan',
        description: 'Test description',
        price: 29.99,
        currency: 'USD',
        duration_days: 0,
        data_limit_gb: 100,
        active: true,
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive');
      }
    });

    it('should reject negative duration', () => {
      const invalidData = {
        name: 'Test Plan',
        description: 'Test description',
        price: 29.99,
        currency: 'USD',
        duration_days: -30,
        data_limit_gb: 100,
        active: true,
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive');
      }
    });

    it('should reject fractional duration days', () => {
      const invalidData = {
        name: 'Test Plan',
        description: 'Test description',
        price: 29.99,
        currency: 'USD',
        duration_days: 30.5,
        data_limit_gb: 100,
        active: true,
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('integer');
      }
    });

    it('should reject negative data limit', () => {
      const invalidData = {
        name: 'Test Plan',
        description: 'Test description',
        price: 29.99,
        currency: 'USD',
        duration_days: 30,
        data_limit_gb: -100,
        active: true,
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('non-negative');
      }
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        name: 'Test Plan',
        // missing other required fields
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept large data limits', () => {
      const validData = {
        name: 'Enterprise Plan',
        description: 'Large enterprise plan',
        price: 999.99,
        currency: 'USD',
        duration_days: 365,
        data_limit_gb: 10000,
        active: true,
      };

      const result = createPlanSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept decimal prices', () => {
      const validData = {
        name: 'Basic Plan',
        description: 'Basic access',
        price: 4.99,
        currency: 'USD',
        duration_days: 7,
        data_limit_gb: 5,
        active: true,
      };

      const result = createPlanSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept decimal data limits', () => {
      const validData = {
        name: 'Micro Plan',
        description: 'Micro access',
        price: 0.99,
        currency: 'USD',
        duration_days: 1,
        data_limit_gb: 0.5,
        active: true,
      };

      const result = createPlanSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
