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

function applySeaView(total, hasSeaView, nights) {
  return hasSeaView ? total + 30 * nights : total;
}

function applyBreakfast(total, isVip, guests, nights) {
  if (isVip) return total;
  if (guests <= 0) return total;
  return total + 15 * nights * guests;
}

// ==================== CORE ====================
function calculatePrice(data) {
  const { basePrice, season, hasWeekend, nights, hasSeaView, isVip, guests } = data;
  let pricePerNight = applySeason(basePrice, season);
  pricePerNight = applyWeekend(pricePerNight, hasWeekend);
  pricePerNight = applyLongStay(pricePerNight, nights);
  let total = applySeaView(pricePerNight * nights, hasSeaView, nights);
  total = applyBreakfast(total, isVip, guests, nights);
  return Math.round(total * 100) / 100;
}

// ==================== ROUTES ====================
app.post('/api/book-room', (req, res) => {
  const { basePrice, nights } = req.body;
  if (!basePrice || !nights) {
    return res.status(400).json({ error: 'basePrice et nights requis' });
  }
  res.json({ total: calculatePrice(req.body) });
});

app.get('/', (req, res) => res.send('SmartHotel API'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

/* istanbul ignore next */
if (require.main === module) {
  app.listen(3000, () => console.log('Server running on port 3000'));
}

module.exports = { app, calculatePrice };