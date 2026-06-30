export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic phone validation - at least 10 digits
  const phoneRegex = /[\d]{10,}/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
}

export function validateCoordinate(
  value: number,
  min: number,
  max: number,
): boolean {
  return !isNaN(value) && value >= min && value <= max;
}

export function validateRequired(value: string | number | any[]): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
}

export function validateUrl(url: string): boolean {
  if (!url) return true; // URL is optional
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getFieldError(
  errors: Record<string, string>,
  field: string,
): string | undefined {
  return errors[field];
}

export function hasError(
  errors: Record<string, string>,
  field: string,
): boolean {
  return !!errors[field];
}
