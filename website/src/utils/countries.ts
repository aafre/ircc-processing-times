const BASE_URL = 'https://raw.githubusercontent.com/aafre/ircc-processing-times/main/scraper/data';

export interface CountryData {
  code: string;
  name: string;
  slug: string;
  visitor: number | null;
  supervisa: number | null;
  study: number | null;
  work: number | null;
  raw: Record<string, string>;
}

export interface HistoryEntry {
  date: string;
  visitor: number | null;
  supervisa: number | null;
  study: number | null;
  work: number | null;
}

export interface SiteData {
  lastUpdated: string;
  irccLastUpdated: string;
  countries: CountryData[];
}

function decodeEntities(str: string): string {
  return str
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&mdash;/g, '\u2014')
    .trim();
}

export function toSlug(name: string): string {
  return decodeEntities(name)
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

let _cache: SiteData | null = null;

export async function getSiteData(): Promise<SiteData> {
  if (_cache) return _cache;

  const [latestRes, countriesRes] = await Promise.all([
    fetch(`${BASE_URL}/latest.json`),
    fetch(`${BASE_URL}/countries.json`),
  ]);

  const latest = await latestRes.json();
  const countryNames: Record<string, string> = await countriesRes.json();

  const countries: CountryData[] = [];

  for (const [code, data] of Object.entries(latest.processing_times) as [string, any][]) {
    const name = decodeEntities(data.name || countryNames[code] || code);
    countries.push({
      code,
      name,
      slug: toSlug(name),
      visitor: data['visitor-outside-canada'] ?? null,
      supervisa: data.supervisa ?? null,
      study: data.study ?? null,
      work: data.work ?? null,
      raw: data.raw || {},
    });
  }

  countries.sort((a, b) => a.name.localeCompare(b.name));

  _cache = {
    lastUpdated: latest.last_updated,
    irccLastUpdated: latest.ircc_last_updated,
    countries,
  };

  return _cache;
}

export async function getCountryHistory(code: string): Promise<HistoryEntry[]> {
  try {
    const res = await fetch(`${BASE_URL}/history/${code}.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((entry: any) => ({
      date: entry.date,
      visitor: entry.visitor ?? null,
      supervisa: entry.supervisa ?? null,
      study: entry.study ?? null,
      work: entry.work ?? null,
    }));
  } catch {
    return [];
  }
}

// Top countries by search volume for homepage
export const TOP_COUNTRY_CODES = [
  'IN', 'CN', 'PH', 'NG', 'PK', 'BD', 'MX', 'BR', 'IR', 'US',
  'GB', 'TR', 'CO', 'KE', 'GH', 'AE', 'SA', 'EG', 'VN', 'LK',
];

// Region groupings for internal linking
export const REGIONS: Record<string, string[]> = {
  'South Asia': ['IN', 'PK', 'BD', 'LK', 'NP', 'BT', 'MV'],
  'Southeast Asia': ['PH', 'VN', 'TH', 'MY', 'ID', 'KH', 'MM', 'SG'],
  'East Asia': ['CN', 'JP', 'KR', 'HK', 'TW', 'MN'],
  'Middle East': ['AE', 'SA', 'IR', 'IQ', 'JO', 'LB', 'KW', 'QA', 'OM', 'BH', 'YE', 'SY'],
  'Africa': ['NG', 'KE', 'GH', 'EG', 'ZA', 'ET', 'CM', 'TZ', 'UG', 'SN'],
  'Americas': ['MX', 'BR', 'CO', 'US', 'AR', 'PE', 'CL', 'VE', 'EC', 'JM'],
  'Europe': ['GB', 'TR', 'FR', 'DE', 'IT', 'ES', 'PL', 'RO', 'UA', 'RU'],
};

export function getRegionForCountry(code: string): { region: string; peers: string[] } | null {
  for (const [region, codes] of Object.entries(REGIONS)) {
    if (codes.includes(code)) {
      return { region, peers: codes.filter(c => c !== code) };
    }
  }
  return null;
}
