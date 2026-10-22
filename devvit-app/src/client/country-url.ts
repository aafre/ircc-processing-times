// Mirrors toSlug() in website/src/utils/countries.ts — keep the two in sync.
export function countryPageUrl(name: string): string {
  const slug = name
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .trim()
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `https://canadavisatracker.com/processing-times/${slug}/`;
}
