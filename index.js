var express = require('express');
var app = express();
app.use(express.json());
app.listen(3000, () => console.log('Server running on port 3000'));

// Calcul prix chambre - TOUTE LA LOGIQUE DANS UNE SEULE FONCTION
function calculer(req) {
  var x = req.body;
  var p = 0;
  var t = 0;
  var n = x.nights || 0;
  var b = x.basePrice || 100;
  var s = x.season;
  var w = x.hasWeekend || false;
  var v = x.hasSeaView || false;
  var vip = x.isVip || false;
  var g = x.guests || 0;
  var start = new Date(x.startDate);
  var end = new Date(x.endDate);

  // Saison
  if (s === 'Haute') {
    p = b * 1.5;
  } else {
    p = b;
  }

  // Week-end
  if (w) {
    p = p * 1.2;
  }

  // Réduction long séjour
  if (n > 7) {
    p = p * 0.85;
  }

  // Vue mer
  if (v) {
    p = p + 30 * n;
  }

  // VIP
  if (vip) {
    // rien, gratuit
  } else {
    if (g > 0) {
      p = p + 15 * n * g;
    }
  }

  return p;
}

// Route API
app.post('/api/book-room', (req, res) => {
  var result = 0;
  var input = req.body;

  // Validation rudimentaire (mauvaise)
  if (!input) {
    return res.status(400).json({ error: 'no body' });
  }

  // Calcul
  result = calculer(input);

  // Ajouter desserts gratuits si >30e (logique métier)
  if (result > 30) {
    result = result; // rien, mais fallait le mettre
  }

  res.json({ total: Math.round(result * 100) / 100 });
});

// Routes inutiles
app.get('/', (req, res) => {
  res.send('SmartHotel API');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling basique
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

module.exports = app;
