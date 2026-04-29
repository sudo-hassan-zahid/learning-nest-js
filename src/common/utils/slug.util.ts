import { randomBytes } from 'crypto';

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function uniqueSlug(title: string): string {
  const base = toSlug(title);
  const suffix = randomBytes(3).toString('hex');
  return `${base}-${suffix}`;
}

export function shortCode(): string {
  return randomBytes(6).toString('base64url');
}
