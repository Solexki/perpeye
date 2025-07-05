const axios = require("axios");

async function getCandleData(symbol, interval = "15m", limit = 60) {
  const url = `https://api.mexc.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const { data } = await axios.get(url);

  return data.map(([time, open, high, low, close, volume]) => ({
    time,
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close),
    volume: parseFloat(volume),
  }));
}

async function getBinanceCandleData(symbol, interval = "15m", limit = 20) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const { data } = await axios.get(url);
  return data.map(([time, open, high, low, close, volume]) => ({
    time: parseInt(time),
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close),
    volume: parseFloat(volume),
  }));
}

async function getBybitCandleData(symbol, interval = "15", limit = 20) {
  const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const { data } = await axios.get(url);
  console.log(data);

  return data.result.list.map(([time, open, high, low, close, volume]) => ({
    time: parseInt(time),
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close),
    volume: parseFloat(volume),
  }));
}

module.exports = { getCandleData, getBinanceCandleData, getBybitCandleData };
