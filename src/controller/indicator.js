// src/indicatorLogic.js
const { RSI, MACD } = require("technicalindicators");

function analyzeIndicators(candles) {
  const closes = candles.map((c) => c.close);

  // --- RSI Setup ---
  const rsiValues = RSI.calculate({ values: closes, period: 14 });
  const latestRSI = rsiValues[rsiValues.length - 1];

  // --- MACD Setup ---
  const macdInput = {
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  };
  const macdValues = MACD.calculate(macdInput);
  const latestMACD = macdValues[macdValues.length - 1];

  return {
    rsi: latestRSI,
    macd: latestMACD,
  };
}

module.exports = analyzeIndicators;
