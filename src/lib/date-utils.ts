import { isValid } from 'date-fns';

type FirestoreTimestamp = { seconds: number; nanoseconds?: number };

export function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;

  if (value instanceof Date) {
    return isValid(value) ? value : undefined;
  }

  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const ts = value as FirestoreTimestamp;
    const d = new Date(ts.seconds * 1000);
    return isValid(d) ? d : undefined;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isValid(d) ? d : undefined;
  }

  return undefined;
}

export function safeFormat(
  value: unknown,
  formatFn: (date: Date, format: string) => string,
  formatStr: string,
  fallback = ''
): string {
  const date = toDate(value);
  if (!date) return fallback;
  try {
    return formatFn(date, formatStr);
  } catch {
    return fallback;
  }
}
