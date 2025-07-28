const telegramBot = require("node-telegram-bot-api");
const {
  sendShortSiganl,
  sendLongSiganl,
  upcomingFuturesMessage,
  justListedFuturesMessage,
  sendNewListingsMessage,
  sendTenMinsNewListingsMessage,
  signalAlert,
} = require("./src/controller/botMessages");
const { createUserIfNotExists } = require("./src/controller/usersFun");
require("dotenv/config.js");

const botToken = process.env.BOT_TOKEN;
const bot = new telegramBot(botToken, { polling: false });

const webhookPath = `/bot/${botToken}`;
const webhookUrl = `${process.env.SERVER_URL}${webhookPath}`;

//setup d webhook
const setWebhook = async (app) => {
  app.post(webhookPath, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  try {
    await bot.setWebHook(webhookUrl);
    console.log(`WebHook is set successfully at: ${webhookUrl}`);
  } catch (err) {
    console.log(err);
  }
};

//let start using bot right

//handle the /start command
bot.onText(/\/start(.*)/, async (msg) => {
  const username = msg.from.username;
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  const lastName = msg.from.last_name;
  const isAdmin = false;
  const isPremium = msg.from.isPremium || false;
  const data = { username, firstName, lastName, isAdmin, isPremium, chatId };
  const keyBoard = {
    keyboard: [
      ["Short Signal", "Long Signal"],
      ["New Futures", "New Futures Shortable"],
      ["Upcoming Futures", "Settings"],
      ["Created with ❤️ by @solob_dev"],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };
  bot.sendMessage(
    chatId,
    `Hello _${username.replace(
      /_/g,
      ""
    )}_ 👋\n*Welcome!*\n\nHere, you’ll receive:\n\n• 📉 *Short* and 📈 *Long* trading signals every hour\n• 🆕 Alerts on new coin listings — *before and after they go live*\n• 🎯 Insights on *new listings that are shortable*\nLet’s help you trade smarter.`,

    {
      parse_mode: "Markdown",
      reply_markup: keyBoard,
    }
  );
  await createUserIfNotExists(data);
});

//handle messages from the user
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  if (messageText === "Short Signal") {
    //assurance
    bot.sendMessage(chatId, "Fetching short signal... Please wait.");

    await sendShortSiganl(bot, chatId);

    //ending wink
  } else if (messageText === "Long Signal") {
    //assurance
    bot.sendMessage(chatId, "Fetching long signal... Please wait.");

    //fetching long signal
    await sendLongSiganl(bot, chatId);
    //ending wink
  } else if (messageText === "New Futures") {
    await justListedFuturesMessage(bot, chatId);
  } else if (messageText === "New Futures Shortable") {
    bot.sendMessage(
      chatId,
      "New Futures Shortable functionality is not implemented yet."
    );
  } else if (messageText === "Upcoming Futures") {
    const keyBoard = {
      reply_markup: {
        keyboard: [
          ["All Exchanges"],
          ["Binance", "Bybit", "Mexc"],
          ["Back to Main Menu"],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    };
    bot.sendMessage(
      chatId,
      "Please select an exchange to view upcoming futures listings:",
      keyBoard
    );
  } else if (messageText === "Settings") {
    const keyBoard = {
      reply_markup: {
        keyboard: [
          ["On Notifications", "Off Notifications"],
          ["On Daily Signal", "Off Daily Signal"],
          ["On hourly Signal", "Off hourly Signal"],
          ["Back to Main Menu"],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    };
    bot.sendMessage(
      chatId,
      "Settings Menu:\nChoose an option to toggle notifications or signals.",
      keyBoard
    );

    // Handle settings options
    bot.on("message", (msg) => {
      const chatId = msg.chat.id;
      const messageText = msg.text;
      if (messageText === "On Notifications") {
        bot.sendMessage(chatId, "Notifications are now ON.");
      } else if (messageText === "Off Notifications") {
        bot.sendMessage(chatId, "Notifications are now OFF.");
      } else if (messageText === "On Daily Signal") {
        bot.sendMessage(chatId, "Daily Signal is now ON.");
      } else if (messageText === "Off Daily Signal") {
        bot.sendMessage(chatId, "Daily Signal is now OFF.");
      } else if (messageText === "On hourly Signal") {
        bot.sendMessage(chatId, "Hourly Signal is now ON.");
      } else if (messageText === "Off hourly Signal") {
        bot.sendMessage(chatId, "Hourly Signal is now OFF.");
      }
    });
  } else if (messageText === "Created with ❤️ by @solob_dev") {
    bot.sendMessage(
      chatId,
      "Thank you for using our bot! If you have any questions, feel free to ask."
    );
  } else if (messageText === "Back to Main Menu") {
    const keyBoard = {
      reply_markup: {
        keyboard: [
          ["Short Signal", "Long Signal"],
          ["New Futures", "New Futures Shortable"],
          ["Upcoming Futures", "Settings"],
          ["Created with ❤️ by @solob"],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    };
    bot.sendMessage(chatId, "Returning to the main menu.", keyBoard);
  } else if (messageText === "All Exchanges") {
    await upcomingFuturesMessage(bot, chatId);
  } else if (messageText === "Binance") {
    await upcomingFuturesMessage(bot, chatId, "Binance");
  } else if (messageText === "Bybit") {
    await upcomingFuturesMessage(bot, chatId, "Bybit");
  } else if (messageText === "Mexc") {
    await upcomingFuturesMessage(bot, chatId, "Mexc");
  } else {
    if (messageText !== "/start")
      return bot.sendMessage(
        chatId,
        "Please select an option from the keyboard. or use /start"
      );
  }
});

const sendNewListingsNotification = async () => {
  await sendNewListingsMessage(bot);
};

const notifyUserOfTenMinAlert = async () => {
  await sendTenMinsNewListingsMessage(bot);
};
const notifyUsersOfSignals = async (signals) => {
  await signalAlert(bot, signals);
};

module.exports = {
  setWebhook,
  sendNewListingsNotification,
  notifyUserOfTenMinAlert,
  notifyUsersOfSignals,
};
