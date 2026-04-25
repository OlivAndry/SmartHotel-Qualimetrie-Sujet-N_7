const express = require('express');
const app = express();
app.use(express.json());

// ==================== FONCTIONS PURES ====================
function applySeason(price, season) {
  return season === 'Haute' ? price * 1.5 : price;
}

function applyWeekend(price, hasWeekend) {
  return hasWeekend ? price * 1.2 : price;
}

function applyLongStay(price, nights) {
  return nights > 7 ? price * 0.85 : price;
}

// ==================== CORE ====================
function calculatePrice(data) {
  const { basePrice, season, hasWeekend, nights, hasSeaView, isVip, guests } = data;
  let pricePerNight = basePrice;
  pricePerNight = applySeason(pricePerNight, season);
  pricePerNight = applyWeekend(pricePerNight, hasWeekend);
  pricePerNight = applyLongStay(pricePerNight, nights);
  let total = pricePerNight * nights;
  if (hasSeaView) total += 30 * nights;
  if (!isVip && guests > 0) total += 15 * nights * guests;
  return Math.round(total * 100) / 100;
}

// ==================== ROUTES ====================
app.post('/api/book-room', (req, res) => {
  const { basePrice, nights } = req.body;
  if (!basePrice || !nights) {
    return res.status(400).json({ error: 'basePrice et nights requis' });
  }
  const total = calculatePrice(req.body);
  res.json({ total });
});

app.get('/', (req, res) => res.send('SmartHotel API'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ==================== SERVER ====================
/* istanbul ignore next */
if (require.main === module) {
  app.listen(3000, () => console.log('Server running on port 3000'));
}

module.exports = { app, calculatePrice };