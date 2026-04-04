export function formatDays(days: number | null): string {
  if (days === null) return 'N/A';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days % 7 === 0 && days <= 84) return `${days / 7} weeks`;
  return `${days} days`;
}

export function formatDaysShort(days: number | null): string {
  if (days === null) return '—';
  return `${days}d`;
}

export function getSpeedClass(days: number | null): string {
  if (days === null) return 'speed-unknown';
  if (days <= 30) return 'speed-fast';
  if (days <= 90) return 'speed-medium';
  return 'speed-slow';
}

export function getSpeedLabel(days: number | null): string {
  if (days === null) return 'No data';
  if (days <= 14) return 'Very fast';
  if (days <= 30) return 'Fast';
  if (days <= 60) return 'Moderate';
  if (days <= 90) return 'Slow';
  return 'Very slow';
}

export const VISA_TYPES = {
  visitor: { key: 'visitor', label: 'Visitor Visa', short: 'Visitor' },
  supervisa: { key: 'supervisa', label: 'Super Visa', short: 'Super Visa' },
  study: { key: 'study', label: 'Study Permit', short: 'Study' },
  work: { key: 'work', label: 'Work Permit', short: 'Work' },
} as const;

export type VisaType = keyof typeof VISA_TYPES;

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function currentMonthYear(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
