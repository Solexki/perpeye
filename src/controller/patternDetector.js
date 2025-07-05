const { RSI, MACD } = require("technicalindicators");

function calculateRSI(closes, period = 14) {
  return RSI.calculate({ values: closes, period }).slice(-1)[0];
}

function calculateMACD(closes) {
  const result = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });

  return result[result.length - 1]; // Latest MACD snapshot
}

function detectSignalType(candles) {
  if (!candles || candles.length < 20) return { signal: null, confidence: 0 };

  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const volumes = candles.map((c) => c.volume);
  const closes = candles.map((c) => c.close);

  const [h1, h2, h3, h4] = highs.slice(-4);
  const [l1, l2, l3, l4] = lows.slice(-4);
  const [v1, , , v4] = volumes.slice(-4); // Start vs end volume

  const rsi = calculateRSI(closes);
  const macd = calculateMACD(closes); // Conditions

  const isLowerHighs = h2 < h1 && h3 < h2 && h4 < h3;
  const isHigherLows = l2 > l1 && l3 > l2 && l4 > l3;
  const isVolumeDrop = v4 < v1 * 0.5;
  const isVolumeRise = v4 > v1 * 1.5;
  const isRSIBearish = rsi < 50;
  const isRSIBullish = rsi > 50;
  const isMACDBearish = macd && macd.MACD < macd.signal;
  const isMACDBullish = macd && macd.MACD > macd.signal;

  let confidence = 0; // Short signal confidence

  if (isLowerHighs) confidence++;
  if (isVolumeDrop) confidence++;
  if (isRSIBearish) confidence++;
  if (isMACDBearish) confidence++;

  if (isLowerHighs && isVolumeDrop && isRSIBearish && isMACDBearish) {
    return {
      signal: "short",
      confidence,
      rsi,
      macd,
    };
  } // Reset confidence for long

  confidence = 0;
  if (isHigherLows) confidence++;
  if (isVolumeRise) confidence++;
  if (isRSIBullish) confidence++;
  if (isMACDBullish) confidence++;

  if (isHigherLows && isVolumeRise && isRSIBullish && isMACDBullish) {
    return {
      signal: "long",
      confidence,
      rsi,
      macd,
    };
  }

  return {
    signal: null,
    confidence: 0,
    rsi,
    macd,
  };
}

module.exports = detectSignalType;
