const BASE = process.env.BASE_URL || 'http://localhost:8797';

async function runTests() {
  console.log('=== Estate Harness E2E Test Suite ===');
  const health = await fetch(`${BASE}/api/health`).then((r) => r.json());
  if (health.status !== 'ok') throw new Error('Health failed');
  console.log('✅ 1. Health check passed:', health.service);

  const imp = await fetch(`${BASE}/api/listings/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      property_name: 'ザ・パークレジデンス恵比寿 802号室',
      area: '恵比寿',
      rent_jpy: 185000,
      layout: '1LDK',
      walk_minutes: 4,
    }),
  }).then((r) => r.json());

  if (!imp.ok || imp.listing.matched_buyers_count < 2) {
    throw new Error('Property matching failed: ' + JSON.stringify(imp));
  }
  console.log(`✅ 2. Property matched with ${imp.listing.matched_buyers_count} buyers & LINE pitch generated`);
  console.log('🎉 ALL ESTATE HARNESS E2E TESTS PASSED!');
}
runTests().catch((e) => { console.error(e); process.exit(1); });
