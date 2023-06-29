require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const token = process.env.BOOT_URL_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;

const bot = new Telegraf(token);

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

let root = {
  admin: false,
  auth: false,
};

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

bot.launch().then(() => {
  console.log("Bot started");
  setWebhook();
});
