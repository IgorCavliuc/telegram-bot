require("dotenv").config();
const express = require("express");
const { Telegraf } = require("telegraf");
const {
  handleAddCommand,
  handleGetSchedule,
  handleAddBroCommand,
  handleGetBrother,
  handleStartCommand,
  handleHelpCommand,
  handleAddCommandAdmin,
  handleAddBroCommandAdmin,
} = require("./comands.js");
const { getUser, updateUser } = require("./db.js");

const token = process.env.BOOT_URL_TOKEN;
const bot = new Telegraf(token);

const app = express();

// Telegram webhook endpoint
app.use(bot.webhookCallback("/webhook"));

let root = {
  admin: false,
  auth: false,
};

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

bot.start(async (ctx) => {
  const userId = ctx.from?.id;
  const userName = "@" + ctx.from?.username;
  await updateUser(userName, userId);

  const brotherList = await getUser();

  const dataUser = brotherList.filter(
    (bro) => bro.nickname.split("@")[1] === ctx.from.username
  );

  root = {
    auth: dataUser.length !== 0,
    admin: dataUser[0]?.admin,
  };

  root.auth
    ? handleStartCommand(bot, ctx, root)
    : handleStartCommand(bot, ctx, root, ctx.from.first_name);

  // const users = brotherList.filter((user) => typeof user?.user_id === "number");

  // Function to send a message to each user
});

bot.help((ctx) => {
  root.auth
    ? handleHelpCommand(bot, ctx, root)
    : handleHelpCommand(bot, ctx, root, ctx.from.first_name);
});

bot.command("add_task", (ctx) => {
  // root?.admin
  // ?
  handleAddCommand(bot, ctx);
  // : ctx.reply(
  //     `Брат ${ctx.from.first_name}, у тебя нет доступа к этой команде, если ты хочешь добавить/изменить/удалить график, пожалуйста обратись к назначеному брату`
  //   );
});

bot.command("add_bro", (ctx) => {
  handleAddBroCommandAdmin(bot, ctx, root, ctx.from.first_name);
});
bot.command("list_schedule", (ctx) => {
  root?.auth
    ? handleGetSchedule(bot, ctx)
    : ctx.reply(
        `${ctx.from.first_name}, у тебя нет доступа к этой команде, если ты хочешь просмотреть данные этой команды, пожалуйста обратись к назначеному брату`
      );
});
bot.command("list_brothers", (ctx) => {
  root?.auth
    ? handleGetBrother(bot, ctx)
    : ctx.reply(
        `${ctx.from.first_name}, у тебя нет доступа к этой команде, если ты хочешь просмотреть данные этой команды, пожалуйста обратись к назначеному брату`
      );
});

bot.telegram.setMyCommands(commands);

// Start the bot
bot.launch();

// Set the webhook
bot.telegram.setWebhook("https://telegram-bot-ashy-three.vercel.app");

// Handle incoming updates via webhook
app.post("/webhook", express.json(), (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Start the express server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
