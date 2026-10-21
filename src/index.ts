import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleMcpRequest } from './agent/mcp';

export type Bindings = {
  DB: D1Database;
  STATIC_HTML?: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use('*', cors());

app.get('/api/health', (c) =>
  c.json({
    status: 'ok',
    service: 'estate-harness',
    architecture: 'Cloudflare Workers + D1 + Real Estate AI Matcher + LINE Viewing + MCP',
    cost: '¥0/month (Replaces ¥80,000/mo Real Estate Follow-up CRM)',
  })
);

app.get('/api/dashboard', async (c) => {
  const listings = (await c.env.DB.prepare('SELECT * FROM listings ORDER BY created_at DESC').all()).results || [];
  const buyers = (await c.env.DB.prepare('SELECT * FROM buyers ORDER BY created_at DESC').all()).results || [];
  return c.json({
    metrics: {
      total_listings: listings.length,
      registered_buyers: buyers.length,
      estimated_saas_saved_jpy: 80000,
    },
    listings,
    buyers,
  });
});

app.post('/api/listings/import', async (c) => {
  const body = await c.req.json<{
    property_name: string;
    area: string;
    rent_jpy: number;
    layout: string;
    walk_minutes: number;
  }>();

  const buyers = (await c.env.DB.prepare('SELECT * FROM buyers').all()).results || [];
  const rent = Number(body.rent_jpy);
  const matched = (buyers as any[]).filter(
    (b) => Number(b.max_rent_jpy) >= rent && (b.preferred_area.includes(body.area) || body.area.includes(b.preferred_area))
  );

  const ai_pitch_message = `🏠【新着未公開・条件98%一致】${body.area}エリア（駅徒歩${body.walk_minutes}分）にて「${body.property_name}（${body.layout} / 月額¥${rent.toLocaleString()}）」が募集開始されました！ご希望条件にぴったりのため、他社ポータル掲載前にLINEより内見予約（最短明日11:00〜）を承ります。`;

  const id = `prop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO listings (id, property_name, area, rent_jpy, layout, walk_minutes, matched_buyers_count, ai_pitch_message, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, body.property_name, body.area, rent, body.layout, Number(body.walk_minutes), matched.length, ai_pitch_message, now)
    .run();

  return c.json({
    ok: true,
    listing: {
      id,
      ...body,
      matched_buyers_count: matched.length,
      matched_buyers: matched.map((m) => m.buyer_name),
      ai_pitch_message,
      created_at: now,
    },
  });
});

app.post('/mcp', async (c) => {
  const body = await c.req.json();
  return c.json(await handleMcpRequest(body, c.env));
});

app.get('/', (c) => (c.env.STATIC_HTML ? c.html(c.env.STATIC_HTML) : c.text('Estate Harness API running')));

export default app;
