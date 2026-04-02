import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateCustomerName,
  parseMoney,
} from '../validation/validators';

describe('validateEmail', () => {
  it('returns null for a valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull();
  });

  it('returns error for empty string', () => {
    expect(validateEmail('')).toBe('Email is required.');
  });

  it('returns error for whitespace-only string', () => {
    expect(validateEmail('   ')).toBe('Email is required.');
  });

  it('returns error when @ is missing', () => {
    expect(validateEmail('userexample.com')).toBe('Please enter a valid email address.');
  });

  it('returns error when TLD is missing', () => {
    expect(validateEmail('user@example')).toBe('Please enter a valid email address.');
  });

  it('trims leading/trailing whitespace before validating', () => {
    expect(validateEmail('  user@example.com  ')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('returns null for a valid password', () => {
    expect(validatePassword('securepass')).toBeNull();
  });

  it('returns error for empty string', () => {
    expect(validatePassword('')).toBe('Password is required.');
  });

  it('returns error for password shorter than 8 chars', () => {
    expect(validatePassword('abc123')).toBe('Password must be at least 8 characters.');
  });

  it('returns null for exactly 8 chars', () => {
    expect(validatePassword('abcdefgh')).toBeNull();
  });
});

describe('validateCustomerName', () => {
  it('returns null for a valid name', () => {
    expect(validateCustomerName('Acme Corp')).toBeNull();
  });

  it('returns error for empty string', () => {
    expect(validateCustomerName('')).toBe('Customer name is required.');
  });

  it('returns error for whitespace-only string', () => {
    expect(validateCustomerName('   ')).toBe('Customer name is required.');
  });
});

describe('parseMoney', () => {
  it('returns value for valid positive number', () => {
    expect(parseMoney('150.00')).toEqual({ value: 150, error: null });
  });

  it('returns value for integer string', () => {
    expect(parseMoney('200')).toEqual({ value: 200, error: null });
  });

  it('returns error for empty string', () => {
    expect(parseMoney('')).toEqual({ value: null, error: 'Amount is required.' });
  });

  it('returns error for zero', () => {
    expect(parseMoney('0')).toEqual({ value: null, error: 'Amount must be a number greater than 0.' });
  });

  it('returns error for negative number', () => {
    expect(parseMoney('-10')).toEqual({ value: null, error: 'Amount must be a number greater than 0.' });
  });

  it('returns error for non-numeric string', () => {
    expect(parseMoney('abc')).toEqual({ value: null, error: 'Amount must be a number greater than 0.' });
  });
});
