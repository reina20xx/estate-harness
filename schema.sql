-- Estate Harness D1 Schema: Real Estate AI Property Matcher & Viewing Booking Engine

CREATE TABLE IF NOT EXISTS buyers (
  id TEXT PRIMARY KEY,
  buyer_name TEXT NOT NULL,
  preferred_area TEXT NOT NULL,
  max_rent_jpy INTEGER NOT NULL,
  min_layout TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  property_name TEXT NOT NULL,
  area TEXT NOT NULL,
  rent_jpy INTEGER NOT NULL,
  layout TEXT NOT NULL,
  walk_minutes INTEGER NOT NULL,
  matched_buyers_count INTEGER NOT NULL,
  ai_pitch_message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

INSERT OR IGNORE INTO buyers (id, buyer_name, preferred_area, max_rent_jpy, min_layout, created_at) VALUES
  ('buy_1', '伊藤 健太', '恵比寿・目黒', 190000, '1LDK', '2026-10-21T00:00:00.000Z'),
  ('buy_2', '山本 裕子', '渋谷・恵比寿', 220000, '1LDK', '2026-10-21T00:00:00.000Z');
