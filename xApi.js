let client = null;

async function intitTwitter() {
  if (client) return client;
  const { TwitterApi } = await import("twitter-api-v2");
  client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });
  return client;
}

export const postTweet = async (message) => {
  console.log("sending..", message);
  const c = await intitTwitter();
  try {
    if (!message) return;
    const { data } = await c.v2.tweet(message.replace(/\/*_\\/g, ""));
    console.log(`✅ Tweet posted: https://twitter.com/user/status/${data.id}`);
  } catch (error) {
    console.error("❌ Error posting tweets:", error);
  }
};

export const postSignalsThread = async (signals) => {
  const c = await intitTwitter();
  if (!c?.v2?.tweet) {
    throw new Error("Invalid TwitterApi client instance.");
  }

  const hour = new Date().getHours().toLocaleString();
  const hour12 = hour % 12 || 12;
  const surfix = hour < 12 ? "am" : "pm";
  const now = new Date();
  const dateString = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // First tweet (thread starter)
  const introTweet = `${hour12}${surfix} Watchlist — ${signals.length} Hot Coins for ${dateString} 🚀.
Fresh market analysis for ${dateString}, straight from our scanner. 

Your next setup might be in here — but always DYOR before entering a trade. 🧵

#CryptoSignals #CryptoTrading #Bitcoin #Altcoins`;

  let replyToId = null;

  try {
    const introRes = await c.v2.tweet({ text: introTweet });
    replyToId = introRes.data.id;
  } catch (err) {
    console.error("❌ Error posting intro tweet:", err);
    return;
  }

  // Post each signal as part of the thread
  for (const item of signals) {
    const direction = item.signalType === "long" ? "🟢 LONG" : "🔻 SHORT";
    const description =
      item.signalType === "short"
        ? "🔻 Market showing weakness: 3 lower highs + vol drop."
        : "📈 Market showing strength: 3 higher lows + vol up.";

    const tweet = `${direction} SIGNAL for $${item.symbol.toUpperCase()}
Price: ${item.price} $USDT
${description}
Confidence: ${item.confidence}%
#CryptoSignals #CryptoTrading #DayTrading`;

    if (tweet.length > 280) {
      console.warn(`Tweet too long (${tweet.length} chars), skipping:`, tweet);
      continue;
    }

    try {
      const res = await c.v2.tweet({
        text: tweet,
        reply: { in_reply_to_tweet_id: replyToId },
      });
      replyToId = res.data.id;
      console.log(`✅ Tweet posted: ${tweet}`);
    } catch (err) {
      console.error("❌ Error posting tweet:", err);
    }
  }
};
