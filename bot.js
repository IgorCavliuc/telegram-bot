const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf("6111431374:AAHSRoUJvAjWoNvCoZBtJPw0rKDSr4_pW3o");

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
