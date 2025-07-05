const axios = require("axios");

const getNewListing = async () => {
  const url = "https://api.mexc.com/api/v3/exchangeInfo";
  const { data } = await axios.get(url);
  const symbols = data.symbols;

  const newCoin = symbols.filter(
    (s) =>
      s.symbol.endsWith("USDT") &&
      s.isSpotTradingAllowed &&
      !s.symbol.includes("ETF")
  );

  return newCoin.slice(0, 30);
};

module.exports = getNewListing;
