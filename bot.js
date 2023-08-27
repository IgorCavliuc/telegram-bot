require("dotenv").config();
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

const token = process.env.TELEGRAN_BOT_TOKEN;

const bot = new Telegraf(token);

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

app.post("/telegram-webhook", (req, res) => {
  // Обработка запросов от Telegram бота
  res.json({ message: "Received" });
});

// Запуск Express.js сервера
app.listen(process.env.PORT || 3000, () => {
  console.log("Express server is listening...");
});

// Ваш код для обработки команд и взаимодействия с ботом

const commands = [
  { command: "/start", description: "Начальное приветствие." },
  { command: "/help", description: "Информация о боте и его свойствах." },
  {
    command: "/list_brothers",
    description: "Список братьев допущенных к обслуживанию.",
  },
  { command: "/add_task", description: "Добавление чего-то." },
  { command: "/add_bro", description: "Добавление нового брата в список." },
  {
    command: "/list_schedule",
    description: "Получить весь список на месяц.",
  },
];

bot.start(async (ctx) => {
  const userId = ctx.from?.id;
  const userName = "@" + ctx.from?.username;

  const keyboard = {
    reply_markup: {
      keyboard: commands.map((command) => [{ text: command.command }]),
      one_time_keyboard: true,
    },
  };

  await updateUser(userName, userId);

  const brotherList = await getUser();

  const dataUser = brotherList.filter(
    (bro) => bro.nickname.split("@")[1] === ctx.from.username
  );

  const root = {
    auth: dataUser.length !== 0,
    admin: dataUser[0]?.admin,
  };

  ctx.reply(
    `Привет ${ctx.from.first_name}! http://t.me/JWscheduleBot/JwScheduleBot`
  );
});

bot.help(async (ctx) => {
  const brotherList = await getUser();

  const dataUser = brotherList.filter(
    (bro) => bro.nickname.split("@")[1] === ctx.from.username
  );

  const root = {
    auth: dataUser.length !== 0,
    admin: dataUser[0]?.admin,
  };

  if (root.auth) {
    handleHelpCommand(bot, ctx, root);
  } else {
    handleHelpCommand(bot, ctx, root, ctx.from.first_name);
  }
});

bot.command("add_task", (ctx) => {
  handleAddCommand(bot, ctx);
});

bot.command("add_bro", async (ctx) => {
  const brotherList = await getUser();

  const dataUser = brotherList.filter(
    (bro) => bro.nickname.split("@")[1] === ctx.from.username
  );

  const root = {
    auth: dataUser.length !== 0,
    admin: dataUser[0]?.admin,
  };

  handleAddBroCommandAdmin(bot, ctx, root, ctx.from.first_name);
});

bot.command("list_schedule", async (ctx) => {
  const brotherList = await getUser();

  const dataUser = brotherList.filter(
    (bro) => bro.nickname.split("@")[1] === ctx.from.username
  );

  const root = {
    auth: dataUser.length !== 0,
    admin: dataUser[0]?.admin,
  };

  if (root.auth) {
    handleGetSchedule(bot, ctx);
  } else {
    ctx.reply(
      `${ctx.from.first_name}, у тебя нет доступа к этой команде, если ты хочешь просмотреть данные этой команды, пожалуйста обратись к назначеному брату`
    );
  }
});

bot.command("list_brothers", async (ctx) => {
  const brotherList = await getUser();

  const dataUser = brotherList.filter(
    (bro) => bro.nickname.split("@")[1] === ctx.from.username
  );

  const root = {
    auth: dataUser.length !== 0,
    admin: dataUser[0]?.admin,
  };

  if (root.auth) {
    handleGetBrother(bot, ctx);
  } else {
    ctx.reply(
      `${ctx.from.first_name}, у тебя нет доступа к этой команде, если ты хочешь просмотреть данные этой команды, пожалуйста обратись к назначеному брату`
    );
  }
});

bot.launch().then(() => {
  console.log("Bot started");
});
