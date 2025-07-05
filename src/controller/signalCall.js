const getNewListings = require("./fetchListings");
const { getCandleData } = require("./priceTracker");
const detectShortSignal = require("./patternDetector");
const detectSignalType = require("./patternDetector");

const shortSignal = async () => {
  const listings = await getNewListings();
  const signals = [];

  for (let coin of listings) {
    const symbol = coin.symbol;
    const candles = await getCandleData(symbol);
    const { signal, confidence } = detectSignalType(candles);

    if (signal === "short") {
      const latest = candles[candles.length - 1];

      signals.push({
        symbol: symbol,
        price: latest.close,
        confidence: confidence,
        message:
          "Market conditions(3 lower + low volume) indicate a potential short opportunity. Please do your own research before proceeding.",
      });
    }
  }
  if (signals.length < 1) {
    console.log("No short signal detected at the moment.");
    return [];
  }
  return signals;
};

// const shortSignal = async () => {
//   const listings = await getNewListings();
//   const signals = [];

//   for (let coin of listings) {
//     const symbol = coin.symbol;
//     const candles = await getCandleData(symbol);
//     if (detectShortSignal(candles)) {
//       const latest = candles[candles.length - 1];
//       signals.push({
//         symbol: symbol,
//         price: latest.close,
//         message:
//           "Market conditions(3 lower + low volume) indicate a potential short opportunity. Please do your own research before proceeding.",
//       });
//     }
//   }
//   if (signals.length < 1) {
//     console.log("No short signal detected at the moment.");
//     return [];
//   }
//   return signals;
// };

const longSignal = async () => {
  const listings = await getNewListings();
  const signals = [];
  for (let coin of listings) {
    const symbol = coin.symbol;
    const candles = await getCandleData(symbol);
    const signal = detectSignalType(candles);

    if (signal === "long") {
      const latest = candles[candles.length - 1];
      signals.push({
        symbol: symbol,
        price: latest.close,
      });
    }
  }
  if (signals.length < 1) {
    console.log("No long signal detected at the moment.");
    return [];
  }
  return signals;
};

module.exports = { shortSignal, longSignal };
