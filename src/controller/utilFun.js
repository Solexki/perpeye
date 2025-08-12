function excapeMarkupV2(text) {
  return text.replace(/_/g, "\\_");
}

const safeMessage = (chatId, message) => {
  const { bot } = require("../../bot");
  try {
    bot?.sendMessage(chatId, message, {
      parse_mode: "Markdown",
    });
  } catch (error) {
    if (error.response && error.response.statusCode === 403) {
      console.error(`User blocked the bot.`);
    } else {
      console.error(`Unexpected error for user ${chatId}:`, error.message);
    }
  }
};

module.exports = {
  excapeMarkupV2,
  safeMessage,
};
