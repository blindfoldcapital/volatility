const axios = require('axios');
const db = require('./db');

async function fetchHourlyLinkData() {
  const url = 'https://api.coingecko.com/api/v3/coins/chainlink/market_chart?vs_currency=usd&days=2';

  try {
    console.log(`📡 Fetching hourly LINK data from CoinGecko...`);
    const res = await axios.get(url);
    const prices = res.data.prices;
    console.log(`✅ Received ${prices.length} hourly price points`);

    const last24Hours = prices.slice(-24);
    let totalPercentageMove = 0;

    const priceValues = last24Hours.map(p => p[1]);
    const high = Math.max(...priceValues);
    const low = Math.min(...priceValues);
    const dailyPercentVolatility = ((high - low) / low) * 100;

    for (let i = 1; i < last24Hours.length; i++) {
      const [prevTime, prevPrice] = last24Hours[i - 1];
      const [currTime, currPrice] = last24Hours[i];
      const percentChange = Math.abs((currPrice - prevPrice) / prevPrice) * 100;

      console.log(`-------------------------------`);
      console.log(`⏰ Hour ${i}`);
      console.log(`🕒 From: ${new Date(prevTime).toISOString()}`);
      console.log(`💰 Prev Price: $${prevPrice.toFixed(2)}`);
      console.log(`💰 Curr Price: $${currPrice.toFixed(2)}`);
      console.log(`📈 % Change: ${percentChange.toFixed(4)}%`);

      totalPercentageMove += percentChange;
    }

    const avgPercentVolatility = totalPercentageMove / (last24Hours.length - 1);
    const timestamp = new Date().toISOString();

    console.log(`===============================`);
    console.log(`📊 Total % Change Sum: ${totalPercentageMove.toFixed(4)}%`);
    console.log(`📉 Average % Volatility Per Hour: ${avgPercentVolatility.toFixed(4)}%`);
    console.log(`📆 Daily % Volatility: ${dailyPercentVolatility.toFixed(4)}%`);
    console.log(`🕓 Timestamp: ${timestamp}`);
    console.log(`💾 Saving to database...`);

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO link_volatility (timestamp, avg_percent_volatility, daily_percent_volatility)
         VALUES (?, ?, ?)`,
        [timestamp, avgPercentVolatility.toFixed(4), dailyPercentVolatility.toFixed(4)],
        (err) => {
          if (err) {
            console.error(`❌ DB Insert Error: ${err.message}`);
            return reject(err);
          } else {
            console.log(`✅ LINK volatility saved successfully to SQLite.`);
            resolve();
          }
        }
      );
    });

    return {
      timestamp,
      avgPercentVolatility: avgPercentVolatility.toFixed(4),
      dailyPercentVolatility: dailyPercentVolatility.toFixed(4)
    };

  } catch (err) {
    console.error(`❌ Error during fetchHourlyLinkData: ${err.message}`);
    return null;
  }
}

module.exports = { fetchHourlyLinkData };
