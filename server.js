const express = require('express');
const db = require('./db');
const { fetchHourlyData } = require('./fetchVolatility');         // BTC
const { fetchHourlyEthData } = require('./fetchEthVolatility');   // ETH
const { fetchHourlyLinkData } = require('./fetchLinkVolatility'); // LINK

const app = express();
const PORT = 3000;

// Serve latest BTC volatility
app.get('/api/volatility/btc/latest', (req, res) => {
  db.get('SELECT * FROM btc_volatility ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Serve latest ETH volatility
app.get('/api/volatility/eth/latest', (req, res) => {
  db.get('SELECT * FROM eth_volatility ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Serve latest LINK volatility
app.get('/api/volatility/link/latest', (req, res) => {
  db.get('SELECT * FROM link_volatility ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Trigger all three manually (optional)
app.post('/api/volatility/fetch-all', async (req, res) => {
  try {
    const btc = await fetchHourlyData();
    const eth = await fetchHourlyEthData();
    const link = await fetchHourlyLinkData();
    res.json({ success: true, btc, eth, link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-fetch every hour (3600000 ms)
setInterval(async () => {
  console.log(`🕒 Scheduled hourly fetch starting...`);
  try {
    await fetchHourlyData();
    await fetchHourlyEthData();
    await fetchHourlyLinkData();
    console.log(`✅ All volatility data updated successfully.`);
  } catch (err) {
    console.error(`❌ Error during scheduled fetch: ${err.message}`);
  }
}, 60 * 60 * 1000); // 1 hour

// Optional: Fetch once on server start
(async () => {
  console.log(`🚀 Initial volatility sync...`);
  await fetchHourlyData();
  await fetchHourlyEthData();
  await fetchHourlyLinkData();
})();

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
