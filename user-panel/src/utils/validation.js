/**
 * Small, dependency-free validators. Each rule returns an error string or ''.
 * `validate(values, schema)` returns an object of field → first error.
 */
export const rules = {
  required: (label = 'This field') => (v) =>
    v === undefined || v === null || String(v).trim() === '' || (Array.isArray(v) && v.length === 0)
      ? `${label} is required.`
      : '',
  email: () => (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) ? '' : 'Enter a valid email address.'),
  ukPhone: () => (v) => {
    if (!v) return '';
    const digits = String(v).replace(/[\s()-]/g, '');
    return /^(\+44|0)\d{9,10}$/.test(digits) ? '' : 'Enter a valid UK phone number.';
  },
  minLength: (n, label = 'This field') => (v) => (!v || String(v).length >= n ? '' : `${label} must be at least ${n} characters.`),
  maxLength: (n, label = 'This field') => (v) => (!v || String(v).length <= n ? '' : `${label} must be ${n} characters or fewer.`),
  strongPassword: () => (v) => {
    if (!v) return '';
    if (v.length < 8) return 'Use at least 8 characters.';
    if (!/[A-Z]/.test(v) || !/[a-z]/.test(v) || !/\d/.test(v)) return 'Include upper and lower case letters and a number.';
    return '';
  },
  matches: (field, message = 'Values do not match.') => (v, all) => (v === all[field] ? '' : message),
  checked: (message) => (v) => (v ? '' : message),
  minItems: (n, message) => (v) => (Array.isArray(v) && v.length >= n ? '' : message),
  dateNotPast: () => (v) => {
    if (!v) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(`${v}T00:00:00`) >= today ? '' : 'Choose a date from today onwards.';
  },
  dateAfter: (field, message = 'End date must be on or after the start date.') => (v, all) =>
    !v || !all[field] || new Date(v) >= new Date(all[field]) ? '' : message,
  timeAfter: (field, message = 'End time must be after the start time.') => (v, all) =>
    !v || !all[field] || v > all[field] ? '' : message,
};

export function validate(values, schema) {
  const errors = {};
  for (const [field, fieldRules] of Object.entries(schema)) {
    for (const rule of fieldRules) {
      const msg = rule(values[field], values);
      if (msg) {
        errors[field] = msg;
        break;
      }
    }
  }
  return errors;
}

export const hasErrors = (errors) => Object.values(errors).some(Boolean);

/** 0–4 password strength score for the strength meter. */
export function passwordStrength(pw = '') {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
  return s;
}
