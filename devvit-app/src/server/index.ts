import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createServer, getServerPort, redis, reddit, context } from '@devvit/web/server';
import type { UiResponse, TriggerResponse } from '@devvit/web/shared';

const DATA_URL =
  'https://raw.githubusercontent.com/aafre/ircc-processing-times/main/scraper/data/latest.json';

const REDIS_KEY_DATA = 'processing_times:latest';
const REDIS_KEY_META = 'processing_times:meta';

// ─── Shared: fetch processing times from GitHub and store in Redis ───

async function fetchProcessingTimes(): Promise<{ count: number }> {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch: HTTP ${response.status}`);
  }
  const text = await response.text();

  // Store previous for change detection
  const previous = await redis.get(REDIS_KEY_DATA);
  if (previous) {
    await redis.set('processing_times:previous', previous);
  }

  await redis.set(REDIS_KEY_DATA, text);
  await redis.set(REDIS_KEY_META, JSON.stringify({ lastFetched: new Date().toISOString() }));

  const parsed = JSON.parse(text);
  const count = Object.keys(parsed.processing_times || {}).length;
  console.log(`Processing times updated: ${count} countries`);
  return { count };
}

// Fallback sample data when GitHub domain isn't approved yet
const SAMPLE_DATA = {
  last_updated: new Date().toISOString(),
  ircc_last_updated: 'April 7, 2026',
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

// ─── App ───

const app = new Hono();

// ─── Public API (webview calls these) ───

app.get('/api/data', async (c) => {
  try {
    const raw = await redis.get(REDIS_KEY_DATA);
    if (!raw) {
      return c.json({ error: 'No data available' }, 404);
    }
    const [meta, prev] = await Promise.all([
      redis.get(REDIS_KEY_META),
      redis.get('processing_times:previous'),
    ]);
    return c.json({
      ...JSON.parse(raw),
      _meta: meta ? JSON.parse(meta) : null,
      _previous: prev ? JSON.parse(prev).processing_times : null,
    });
  } catch (err) {
    console.error('GET /api/data error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/meta', async (c) => {
  try {
    const meta = await redis.get(REDIS_KEY_META);
    return c.json(meta ? JSON.parse(meta) : { lastFetched: null });
  } catch (err) {
    console.error('GET /api/meta error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ─── Internal: Triggers ───

app.post('/internal/triggers/on-app-install', async (c) => {
  try {
    const result = await fetchProcessingTimes();
    return c.json<TriggerResponse>({
      status: 'success',
      message: `Data loaded: ${result.count} countries`,
    });
  } catch (err) {
    console.error('AppInstall trigger error:', err);
    // Fallback: seed sample data so the app isn't empty
    await redis.set(REDIS_KEY_DATA, JSON.stringify(SAMPLE_DATA));
    await redis.set(REDIS_KEY_META, JSON.stringify({ lastFetched: new Date().toISOString() }));
    return c.json<TriggerResponse>({
      status: 'success',
      message: 'Loaded 13 sample countries (GitHub domain pending approval)',
    });
  }
});

// ─── Internal: Cron (Scheduler) ───

app.post('/internal/cron/fetch-data', async (c) => {
  try {
    const result = await fetchProcessingTimes();
    return c.json({ status: 'success', count: result.count });
  } catch (err) {
    console.error('Cron fetch error:', err);
    return c.json({ status: 'error', message: String(err) }, 400);
  }
});

// ─── Internal: Menu Items ───

app.post('/internal/menu/create-dashboard', async (c) => {
  try {
    const post = await reddit.submitCustomPost({
      title: 'IRCC Visa Processing Times — Live Tracker',
    });
    return c.json<UiResponse>({
      showToast: 'Dashboard post created!',
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (err) {
    console.error('Create dashboard error:', err);
    return c.json<UiResponse>({ showToast: `Failed to create post: ${err}` }, 400);
  }
});

app.post('/internal/menu/refresh-data', async (c) => {
  try {
    const result = await fetchProcessingTimes();
    return c.json<UiResponse>({
      showToast: `Data refreshed! ${result.count} countries loaded.`,
    });
  } catch (err) {
    console.error('Refresh error:', err);
    return c.json<UiResponse>({
      showToast: `Fetch failed. Request domain approval at developers.reddit.com`,
    }, 400);
  }
});

app.post('/internal/menu/seed-wiki', async (c) => {
  try {
    const wiki = await reddit.getWikiPage(context.subredditName!, 'processing_times_data');
    const text = wiki.content.trim();

    if (!text || !text.startsWith('{')) {
      return c.json<UiResponse>({
        showToast: 'Wiki page "processing_times_data" is empty or not valid JSON.',
      }, 400);
    }

    const parsed = JSON.parse(text);
    const count = Object.keys(parsed.processing_times || {}).length;

    await redis.set(REDIS_KEY_DATA, text);
    await redis.set(REDIS_KEY_META, JSON.stringify({ lastFetched: new Date().toISOString() }));

    return c.json<UiResponse>({
      showToast: `Data seeded from wiki! ${count} countries loaded. Refresh the page.`,
    });
  } catch (err) {
    console.error('Seed wiki error:', err);
    return c.json<UiResponse>({ showToast: `Error: ${err}` }, 400);
  }
});

app.post('/internal/menu/load-data', async (c) => {
  try {
    const result = await fetchProcessingTimes();
    return c.json<UiResponse>({
      showToast: `Live data loaded! ${result.count} countries. Refresh the page.`,
    });
  } catch (_err) {
    // Domain not approved — load sample data
    await redis.set(REDIS_KEY_DATA, JSON.stringify(SAMPLE_DATA));
    await redis.set(REDIS_KEY_META, JSON.stringify({ lastFetched: new Date().toISOString() }));
    return c.json<UiResponse>({
      showToast: 'Domain not yet approved. Loaded 13 sample countries.',
    });
  }
});

// ─── Start server ───

serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});
