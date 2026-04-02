export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'Email is required.';
  // Basic email shape validation (pragmatic; avoids overly complex RFC regex).
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  if (!ok) return 'Please enter a valid email address.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  return null;
}

export function validateCustomerName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Customer name is required.';
  return null;
}

export function parseMoney(amountStr: string): { value: number | null; error: string | null } {
  const raw = amountStr.trim();
  if (!raw) return { value: null, error: 'Amount is required.' };
  const num = Number.parseFloat(raw);
  if (!Number.isFinite(num) || num <= 0) {
    return { value: null, error: 'Amount must be a number greater than 0.' };
  }
  return { value: num, error: null };
}

