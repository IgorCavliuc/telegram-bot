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
const webhookUrl = process.env.WEBHOOK_URL;

const bot = new Telegraf(token);

async function setWebhook() {
  try {
    const result = await bot.telegram.setWebhook(webhookUrl);
    console.log("Webhook was set successfully:", result);
  } catch (error) {
    console.error("Error setting up webhook:", error);
  }
}

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

  if (root.auth) {
    handleStartCommand(bot, ctx, root);
  } else {
    handleStartCommand(bot, ctx, root, ctx.from.first_name);
  }
});

bot.help((ctx) => {
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

bot.command("add_bro", (ctx) => {
  const root = {
    auth: dataUser.length !== 0,
    admin: dataUser[0]?.admin,
  };

  handleAddBroCommandAdmin(bot, ctx, root, ctx.from.first_name);
});

bot.command("list_schedule", (ctx) => {
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

bot.command("list_brothers", (ctx) => {
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
  setWebhook();
});
