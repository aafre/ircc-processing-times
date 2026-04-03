import { Devvit, useState, useAsync } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true,
  http: true,
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

// ─── Custom Post Type: Dashboard ──────────────────────────────────────────────

Devvit.addCustomPostType({
  name: 'Processing Times Tracker',
  description: 'Live IRCC visa processing times dashboard for r/CanadaVisitorVisa',
  height: 'tall',
  render: (context) => {
    const [visaFilter, setVisaFilter] = useState('visitor-outside-canada');
    const [page, setPage] = useState(0);
    const [view, setView] = useState<string>('priority');

    // Fetch data from Redis
    const { data: rawData, loading } = useAsync(async () => {
      const raw = await context.redis.get(REDIS_KEY_DATA);
      if (!raw) return null;
      return raw;
    });

    const { data: rawCount } = useAsync(async () => {
      const count = await context.redis.get('timeline_count:all');
      return count ?? '0';
    });

    const timelineCount = parseInt((rawCount as string) || '0', 10);

    // ── Loading state ──
    if (loading) {
      return (
        <vstack height="100%" alignment="middle center" padding="large">
          <text size="large" weight="bold">
            Loading processing times...
          </text>
        </vstack>
      );
    }

    // ── No data state ──
    if (!rawData) {
      return (
        <vstack height="100%" alignment="middle center" padding="large" gap="medium">
          <text size="large" weight="bold">
            No data available yet
          </text>
          <text size="medium" color="neutral-content-weak">
            Processing times will appear after the first data sync.
          </text>
          <text size="small" color="neutral-content-weak">
            Moderators: data fetches automatically once daily.
          </text>
        </vstack>
      );
    }

    // Parse the stored JSON
    const data = JSON.parse(rawData as string) as {
      last_updated: string;
      ircc_last_updated: string;
      processing_times: Record<
        string,
        { name: string; raw: Record<string, string>; [k: string]: unknown }
      >;
    };

    // ── Prepare country list ──
    const allEntries = Object.entries(data.processing_times);

    const filtered = allEntries.filter(([_code, c]) => {
      const val = c[visaFilter];
      return val !== null && val !== undefined && typeof val === 'number';
    });

    const sorted = filtered.sort((a, b) => {
      if (view === 'priority') {
        const aIdx = PRIORITY_COUNTRIES.indexOf(a[0]);
        const bIdx = PRIORITY_COUNTRIES.indexOf(b[0]);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
      }
      return (a[1].name || a[0]).localeCompare(b[1].name || b[0]);
    });

    const displayList =
      view === 'priority'
        ? sorted.filter(([code]) => PRIORITY_COUNTRIES.includes(code))
        : sorted;

    const totalPages = Math.max(1, Math.ceil(displayList.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages - 1);
    const pageItems = displayList.slice(
      currentPage * PAGE_SIZE,
      (currentPage + 1) * PAGE_SIZE
    );

    // ── Helpers ──
    const getDaysColor = (days: unknown): string => {
      if (typeof days !== 'number') return 'neutral-content-weak';
      if (days <= 21) return '';
      if (days <= 60) return 'caution-plain';
      return 'danger-plain';
    };

    return (
      <vstack height="100%" padding="medium" gap="small">
        {/* Header */}
        <hstack alignment="middle" gap="small">
          <text size="large" weight="bold">
            IRCC Processing Times
          </text>
          <spacer />
          <text size="xsmall" color="neutral-content-weak">
            {data.ircc_last_updated || ''}
          </text>
        </hstack>

        {/* Visa type filter */}
        <hstack gap="small">
          {VISA_KEYS.map((key) => (
            <button
              key={key}
              size="small"
              appearance={visaFilter === key ? 'primary' : 'bordered'}
              onPress={() => {
                setVisaFilter(key);
                setPage(0);
              }}
            >
              {VISA_LABELS[key]}
            </button>
          ))}
        </hstack>

        {/* View toggle + submit */}
        <hstack gap="small" alignment="middle">
          <button
            size="small"
            appearance={view === 'priority' ? 'primary' : 'bordered'}
            onPress={() => {
              setView('priority');
              setPage(0);
            }}
          >
            Top 10
          </button>
          <button
            size="small"
            appearance={view === 'all' ? 'primary' : 'bordered'}
            onPress={() => {
              setView('all');
              setPage(0);
            }}
          >
            All ({filtered.length})
          </button>
          <spacer />
          <button
            size="small"
            appearance="bordered"
            icon="add"
            onPress={() => context.ui.showForm(timelineForm)}
          >
            My Timeline
          </button>
        </hstack>

        {/* Column headers */}
        <hstack padding="small" gap="medium">
          <text size="xsmall" weight="bold" color="neutral-content-weak" grow>
            COUNTRY
          </text>
          <text
            size="xsmall"
            weight="bold"
            color="neutral-content-weak"
            alignment="end"
          >
            PROCESSING TIME
          </text>
        </hstack>

        {/* Country rows */}
        <vstack gap="small" grow>
          {pageItems.map(([code, country]) => {
            const days = country[visaFilter] as number | null;
            const rawText = country.raw?.[visaFilter] || '—';
            return (
              <hstack
                key={code}
                padding="small"
                gap="medium"
                backgroundColor="neutral-background-hover"
                cornerRadius="small"
                alignment="middle"
              >
                <vstack grow>
                  <text size="medium" weight="bold">
                    {country.name || code}
                  </text>
                </vstack>
                <vstack alignment="end">
                  <text size="xlarge" weight="bold" color={getDaysColor(days)}>
                    {typeof days === 'number' ? `${days}d` : '—'}
                  </text>
                  <text size="xsmall" color="neutral-content-weak">
                    {rawText}
                  </text>
                </vstack>
              </hstack>
            );
          })}
        </vstack>

        {/* Pagination + stats footer */}
        <hstack alignment="middle" gap="small" padding="small">
          {view === 'all' && totalPages > 1 ? (
            <hstack gap="small" alignment="middle">
              <button
                size="small"
                appearance="bordered"
                disabled={currentPage === 0}
                onPress={() => setPage(Math.max(0, currentPage - 1))}
                icon="caret-left"
              />
              <text size="xsmall" color="neutral-content-weak">
                {currentPage + 1} / {totalPages}
              </text>
              <button
                size="small"
                appearance="bordered"
                disabled={currentPage >= totalPages - 1}
                onPress={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
                icon="caret-right"
              />
            </hstack>
          ) : (
            <spacer />
          )}
          <spacer />
          <text size="xsmall" color="neutral-content-weak">
            {timelineCount} community timelines
          </text>
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
    const subreddit = await context.reddit.getCurrentSubreddit();
    const post = await context.reddit.submitPost({
      title: 'IRCC Processing Times — Live Tracker',
      subredditName: subreddit.name,
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

export default Devvit;
