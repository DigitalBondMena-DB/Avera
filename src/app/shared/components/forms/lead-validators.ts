import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Syntax only: never rejects legitimate company domains (mirrors the API's email:rfc rule). */
export const EMAIL_PATTERN = /^[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[^\s@<>()[\],;:"]{2,}$/;
export const PHONE_PATTERN = /^[0-9+()\-\s.]{6,40}$/;

export const minSelected = (n: number): ValidatorFn => (c: AbstractControl): ValidationErrors | null =>
  Array.isArray(c.value) && c.value.length >= n ? null : { services: true };

const FREE = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'aol.com', 'proton.me', 'protonmail.com', 'gmx.com', 'mail.com'];
export const isFreeEmail = (email: string): boolean => FREE.includes(email.split('@')[1]?.toLowerCase().trim() ?? '');

/** Maps a control's errors to a localized message. */
export function errorText(errors: ValidationErrors | null, msgs: { required: string; email: string; services: string; tooLong: string }): string | null {
  if (!errors) return null;
  if (errors['server']) return String(errors['server']);
  if (errors['required']) return msgs.required;
  if (errors['services']) return msgs.services;
  if (errors['pattern'] || errors['email']) return msgs.email;
  if (errors['maxlength']) return msgs.tooLong;
  return msgs.required;
}
