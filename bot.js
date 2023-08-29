const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const app = express();
app.use(express.json());

const token = process.env.TELEGRAN_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const {
  handleAddCommand,
  handleGetSchedule,
  handleAddBroCommand,
  handleGetBrother,
} = require("./comands.js");

const commands = [
  { command: "/start", description: "Начальное приветствие." },
  { command: "/help", description: "Информация о боте и его свойствах." },
  {
    command: "/list_brothers",
    description: "Список братьев допущенных к обслуживанию.",
  },
  { command: "/addTask", description: "Добавление чего-то." },
  { command: "/addBro", description: "Добавление нового брата в список." },
  {
    command: "/list_schedule",
    description: "Получить весь список на месяц.",
  },
];

const webhookURL = `https://telegram-bot.vercel.app/webhook/${token}`;
bot.setWebHook(webhookURL);

app.post(`/webhook/${token}`, (req, res) => {
  const { message } = req.body;
  res.sendStatus(200);
});

bot.on("text", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    bot.sendMessage(
      chatId,
      `Добро пожаловать, брат ${msg.from.first_name} t.me/JwScheduleBot/JwScheduleBot. `
    );
  }
});

// // Help command handler
// bot.command("help", (ctx) => {
//   ctx.reply(
//     `Брат ${ctx.from.first_name}, эта группа была создана для теста. В будущем она будет помогать братьям организовывать важные части встреч, собрания и других мероприятий.`
//   );
// });

// // Custom command handlers
// bot.command("add_task", (ctx) => {
//   handleAddCommand(bot, ctx);
// });

// bot.command("add_bro", (ctx) => {
//   handleAddBroCommand(bot, ctx);
// });

// bot.command("list_schedule", (ctx) => {
//   handleGetSchedule(bot, ctx);
// });

// bot.command("list_brothers", (ctx) => {
//   handleGetBrother(bot, ctx);
// });

// Start the bot
// Start the bot by initiating polling
bot.startPolling().then(() => {
  console.log("Bot started");

  // Set bot commands
  bot.setMyCommands(commands);
});
