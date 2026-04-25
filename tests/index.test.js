const request = require('supertest');
const { app, calculatePrice } = require('../index');

const post = (body) =>
  request(app).post('/api/book-room').send(body);

// ==================== FONCTIONS PURES ====================
describe('calculatePrice — fonctions pures', () => {

  test('saison basse — pas de majoration', () => {
    expect(calculatePrice({ basePrice: 100, season: 'Basse', hasWeekend: false, nights: 1, hasSeaView: false, isVip: false, guests: 0 })).toBe(100);
  });

  test('saison haute — majoration x1.5', () => {
    expect(calculatePrice({ basePrice: 100, season: 'Haute', hasWeekend: false, nights: 1, hasSeaView: false, isVip: false, guests: 0 })).toBe(150);
  });

  test('week-end — majoration x1.2', () => {
    expect(calculatePrice({ basePrice: 100, season: 'Basse', hasWeekend: true, nights: 1, hasSeaView: false, isVip: false, guests: 0 })).toBe(120);
  });

  test('long sejour 7 nuits — pas de reduction', () => {
    expect(calculatePrice({ basePrice: 100, season: 'Basse', hasWeekend: false, nights: 7, hasSeaView: false, isVip: false, guests: 0 })).toBe(700);
  });

  test('long sejour >7 nuits — reduction x0.85', () => {
    expect(calculatePrice({ basePrice: 100, season: 'Basse', hasWeekend: false, nights: 8, hasSeaView: false, isVip: false, guests: 0 })).toBe(680);
  });

});

// ==================== ROUTES GET ====================
describe('GET /', () => {
  test('retourne le nom de API', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('SmartHotel API');
  });
});

describe('GET /health', () => {
  test('retourne le statut ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ==================== POST /api/book-room ====================
describe('POST /api/book-room', () => {

  test('prix de base uniquement', async () => {
    // 100 x 4 = 400
    const res = await post({ basePrice: 100, nights: 4, season: 'Basse', hasWeekend: false, hasSeaView: false, isVip: false, guests: 0 });
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(400);
  });

  test('haute saison', async () => {
    // 100 x 1.5 x 4 = 600
    const res = await post({ basePrice: 100, nights: 4, season: 'Haute', hasWeekend: false, hasSeaView: false, isVip: false, guests: 0 });
    expect(res.body.total).toBe(600);
  });

  test('week-end', async () => {
    // 100 x 1.2 x 2 = 240
    const res = await post({ basePrice: 100, nights: 2, season: 'Basse', hasWeekend: true, hasSeaView: false, isVip: false, guests: 0 });
    expect(res.body.total).toBe(240);
  });

  test('reduction long sejour (>7 nuits)', async () => {
    // 100 x 0.85 x 9 = 765
    const res = await post({ basePrice: 100, nights: 9, season: 'Basse', hasWeekend: false, hasSeaView: false, isVip: false, guests: 0 });
    expect(res.body.total).toBe(765);
  });

  test('vue mer', async () => {
    // 100 x 4 + 30 x 4 = 520
    const res = await post({ basePrice: 100, nights: 4, season: 'Basse', hasWeekend: false, hasSeaView: true, isVip: false, guests: 0 });
    expect(res.body.total).toBe(520);
  });

  test('petit-dejeuner (non VIP)', async () => {
    // 100 x 2 + 15 x 2 x 2 = 260
    const res = await post({ basePrice: 100, nights: 2, season: 'Basse', hasWeekend: false, hasSeaView: false, isVip: false, guests: 2 });
    expect(res.body.total).toBe(260);
  });

  test('VIP sans petit-dejeuner', async () => {
    // 100 x 2 = 200
    const res = await post({ basePrice: 100, nights: 2, season: 'Basse', hasWeekend: false, hasSeaView: false, isVip: true, guests: 2 });
    expect(res.body.total).toBe(200);
  });

  test('combine haute saison + week-end + vue mer + petit-dejeuner', async () => {
    // 100 x 1.5 x 1.2 x 5 = 900 + 150 (vue mer) + 75 (petit-dej) = 1125
    const res = await post({ basePrice: 100, nights: 5, season: 'Haute', hasWeekend: true, hasSeaView: true, isVip: false, guests: 1 });
    expect(res.body.total).toBe(1125);
  });

  test('champs manquants — 400', async () => {
    const res = await post({ season: 'Basse' });
    expect(res.statusCode).toBe(400);
  });

});