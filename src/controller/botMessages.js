const { shortSignal, longSignal } = require("./signalCall");
const { upcomingFutures, justListed } = require("./tenMinAlert");
const {
  notifyUserForNewListings,
  getNewListingsTenMins,
} = require("./listingsFun");
const { getUsers } = require("./usersFun");
const { excapeMarkupV2 } = require("./utilFun");

const sendShortSiganl = async (bot, chatId) => {
  //fetch now
  const shortCall = await shortSignal();
  // Check if shortCall is empty or undefined. right?
  if (!shortCall || shortCall.length < 1) {
    return bot.sendMessage(
      chatId,
      "No short signal detected at the moment. Please try again later."
    );
  }
  // Format the message to send
  const message = shortCall
    .map((call) => {
      return `Symbol: ${excapeMarkupV2(call.symbol)}\nCurrent Price: ${
        call.price
      }\nConfidence: ${call.confidence}/5\n`;
    })
    .join("\n.......................\n");

  //message +=
  bot.sendMessage(
    chatId,
    `*🔻Market conditions indicate a potential short opportunity in:.*. \n\n${message} \n\n _⚠️Please do your own research before proceeding_`,
    { parse_mode: "Markdown" }
  );
};

const sendLongSiganl = async (bot, chatId) => {
  //fetch now
  const longCall = await longSignal();
  // Check if shortCall is empty or undefined. right?
  if (!longCall || longCall.length < 1) {
    return bot.sendMessage(
      chatId,
      "No Long signal detected at the moment. Please try again later."
    );
  }
  // Format the message to send
  const message = longCall
    .map((call) => {
      return `Symbol: ${excapeMarkupV2(call.symbol)}\nCurrent Price: ${
        call.price
      }\n`;
    })
    .join("\n............................................\n");

  //message +=
  bot.sendMessage(
    chatId,
    `*💹Market conditions indicate a potential short opportunity in. *. \n\n${message}\n\n _⚠️Please do your own research before proceeding_`,
    { parse_mode: "Markdown" }
  );
};

const upcomingFuturesMessage = async (bot, chatId, exchange = "all") => {
  const listings = await upcomingFutures();
  if (!listings || listings.length < 1) {
    return bot.sendMessage(chatId, "No upcoming futures listings found.");
  }

  const filteredListings = listings.filter(
    (listing) => exchange === "all" || listing.exchange === exchange
  );
  if (!filteredListings || filteredListings.length < 1) {
    return bot.sendMessage(
      chatId,
      `No upcoming futures listings found for ${exchange}.`
    );
  }

  const messageText = filteredListings
    .map(({ title, id, exchange, listingDate }, index) => {
      return `${index + 1}.  *${title
        .replace(/_/g, "")
        .trim()}*\n\n[More info]: ${
        exchange === "Binance"
          ? `https://www.binance.com/en/futures/${id.replace(/_/g, "")}`
          : exchange === "Bybit"
          ? `https://www.bybit.com/en-US/trade/${id.replace(/_/g, "")}`
          : `https://www.mexc.com/markets/${id.replace(/_/g, "")}`
      }\n_Listing Date:_ ${new Date(
        listingDate
      ).toLocaleString()}\n_Exchange:_ *${exchange}*\n`;
    })
    .join("\n.................................\n");

  bot.sendMessage(chatId, `*📢Upcoming Futures Listings:* \n\n${messageText}`, {
    parse_mode: "Markdown",
  });
};

const justListedFuturesMessage = async (bot, chatId) => {
  const listings = await justListed();
  if (!listings || listings.length < 1) {
    return bot.sendMessage(chatId, "No upcoming futures listings found.");
  }
  const messageText = listings
    .map(({ title, id, exchange, listingDate }, index) => {
      return `${index + 1}.  *${excapeMarkupV2(title).trim()}*\n[More info]: ${
        exchange === "Binance"
          ? `https://www.binance.com/en/futures/${id}`
          : exchange === "Bybit"
          ? `https://www.bybit.com/en-US/trade/${id}`
          : `https://www.mexc.com/markets/${id}`
      }\n_Listed At:_ ${new Date(
        listingDate
      ).toLocaleString()}\n_Exchange:_ *${exchange}*\n`;
    })
    .join("\n\n");
  bot.sendMessage(chatId, `*Recent Futures Listings:* \n\n${messageText}`, {
    parse_mode: "Markdown",
  });
};

const sendNewListingsMessage = async (bot) => {
  const users = await getUsers();
  try {
    const listings = await notifyUserForNewListings();
    if (!listings || listings.length < 1) return;
    const messageText = listings
      .map(({ symbol, exchange, listingDate }, index) => {
        return `${index + 1}. *${excapeMarkupV2(
          symbol
        )}*\n Will be listed soon.\nAt: ${listingDate.toLocaleString()}\n\n_Exchange:_ *${exchange}*\n [More info]: ${
          exchange === "Binance"
            ? `https://www.binance.com/en/futures/${symbol}`
            : exchange === "Bybit"
            ? `https://www.bybit.com/en-US/trade/${symbol}`
            : `https://www.mexc.com/markets/${symbol}`
        }`;
      })
      .join("\n......................................\n\n");

    //tell all users
    for (const user of users) {
      bot.sendMessage(
        user.userId,
        `*Upcoming Listing Alert:* \n\n${messageText}`,
        {
          parse_mode: "Markdown",
        }
      );
    }
  } catch (error) {
    console.error("Error sending new listings message:", error);
  }
};

const sendTenMinsNewListingsMessage = async (bot) => {
  const users = await getUsers();

  const listings = await getNewListingsTenMins();
  if (!listings || listings.length < 1) {
    console.log("No new listings found in the last 10 minutes.");
    return;
  }
  console.log(`Found ${listings.length} new listings in the last 10 minutes.`);

  // Format the message to send
  const messageText = listings
    .map(({ symbol, exchange, listingDate }, index) => {
      return `${index + 1}. *${excapeMarkupV2(
        symbol
      )}*\n Was listed recently.\nAt: ${listingDate.toLocaleString()}\n\n_Exchange:_ *${exchange}*\n[More info]: ${
        exchange === "Binance"
          ? `https://www.binance.com/en/futures/${symbol}`
          : exchange === "Bybit"
          ? `https://www.bybit.com/en-US/trade/${symbol}`
          : `https://www.mexc.com/markets/${symbol}`
      }`;
    })
    .join("\n....................................\n\n");
  for (const user of users) {
    const chatId = user.userId;
    if (!chatId) continue; // Skip if chatId is not available
    bot.sendMessage(chatId, `*New Listing Alert:* \n\n${messageText}`, {
      parse_mode: "Markdown",
    });
  }
};

async function signalAlert(bot, siganls) {
  if (!siganls || siganls.length < 1) return;
  const users = await getUsers();
  const message = siganls
    .map((item) => {
      return `${
        item.signalType === "long" ? "🟢" : "🔻"
      } *${item.signal.toUpperCase()} SIGNAL* for *${item.symbol}*
 *Current Price:* $${item.price}\n\n${
        item.signalType === "short"
          ? "🔻 _Market showing weakness: 3 lower highs + significant volume drop. Possible breakdown incoming._"
          : "📈 _Market showing strength: 3 higher lows + volume expansion. Possible breakout forming._"
      }\n\nConfidence: ${item.confidence}%
  `;
    })
    .join("\n ............................\n\n");

  if (!users) return;
  for (const user of users) {
    const chatId = user.userId;
    if (!chatId) continue;

    //now send message to each user
    await bot.sendMessage(
      chatId,
      `${message}\n\n _⚠️Please make sure to carry out additional analysis, what you see here are mere trade suggestion!_`,
      { parse_mode: "Markdown" }
    );
  }
}

module.exports = {
  sendShortSiganl,
  sendLongSiganl,
  upcomingFuturesMessage,
  justListedFuturesMessage,
  sendNewListingsMessage,
  sendTenMinsNewListingsMessage,
  signalAlert,
};
