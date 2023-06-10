const TelegramApi = require("node-telegram-bot-api");

const token = "6142606509:AAEFxS4Fvwgnvy2QEVWS8lPYuwYmlv1ZiqQ";

const bot = new TelegramApi(token, { polling: true });

bot.setMyCommands([
  { command: "/start", description: "Начальное приветсвие." },
  { command: "/info", description: "Информация о боте и его свойствах." },
]);

bot.on("message", (msg) => {
  const text = msg?.text;
  const chatId = msg.chat.id;

  if (text === "/start") {
    bot.sendMessage(
      chatId,
      `Приветсвую дорогой брат ${msg.from.first_name}! Рад что ты присоеденился к нам.`
    );
  }
  if (text === "/info") {
    bot.sendMessage(
      chatId,
      `Брат ${msg.from.first_name}, эта группа была создана для теста, в будущем она будет помогать братьям организовывать важные части встреч собрания и других мероприятий`
    );
  }
});
