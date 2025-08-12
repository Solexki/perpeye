const { shortSignal, longSignal } = require("./signalCall");
const { upcomingFutures, justListed } = require("./tenMinAlert");
const {
  notifyUserForNewListings,
  getNewListingsTenMins,
} = require("./listingsFun");
const { getUsers } = require("./usersFun");
const { excapeMarkupV2, safeMessage } = require("./utilFun");
const { postTweet } = require("../../xApi");

const sendShortSiganl = async (chatId) => {
  //fetch now
  try {
    const shortCall = await shortSignal();
    // Check if shortCall is empty or undefined. right?
    if (!shortCall || shortCall.length < 1) {
      return safeMessage(
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
    safeMessage(
      chatId,
      `*🔻Market conditions indicate a potential short opportunity in:.*. \n\n${message} \n\n _⚠️Please do your own research before proceeding_`
    );
  } catch (err) {
    console.error(err);
  }
};

const sendLongSiganl = async (chatId) => {
  try {
    //fetch now
    const longCall = await longSignal();
    // Check if shortCall is empty or undefined. right?
    if (!longCall || longCall.length < 1) {
      return safeMessage(
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
    safeMessage(
      chatId,
      `*💹Market conditions indicate a potential short opportunity in. *. \n\n${message}\n\n _⚠️Please do your own research before proceeding_`
    );
  } catch (error) {
    console.error(err);
  }
};

const upcomingFuturesMessage = async (chatId, exchange = "all") => {
  try {
    const listings = await upcomingFutures();
    if (!listings || listings.length < 1) {
      return safeMessage(chatId, "No upcoming futures listings found.");
    }

    const filteredListings = listings.filter(
      (listing) => exchange === "all" || listing.exchange === exchange
    );
    if (!filteredListings || filteredListings.length < 1) {
      return safeMessage(
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
    safeMessage(chatId, `*📢Upcoming Futures Listings:* \n\n${messageText}`);
  } catch (err) {
    console.error(err);
  }
};

const justListedFuturesMessage = async (chatId) => {
  try {
    const listings = await justListed();
    if (!listings || listings.length < 1) {
      return safeMessage(chatId, "No upcoming futures listings found.");
    }
    const messageText = listings
      .map(({ title, id, exchange, listingDate }, index) => {
        const parsedId = excapeMarkupV2(id);
        return `${index + 1}.  *${excapeMarkupV2(
          title
        ).trim()}*\n[More info]: ${
          exchange === "Binance"
            ? `https://www.binance.com/en/futures/${parsedId}`
            : exchange === "Bybit"
            ? `https://www.bybit.com/en-US/trade/${parsedId}`
            : `https://www.mexc.com/markets/${parsedId}`
        }\n_Listed At:_ ${new Date(
          listingDate
        ).toLocaleString()}\n_Exchange:_ *${exchange}*\n`;
      })
      .join("\n\n");
    safeMessage(chatId, `*Recent Futures Listings:* \n\n${messageText}`);
  } catch (err) {
    console.error(err);
  }
};

const sendNewListingsMessage = async () => {
  try {
    const users = await getUsers({ listingNotification: true });
    const listings = await notifyUserForNewListings();
    if (!listings || listings.length < 1) return;
    const messageText = listings
      .map(({ symbol, exchange, listingDate }, index) => {
        const cleanSymbol = excapeMarkupV2(symbol);
        return `${
          index + 1
        }. *${cleanSymbol}*\n Will be listed soon.\nAt: ${listingDate.toLocaleString()}\n\n_Exchange:_ *${exchange}*\n [More info]: ${
          exchange === "Binance"
            ? `https://www.binance.com/en/futures/${cleanSymbol}`
            : exchange === "Bybit"
            ? `https://www.bybit.com/en-US/trade/${cleanSymbol}`
            : `https://www.mexc.com/markets/${cleanSymbol}`
        }`;
      })
      .join("\n......................................\n\n");

    //tell all users
    for (const user of users) {
      safeMessage(user.userId, `*Upcoming Listing Alert:* \n\n${messageText}`);
    }
    await postTweet(messageText);
  } catch (error) {
    console.error("Error sending new listings message:", error);
  }
};

const sendTenMinsNewListingsMessage = async () => {
  try {
    const users = await getUsers({ listingNotification: true });

    const listings = await getNewListingsTenMins();
    if (!listings || listings.length < 1) {
      return;
    }
    console.log(
      `Found ${listings.length} new listings in the last 10 minutes.`
    );

    // Format the message to send
    const messageText = listings
      .map(({ symbol, exchange, listingDate }, index) => {
        const cleanSymbol = excapeMarkupV2(symbol);
        return `${
          index + 1
        }. *${cleanSymbol}*\n Was listed recently.\nAt: ${listingDate.toLocaleString()}\n\n_Exchange:_ *${exchange}*\n[More info]: ${
          exchange === "Binance"
            ? `https://www.binance.com/en/futures/${cleanSymbol}`
            : exchange === "Bybit"
            ? `https://www.bybit.com/en-US/trade/${cleanSymbol}`
            : `https://www.mexc.com/markets/${cleanSymbol}`
        }`;
      })
      .join("\n....................................\n\n");
    for (const user of users) {
      const chatId = user.userId;
      if (!chatId) continue; // Skip if chatId is not available
      safeMessage(chatId, `*New Listing Alert:* \n\n${messageText}`);
    }
    await postTweet(`*New Listing Alert:* \n\n${messageText}`);
  } catch (err) {
    console.error(err);
  }
};

async function signalAlert(siganls) {
  try {
    if (!siganls || siganls.length < 1) return;
    const users = await getUsers({ receiveSignalOn: true });
    const message = siganls
      .map((item) => {
        return `${
          item.signalType === "long" ? "🟢" : "🔻"
        } *${item.signal.toUpperCase()} SIGNAL* for *${excapeMarkupV2(
          item.symbol
        )}*
   *Current Price:* $${item.price}\n\n${
          item.signalType === "short"
            ? "🔻 _Market showing weakness: 3 lower highs + significant volume drop. Possible breakdown incoming._"
            : "📈 _Market showing strength: 3 higher lows + volume expansion. Possible breakout forming._"
        }\n\nConfidence: ${item.confidence}%
    `;
      })
      .join("\n ............................\n\n");

    //post to twitter
    console.log(message.replace(/[*_`~]/g, ""));
    if (!users) return;
    for (const user of users) {
      const chatId = user.userId;
      if (!chatId) continue;

      //now send message to each user
      safeMessage(
        chatId,
        `${message}\n\n _⚠️Please make sure to carry out additional analysis, what you see here are mere trade suggestion!_`
      );
    }
  } catch (err) {
    console.error(err);
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
