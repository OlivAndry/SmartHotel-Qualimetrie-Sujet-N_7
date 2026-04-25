const request = require('supertest');
const app = require('../index.js');

describe('POST /api/book-room', () => {
  test('should calculate base price without options', () => {
    return request(app)
      .post('/api/book-room')
      .send({
        season: 'Basse',
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        nights: 4,
        hasWeekend: false,
        hasSeaView: false,
        isVip: false,
        guests: 0,
        basePrice: 100
      })
      .expect(200)
      .expect(res => {
        // 4 nuits * 100 = 400
        expect(res.body.total).toBe(400);
      });
  });

  test('should apply high season 50% increase', () => {
    return request(app)
      .post('/api/book-room')
      .send({
        season: 'Haute',
        startDate: '2024-07-01',
        endDate: '2024-07-05',
        nights: 4,
        hasWeekend: false,
        hasSeaView: false,
        isVip: false,
        guests: 0,
        basePrice: 100
      })
      .expect(200)
      .expect(res => {
        // 4 * 100 * 1.5 = 600
        expect(res.body.total).toBe(600);
      });
  });

  test('should apply weekend 20% increase', () => {
    return request(app)
      .post('/api/book-room')
      .send({
        season: 'Basse',
        startDate: '2024-01-05', // vendredi
        endDate: '2024-01-07',   // dimanche
        nights: 2,
        hasWeekend: true,
        hasSeaView: false,
        isVip: false,
        guests: 0,
        basePrice: 100
      })
      .expect(200)
      .expect(res => {
        // 2 * 100 * 1.2 = 240
        expect(res.body.total).toBe(240);
      });
  });

  test('should apply long stay 15% discount', () => {
    return request(app)
      .post('/api/book-room')
      .send({
        season: 'Basse',
        startDate: '2024-01-01',
        endDate: '2024-01-10',
        nights: 9,
        hasWeekend: false,
        hasSeaView: false,
        isVip: false,
        guests: 0,
        basePrice: 100
      })
      .expect(200)
      .expect(res => {
        // 9 * 100 * 0.85 = 765
        expect(res.body.total).toBe(765);
      });
  });

  test('should add sea view 30€ per night', () => {
    return request(app)
      .post('/api/book-room')
      .send({
        season: 'Basse',
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        nights: 4,
        hasWeekend: false,
        hasSeaView: true,
        isVip: false,
        guests: 0,
        basePrice: 100
      })
      .expect(200)
      .expect(res => {
        // 4*100 + 4*30 = 520
        expect(res.body.total).toBe(520);
      });
  });

  test('should add breakfast 15€ per night per person for non-VIP', () => {
    return request(app)
      .post('/api/book-room')
      .send({
        season: 'Basse',
        startDate: '2024-01-01',
        endDate: '2024-01-03',
        nights: 2,
        hasWeekend: false,
        hasSeaView: false,
        isVip: false,
        guests: 2,
        basePrice: 100
      })
      .expect(200)
      .expect(res => {
        // 2*100 + 2*2*15 = 460
        expect(res.body.total).toBe(460);
      });
  });

  test('should NOT charge breakfast for VIP', () => {
    return request(app)
      .post('/api/book-room')
      .send({
        season: 'Basse',
        startDate: '2024-01-01',
        endDate: '2024-01-03',
        nights: 2,
        hasWeekend: false,
        hasSeaView: false,
        isVip: true,
        guests: 2,
        basePrice: 100
      })
      .expect(200)
      .expect(res => {
        // 2*100 = 200 (aucun petit-déjeuner)
        expect(res.body.total).toBe(200);
      });
  });

  test('should combine multiple options', () => {
    return request(app)
      .post('/api/book-room')
      .send({
        season: 'Haute',
        startDate: '2024-01-05',
        endDate: '2024-01-10',
        nights: 5,
        hasWeekend: true,
        hasSeaView: true,
        isVip: false,
        guests: 1,
        basePrice: 100
      })
      .expect(200)
      .expect(res => {
        // (((100*1.5)*1.2) + 5*30) + 5*1*15 = 180 + 150 + 75 = 405
        expect(res.body.total).toBe(405);
      });
  });
});
