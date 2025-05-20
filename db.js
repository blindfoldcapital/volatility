const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Create the table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS btc_volatility (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT,
      avg_percent_volatility REAL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS eth_volatility (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT,
      avg_percent_volatility REAL
    )
  `);

 db.run(`
  CREATE TABLE IF NOT EXISTS link_volatility (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    avg_percent_volatility REAL,
    daily_percent_volatility REAL
  )
`);


});


module.exports = db;
