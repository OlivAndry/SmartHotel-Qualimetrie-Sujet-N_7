const request = require('supertest');
const { app } = require('../index');

const post = (body) =>
  request(app).post('/api/book-room').send(body);

describe('POST /api/book-room', () => {

  test('prix de base uniquement', async () => {
    // 100 × 4 = 400
    const res = await post({ basePrice: 100, nights: 4, season: 'Basse', hasWeekend: false, hasSeaView: false, isVip: false, guests: 0 });
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(400);
  });

  test('haute saison', async () => {
    // 100 × 1.5 × 4 = 600
    const res = await post({ basePrice: 100, nights: 4, season: 'Haute', hasWeekend: false, hasSeaView: false, isVip: false, guests: 0 });
    expect(res.body.total).toBe(600);
  });

  test('week-end', async () => {
    // 100 × 1.2 × 2 = 240
    const res = await post({ basePrice: 100, nights: 2, season: 'Basse', hasWeekend: true, hasSeaView: false, isVip: false, guests: 0 });
    expect(res.body.total).toBe(240);
  });

  test('réduction long séjour (>7 nuits)', async () => {
    // 100 × 0.85 × 9 = 765
    const res = await post({ basePrice: 100, nights: 9, season: 'Basse', hasWeekend: false, hasSeaView: false, isVip: false, guests: 0 });
    expect(res.body.total).toBe(765);
  });

  test('vue mer', async () => {
    // 100 × 4 + 30 × 4 = 400 + 120 = 520
    const res = await post({ basePrice: 100, nights: 4, season: 'Basse', hasWeekend: false, hasSeaView: true, isVip: false, guests: 0 });
    expect(res.body.total).toBe(520);
  });

  test('petit-déjeuner (non VIP)', async () => {
    // 100 × 2 + 15 × 2 × 2 = 200 + 60 = 260
    const res = await post({ basePrice: 100, nights: 2, season: 'Basse', hasWeekend: false, hasSeaView: false, isVip: false, guests: 2 });
    expect(res.body.total).toBe(260);
  });

  test('VIP — pas de petit-déjeuner', async () => {
    // 100 × 2 = 200 (pas de petit-déj)
    const res = await post({ basePrice: 100, nights: 2, season: 'Basse', hasWeekend: false, hasSeaView: false, isVip: true, guests: 2 });
    expect(res.body.total).toBe(200);
  });

  test('combiné — haute saison + week-end + vue mer + petit-déj', async () => {
    // 100 × 1.5 × 1.2 × 5 = 900 (nuit)
    // + 30 × 5 = 150 (vue mer)
    // + 15 × 5 × 1 = 75 (petit-déj, 1 guest)
    // total = 1125
    const res = await post({ basePrice: 100, nights: 5, season: 'Haute', hasWeekend: true, hasSeaView: true, isVip: false, guests: 1 });
    expect(res.body.total).toBe(1125);
  });

  test('champs manquants → 400', async () => {
    const res = await post({ season: 'Basse' });
    expect(res.statusCode).toBe(400);
  });
});