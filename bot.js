const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf("6180471150:AAECNhrvGQfnPQtbg6zWI7Qh2Qq52kvz3OQ");

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

const webhookURL =
  "https://telegram-bot.vercel.app/webhook/6180471150:AAECNhrvGQfnPQtbg6zWI7Qh2Qq52kvz3OQ";
bot.setWebHook(webhookURL);

app.post(`/webhook/${token}`, (req, res) => {
  const { message } = req.body;
  // Handle the incoming message
  // You can use bot.sendMessage() to send a reply
  // Example: bot.sendMessage(message.chat.id, 'Hello from your bot!');
  res.sendStatus(200);
});

bot.start((ctx) => {
  ctx.reply(`Добро пожаловать, брат ${ctx.from.first_name}`);
});

bot.help((ctx) => {
  ctx.reply(
    `Брат ${ctx.from.first_name}, эта группа была создана для теста. В будущем она будет помогать братьям организовывать важные части встреч, собрания и других мероприятий.`
  );
});

bot.command("add_task", (ctx) => {
  handleAddCommand(bot, ctx);
});

bot.command("add_bro", (ctx) => {
  handleAddBroCommand(bot, ctx);
});
bot.command("list_schedule", (ctx) => {
  handleGetSchedule(bot, ctx);
});
bot.command("list_brothers", (ctx) => {
  handleGetBrother(bot, ctx);
});

bot.launch().then(() => {
  console.log("Bot started");
  bot.telegram.setMyCommands(commands);
});
