const express = require('express');
const app = express();
app.use(express.json());

// ==================== FONCTIONS PURES ====================

// Calcule le prix de base selon la saison
function applySeason(basePrice, season) {
  return season === 'Haute' ? basePrice * 1.5 : basePrice;
}

// Applique la majoration week-end
function applyWeekend(price, hasWeekend) {
  return hasWeekend ? price * 1.2 : price;
}

// Applique la réduction long séjour
function applyLongStayDiscount(price, nights) {
  return nights > 7 ? price * 0.85 : price;
}

// Ajoute la vue mer
function addSeaView(price, hasSeaView, nights) {
  return hasSeaView ? price + 30 * nights : price;
}

// Ajoute les petits-déjeuners
function addBreakfast(total, isVip, nights, guests) {
  if (isVip || guests === 0) return total;
  return total + (15 * nights * guests);
}

// Fonction principale (découpée en 5 sous-fonctions)
function calculatePrice(data) {
  const { basePrice, season, hasWeekend, nights, hasSeaView, isVip, guests } = data;

  let pricePerNight = basePrice;

  pricePerNight = applySeason(pricePerNight, season);
  pricePerNight = applyWeekend(pricePerNight, hasWeekend);
  pricePerNight = applyLongStayDiscount(pricePerNight, nights);

  let total = pricePerNight * nights;

  if (hasSeaView) {
    total += 30 * nights;
  }

  if (!isVip && guests > 0) {
    total += 15 * nights * guests;
  }

  return Math.round(total * 100) / 100;
}

// ==================== ROUTES ====================

app.post('/api/book-room', (req, res) => {
  const { basePrice, nights, season, startDate, endDate } = req.body;

  if (!basePrice || !nights) {
    return res.status(400).json({ error: 'basePrice et nights requis' });
  }

  const total = calculatePrice(req.body);
  res.json({ total });
});

app.get('/', (req, res) => res.send('SmartHotel API'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ==================== SERVEUR ====================
if (require.main === module) {
  app.listen(3000, () => console.log('Server running on port 3000'));
}

module.exports = { app, calculatePrice };
