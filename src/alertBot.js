const axios = require("axios");
const BOT_TOKEN = "";
const CHAT_ID = "";

async function alert(symbol, price, signalType = "short", confidence = 0) {
  const emoji = signalType === "long" ? "🟢" : "🔻";
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const message = `${emoji} *${signalType.toUpperCase()} SIGNAL* for *${symbol}*
 Current Price: $${price} \n
  ${
    signalType === "short"
      ? "🔻 Market showing weakness: 3 lower highs + significant volume drop. Possible breakdown incoming."
      : "📈 Market showing strength: 3 higher lows + volume expansion. Possible breakout forming."
  } \n
  Confidence: ${confidence}%
  `;
  await axios.post(
    url,
    {
      chat_id: CHAT_ID,
      text: message,
    },
    { parse }
  );
}

module.exports = alert;
