import { Devvit, useState, useAsync } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true,
  http: {
    domains: ['raw.githubusercontent.com', 'flagcdn.com'],
  },
});

// ─── Constants ────────────────────────────────────────────────────────────────

const DATA_URL =
  'https://raw.githubusercontent.com/aafre/ircc-processing-times/main/scraper/data/latest.json';

const REDIS_KEY_DATA = 'processing_times:latest';
const REDIS_KEY_META = 'processing_times:meta';

const PRIORITY_COUNTRIES = ['IN', 'NG', 'PH', 'PK', 'CN', 'BR', 'BD', 'MX', 'IR', 'CO'];

const VISA_LABELS: Record<string, string> = {
  'visitor-outside-canada': 'Visitor',
  'supervisa': 'Super Visa',
  'study': 'Study',
  'work': 'Work',
};

const VISA_KEYS = Object.keys(VISA_LABELS);

const PAGE_SIZE = 8;

// ─── Timeline Submission Form ─────────────────────────────────────────────────

const timelineForm = Devvit.createForm(
  {
    title: 'Submit Your Visa Timeline',
    description: 'Share your processing experience to help the community.',
    acceptLabel: 'Submit',
    fields: [
      {
        type: 'select',
        name: 'visaType',
        label: 'Visa Type',
        required: true,
        options: [
          { label: 'Visitor Visa', value: 'visitor' },
          { label: 'Super Visa', value: 'supervisa' },
          { label: 'Study Permit', value: 'study' },
          { label: 'Work Permit', value: 'work' },
          { label: 'Transit Visa', value: 'transit' },
        ],
      },
      {
        type: 'string',
        name: 'country',
        label: 'Country of Application',
        required: true,
        helpText: 'e.g. India, Nigeria, Philippines',
      },
      {
        type: 'string',
        name: 'applicationDate',
        label: 'Application Date',
        required: true,
        helpText: 'Format: YYYY-MM-DD',
      },
      {
        type: 'string',
        name: 'biometricsDate',
        label: 'Biometrics Date (if applicable)',
        helpText: 'Format: YYYY-MM-DD',
      },
      {
        type: 'string',
        name: 'decisionDate',
        label: 'Decision Date',
        helpText: 'Format: YYYY-MM-DD (leave empty if pending)',
      },
      {
        type: 'select',
        name: 'outcome',
        label: 'Outcome',
        required: true,
        options: [
          { label: 'Approved', value: 'approved' },
          { label: 'Refused', value: 'refused' },
          { label: 'Pending', value: 'pending' },
        ],
      },
      {
        type: 'boolean',
        name: 'additionalDocs',
        label: 'Additional documents requested?',
      },
      {
        type: 'boolean',
        name: 'medicalRequested',
        label: 'Medical exam requested?',
      },
      {
        type: 'paragraph',
        name: 'notes',
        label: 'Notes (optional)',
        helpText: 'Any details about your experience',
      },
    ],
  },
  async (event, context) => {
    const { values } = event;
    const user = await context.reddit.getCurrentUser();
    const username = user?.username ?? 'anonymous';

    // Calculate total days if we have both dates
    let totalDays: number | null = null;
    const appDate = values.applicationDate as string;
    const decDate = values.decisionDate as string;
    if (appDate && decDate) {
      const applied = new Date(appDate);
      const decided = new Date(decDate);
      if (!isNaN(applied.getTime()) && !isNaN(decided.getTime())) {
        totalDays = Math.round(
          (decided.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    }

    const timeline = {
      username,
      visaType: (values.visaType as string[])[0],
      country: values.country as string,
      applicationDate: appDate,
      biometricsDate: (values.biometricsDate as string) || null,
      decisionDate: decDate || null,
      outcome: (values.outcome as string[])[0],
      totalDays,
      additionalDocs: values.additionalDocs ?? false,
      medicalRequested: values.medicalRequested ?? false,
      notes: (values.notes as string) || null,
      submittedAt: new Date().toISOString(),
    };

    // Store as a sorted set member (score = timestamp for ordering)
    const countryKey = timeline.country.toLowerCase().replace(/\s+/g, '_');
    await context.redis.zAdd(`timelines:${countryKey}`, {
      member: JSON.stringify(timeline),
      score: Date.now(),
    });

    // Increment global counter
    await context.redis.incrBy('timeline_count:all', 1);

    context.ui.showToast({
      text: totalDays
        ? `Timeline submitted! ${totalDays} days recorded. Thank you!`
        : 'Timeline submitted! Thank you for contributing.',
      appearance: 'success',
    });
  }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FLAG_URL = 'https://flagcdn.com/w40';

const getSpeedColor = (days: number | null | undefined): string => {
  if (typeof days !== 'number') return '#787C7E';
  if (days <= 14) return '#46D160';
  if (days <= 30) return '#0079D3';
  if (days <= 60) return '#FF8C00';
  return '#FF4500';
};

// ─── Custom Post Type: Dashboard ──────────────────────────────────────────────

Devvit.addCustomPostType({
  name: 'Processing Times Tracker',
  description: 'Live IRCC visa processing times dashboard for r/CanadaVisitorVisa',
  height: 'tall',
  render: (context) => {
    const [visaFilter, setVisaFilter] = useState('visitor-outside-canada');
    const [page, setPage] = useState(0);

    const { data: rawData, loading } = useAsync(async () => {
      const raw = await context.redis.get(REDIS_KEY_DATA);
      if (!raw) return null;
      return raw;
    });

    if (loading) {
      return (
        <vstack height="100%" alignment="middle center">
          <text size="medium" weight="bold">Loading...</text>
        </vstack>
      );
    }

    if (!rawData) {
      return (
        <vstack height="100%" alignment="middle center" padding="large" gap="medium">
          <text size="large" weight="bold">No data yet</text>
          <text size="small" color="#787C7E">Use ··· menu → Load Sample Processing Times</text>
        </vstack>
      );
    }

    const data = JSON.parse(rawData as string) as {
      ircc_last_updated: string;
      processing_times: Record<string, { name: string; raw: Record<string, string>; [k: string]: unknown }>;
    };

    const entries = Object.entries(data.processing_times)
      .filter(([_, c]) => typeof c[visaFilter] === 'number')
      .sort((a, b) => (a[1].name || a[0]).localeCompare(b[1].name || b[0]));

    const perPage = 7;
    const totalPages = Math.max(1, Math.ceil(entries.length / perPage));
    const pg = Math.min(page, totalPages - 1);
    const rows = entries.slice(pg * perPage, (pg + 1) * perPage);

    return (
      <vstack height="100%">
        {/* Header */}
        <hstack padding="medium" alignment="middle">
          <text weight="bold" size="large">🇨🇦 Processing Times</text>
          <spacer />
          <hstack backgroundColor="#1A7F37" cornerRadius="full" padding="small" gap="small" alignment="middle">
            <text size="xsmall" weight="bold" color="#46D160">●</text>
            <text size="xsmall" weight="bold" color="#FFFFFF">LIVE</text>
          </hstack>
        </hstack>

        {/* Filters */}
        <hstack padding="small" gap="small" alignment="middle">
          {VISA_KEYS.map((key) => (
            <button key={key} size="small" appearance={visaFilter === key ? 'primary' : 'bordered'}
              onPress={() => { setVisaFilter(key); setPage(0); }}>
              {VISA_LABELS[key]}
            </button>
          ))}
          <spacer />
          <button size="small" appearance="bordered" icon="calendar" onPress={() => context.ui.showForm(timelineForm)}>
            Share
          </button>
        </hstack>

        {/* Rows */}
        <vstack grow padding="small" gap="small">
          {rows.map(([code, country], idx) => {
            const days = country[visaFilter] as number;
            return (
              <hstack key={code} padding="small" gap="medium" backgroundColor="secondary-background" cornerRadius="medium" alignment="middle">
                <text size="small" color="#787C7E">{pg * perPage + idx + 1}</text>
                <text size="medium" weight="bold" grow>{country.name || code}</text>
                <text size="large" weight="bold" color={getSpeedColor(days)}>{days}</text>
                <text size="xsmall" color="#787C7E">days</text>
              </hstack>
            );
          })}
        </vstack>

        {/* Footer with pagination */}
        <hstack padding="medium" alignment="middle" gap="medium">
          <button size="small" appearance="bordered" disabled={pg === 0} onPress={() => setPage(pg - 1)}>
            ← Prev
          </button>
          <text size="small" weight="bold" color="#787C7E">
            Page {pg + 1} of {totalPages}
          </text>
          <button size="small" appearance="bordered" disabled={pg >= totalPages - 1} onPress={() => setPage(pg + 1)}>
            Next →
          </button>
          <spacer />
          <text size="xsmall" color="#787C7E">{entries.length} countries</text>
        </hstack>
      </vstack>
    );
  },
});

// ─── Scheduled Job: Fetch latest data ─────────────────────────────────────────

Devvit.addSchedulerJob({
  name: 'fetch_processing_times',
  onRun: async (_event, context) => {
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) {
        console.error(`Failed to fetch processing times: ${response.status}`);
        return;
      }
      const text = await response.text();

      // Store previous for change detection
      const previous = await context.redis.get(REDIS_KEY_DATA);
      if (previous) {
        await context.redis.set('processing_times:previous', previous);
      }

      await context.redis.set(REDIS_KEY_DATA, text);
      await context.redis.set(
        REDIS_KEY_META,
        JSON.stringify({ lastFetched: new Date().toISOString() })
      );

      console.log('Processing times data updated successfully');
    } catch (e) {
      console.error('Error fetching processing times:', e);
    }
  },
});

// ─── App Install Trigger: Schedule daily fetch ────────────────────────────────

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_event, context) => {
    // Schedule daily fetch at 3 PM UTC (after scraper runs at 2 PM UTC)
    await context.scheduler.runJob({
      name: 'fetch_processing_times',
      cron: '0 15 * * *',
    });
    console.log('Scheduled daily processing times fetch');

    // Run immediately on install to populate data
    await context.scheduler.runJob({
      name: 'fetch_processing_times',
      runAt: new Date(),
    });
    console.log('Triggered immediate data fetch');
  },
});

// ─── Menu Item: Create Dashboard Post ─────────────────────────────────────────

Devvit.addMenuItem({
  label: 'Create Processing Times Dashboard',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const subredditName = (await context.reddit.getCurrentSubreddit().catch(() => null))?.name
      ?? context.subredditName!;
    const post = await context.reddit.submitPost({
      title: 'IRCC Processing Times — Live Tracker',
      subredditName,
      preview: (
        <vstack height="100%" alignment="middle center" padding="large">
          <text size="large" weight="bold">
            Loading Processing Times Tracker...
          </text>
        </vstack>
      ),
    });
    context.ui.showToast({ text: 'Dashboard post created!', appearance: 'success' });
    context.ui.navigateTo(post);
  },
});

// ─── Menu Item: Force Data Refresh ────────────────────────────────────────────

Devvit.addMenuItem({
  label: 'Refresh Processing Times Data',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) {
        context.ui.showToast({ text: `Fetch failed: HTTP ${response.status}. Request domain approval at developers.reddit.com`, appearance: 'neutral' });
        return;
      }
      const text = await response.text();
      await context.redis.set(REDIS_KEY_DATA, text);
      await context.redis.set(
        REDIS_KEY_META,
        JSON.stringify({ lastFetched: new Date().toISOString() })
      );

      const parsed = JSON.parse(text);
      const count = Object.keys(parsed.processing_times || {}).length;
      context.ui.showToast({
        text: `Data refreshed! ${count} countries loaded.`,
        appearance: 'success',
      });
    } catch (e) {
      context.ui.showToast({ text: `Error: ${e}`, appearance: 'neutral' });
    }
  },
});

// ─── Menu Item: Seed Data from Wiki ───────────────────────────────────────────
// Workaround: reads processing times JSON from the subreddit wiki page
// "processing_times_data". Paste latest.json content into that wiki page.

Devvit.addMenuItem({
  label: 'Seed Data from Wiki Page',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    try {
      const subredditName = context.subredditName!;
      const wiki = await context.reddit.getWikiPage(subredditName, 'processing_times_data');
      const text = wiki.content.trim();

      if (!text || !text.startsWith('{')) {
        context.ui.showToast({
          text: 'Wiki page "processing_times_data" is empty or not valid JSON. Paste latest.json there first.',
          appearance: 'neutral',
        });
        return;
      }

      const parsed = JSON.parse(text);
      const count = Object.keys(parsed.processing_times || {}).length;

      await context.redis.set(REDIS_KEY_DATA, text);
      await context.redis.set(
        REDIS_KEY_META,
        JSON.stringify({ lastFetched: new Date().toISOString() })
      );

      context.ui.showToast({
        text: `Data seeded from wiki! ${count} countries loaded. Refresh the page.`,
        appearance: 'success',
      });
    } catch (e) {
      context.ui.showToast({ text: `Error: ${e}`, appearance: 'neutral' });
    }
  },
});

// ─── Menu Item: Seed Sample Data (for testing) ───────────────────────────────

Devvit.addMenuItem({
  label: 'Load Full IRCC Data (212 countries)',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    try {
      // Try fetching live data first
      const response = await fetch(DATA_URL);
      if (response.ok) {
        const text = await response.text();
        const parsed = JSON.parse(text);
        const count = Object.keys(parsed.processing_times || {}).length;
        await context.redis.set(REDIS_KEY_DATA, text);
        await context.redis.set(REDIS_KEY_META, JSON.stringify({ lastFetched: new Date().toISOString() }));
        context.ui.showToast({ text: `Live data loaded! ${count} countries. Refresh the page.`, appearance: 'success' });
        return;
      }
    } catch (_e) {
      // fetch blocked — fall through to sample data
    }

    // Fallback: hardcoded sample
    const sampleData = {
      last_updated: new Date().toISOString(),
      ircc_last_updated: 'March 31, 2026',
      processing_times: {
        IN: { name: 'India', 'visitor-outside-canada': 28, supervisa: 191, study: 21, work: 49, raw: { 'visitor-outside-canada': '28 days', supervisa: '191 days', study: '3 weeks', work: '7 weeks' } },
        NG: { name: 'Nigeria', 'visitor-outside-canada': 30, supervisa: 75, study: 56, work: 42, raw: { 'visitor-outside-canada': '30 days', supervisa: '75 days', study: '8 weeks', work: '6 weeks' } },
        PH: { name: 'Philippines', 'visitor-outside-canada': 38, supervisa: 80, study: 35, work: 56, raw: { 'visitor-outside-canada': '38 days', supervisa: '80 days', study: '5 weeks', work: '8 weeks' } },
        PK: { name: 'Pakistan', 'visitor-outside-canada': 42, supervisa: 95, study: 49, work: 63, raw: { 'visitor-outside-canada': '42 days', supervisa: '95 days', study: '7 weeks', work: '9 weeks' } },
        CN: { name: 'China', 'visitor-outside-canada': 24, supervisa: 90, study: 28, work: 49, raw: { 'visitor-outside-canada': '24 days', supervisa: '90 days', study: '4 weeks', work: '7 weeks' } },
        BR: { name: 'Brazil', 'visitor-outside-canada': 24, supervisa: null, study: 42, work: 35, raw: { 'visitor-outside-canada': '24 days', supervisa: 'N/A', study: '6 weeks', work: '5 weeks' } },
        BD: { name: 'Bangladesh', 'visitor-outside-canada': 45, supervisa: 85, study: 7, work: null, raw: { 'visitor-outside-canada': '45 days', supervisa: '85 days', study: '1 week', work: 'N/A' } },
        MX: { name: 'Mexico', 'visitor-outside-canada': 22, supervisa: null, study: 14, work: 28, raw: { 'visitor-outside-canada': '22 days', supervisa: 'N/A', study: '2 weeks', work: '4 weeks' } },
        IR: { name: 'Iran', 'visitor-outside-canada': 60, supervisa: null, study: 42, work: 63, raw: { 'visitor-outside-canada': '60 days', supervisa: 'N/A', study: '6 weeks', work: '9 weeks' } },
        CO: { name: 'Colombia', 'visitor-outside-canada': 22, supervisa: null, study: 21, work: 35, raw: { 'visitor-outside-canada': '22 days', supervisa: 'N/A', study: '3 weeks', work: '5 weeks' } },
        US: { name: 'United States', 'visitor-outside-canada': 16, supervisa: null, study: 14, work: 21, raw: { 'visitor-outside-canada': '16 days', supervisa: 'N/A', study: '2 weeks', work: '3 weeks' } },
        GB: { name: 'United Kingdom', 'visitor-outside-canada': 12, supervisa: null, study: 21, work: 28, raw: { 'visitor-outside-canada': '12 days', supervisa: 'N/A', study: '3 weeks', work: '4 weeks' } },
        AU: { name: 'Australia', 'visitor-outside-canada': 8, supervisa: null, study: 7, work: 14, raw: { 'visitor-outside-canada': '8 days', supervisa: 'N/A', study: '1 week', work: '2 weeks' } },
      },
    };

    await context.redis.set(REDIS_KEY_DATA, JSON.stringify(sampleData));
    await context.redis.set(REDIS_KEY_META, JSON.stringify({ lastFetched: new Date().toISOString() }));

    context.ui.showToast({
      text: 'Domain not yet approved. Loaded 13 sample countries. Request raw.githubusercontent.com at developers.reddit.com/apps/processing-time',
      appearance: 'neutral',
    });
  },
});

export default Devvit;
