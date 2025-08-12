const telegramBot = require("node-telegram-bot-api");
const {
  sendShortSiganl,
  sendLongSiganl,
  upcomingFuturesMessage,
  justListedFuturesMessage,
} = require("./src/controller/botMessages");
const {
  createUserIfNotExists,
  toggleNotification,
  togglereceiveSignals,
  togglereceiveNewListions,
} = require("./src/controller/usersFun");
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

const userContext = {};

//handle messages from the user
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  if (!userContext[chatId]) userContext[chatId] = "main";
  let context = userContext[chatId];

  if (messageText === "Short Signal") {
    //assurance
    bot.sendMessage(chatId, "Analyzing short signal... Please wait.");

    await sendShortSiganl(chatId);

    //ending wink
  }

  //Long area
  if (messageText === "Long Signal") {
    //assurance
    bot.sendMessage(chatId, "Analyzing long signal... Please wait.");

    //fetching long signal
    await sendLongSiganl(chatId);
    //ending wink
  } 

  //New Future
  if (messageText === "New Futures") {
    await justListedFuturesMessage(bot, chatId);
  }

  //Shortable
  if (messageText === "New Futures Shortable") {
    bot.sendMessage(
      chatId,
      "New Futures Shortable functionality is not implemented yet."
    );
  }

  //Upcoming
  if (messageText === "Upcoming Futures") {
    userContext[chatId] = "Upcoming Futures";
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
  }

  //settings area
  if (messageText === "Settings") {
    userContext[chatId] = "Settings";
    const keyBoard = {
      reply_markup: {
        keyboard: [
          ["On/Off Notifications", "On/Off Daily Signal"],
          ["On/Off New Listings N/fication", "Back to Main Menu"],
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
  }

  //When theu click me
  if (messageText === "Created with ❤️ by @solob_dev") {
    bot.sendMessage(
      chatId,
      "Thank you for using our bot! If you have any questions, feel free to ask."
    );
  }

  //Go back
  if (messageText === "Back to Main Menu") {
    const keyBoard = {
      reply_markup: {
        keyboard: [
          ["Short Signal", "Long Signal"],
          ["New Futures", "New Futures Shortable"],
          ["Upcoming Futures", "Settings"],
          ["Created with ❤️ by @solob_dev"],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    };
    bot.sendMessage(chatId, "Returning to the main menu.", keyBoard);
  }

  if (context === "Upcoming Futures") {
    if (messageText === "All Exchanges") {
      await upcomingFuturesMessage(bot, chatId);
    } else if (messageText === "Binance") {
      await upcomingFuturesMessage(bot, chatId, "Binance");
    } else if (messageText === "Bybit") {
      await upcomingFuturesMessage(bot, chatId, "Bybit");
    } else if (messageText === "Mexc") {
      await upcomingFuturesMessage(bot, chatId, "Mexc");
    }
  }

  if (context === "Settings") {
    // Handle settings options
    if (messageText === "On/Off Notifications") {
      const toggled = await toggleNotification(chatId);
      const message =
        toggled === true
          ? "Notifications are now ON. \n You Will Receive All Notification"
          : toggled === false
          ? "Notifications are now OFF. \n You won't receive any notification from this bot"
          : toggled;
      bot.sendMessage(chatId, message);
    } else if (messageText === "On/Off Daily Signal") {
      const toggled = await togglereceiveSignals(chatId);
      const message =
        toggled === true
          ? "Hourly Signal are now ON. \n You Will Receive hourly signal Notification"
          : toggled === false
          ? "Hourly Signal are now OFF. \n You won't receive any signal from this bot"
          : toggled;
      bot.sendMessage(chatId, message);
    } else if (messageText === "On/Off New Listings N/fication") {
      const toggled = await togglereceiveNewListions(chatId);
      const message =
        toggled === true
          ? "Listing Notice are now ON. \n You Will Receive listings notice Notification"
          : toggled === false
          ? "Listings Notice are now OFF. \n You won't receive any Listings notice from this bot"
          : toggled;
      bot.sendMessage(chatId, message);
    }
  }

  if (!context && messageText !== "/start")
    return bot.sendMessage(
      chatId,
      "Please select an option from the keyboard. or use /start"
    );
});

module.exports = {
  bot,
  setWebhook,
};
