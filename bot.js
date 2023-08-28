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
    `Привет брат ${ctx.from.first_name}! http://t.me/JWscheduleBot/JwScheduleBot`
  );
});

bot.help(async (ctx) => {
  const brotherList = await getUser();

  const dataUser = brotherList.filter(
    (bro) => bro.nickname.split("@")[1] === ctx.from.username
  );

  const steps = [
    { text: "Выбери дату:" },
    { text: "Выбери брата для службы в озвучке:" },
    { text: "Выбери брата для службы на первом микрофоне:" },
    { text: "Выбери брата для службы на втором микрофоне:" },
    { text: "Выбери брата для службы на службе распорядителя:" },
  ];

  const processStep = () => {
    if (step >= steps.length) {
      if (
        task.date &&
        task.voice_acting &&
        task.first_microphone &&
        task.second_microphone &&
        task.steward_hall
      ) {
        bot.off("callback_query", handleCallbackQuery); // Remove the event listener
        addTask(task);
        bot.sendMessage(
          chatId,
          `Привет всем!
          На неделе от ${task.date} на встрече распорядителями послужат:
          Пульт: ${task.voice_acting}
          Микрофон 1: ${task.first_microphone}
          Микрофон 2: ${task.second_microphone}
          Распорядитель Зал: ${task.steward_hall}

          Если у тебя нет возможности послужить, прошу, предупреди об этом заранее!`
        );
      } else {
        bot.sendMessage(chatId, "Выбери все необходимые опции.");
      }

      // Reset the task object
      // task.date = undefined;
      // task.voice_acting = undefined;
      // task.first_microphone = undefined;
      // task.second_microphone = undefined;
      // task.steward_hall = undefined;
      step = 0;
      return;
    }

    console.log("brotherOptions", brotherOptions);

    const currentStep = steps[step];
    if (currentStep.text === "Выбери дату:") {
      bot.sendMessage(chatId, currentStep.text, dateOptions);
      step++;
    } else {
      bot.sendMessage(chatId, currentStep.text, brotherOptions);
      step++;
    }
  };

  const handleCallbackQuery = (msg) => {
    const selectedBrother = msg.data;

    switch (step - 1) {
      case 0:
        task.date = selectedBrother;
        break;
      case 1:
        task.voice_acting = selectedBrother;
        break;
      case 2:
        task.first_microphone = selectedBrother;
        break;
      case 3:
        task.second_microphone = selectedBrother;
        break;
      case 4:
        task.steward_hall = selectedBrother;
        break;
    }

    processStep();
  };

  bot.on("callback_query", handleCallbackQuery);

  processStep();
}
)


const handleGetSchedule = (chatId) => {
  bot.onText(/\/list_schedule/, async (msg) => {
    try {
      const scheduleList = await getSchedule();

      if (scheduleList.length === 0) {
        bot.sendMessage(chatId, "No schedule data found.");
      } else {
        let scheduleText = "Расписание на месяц:\n";
        for (const task of scheduleList) {
          scheduleText += `Неделя от: ${task.date}\n`;
          scheduleText += `Озвучка / пульт: ${task.voice_acting}\n`;
          scheduleText += `Микрофон 1: ${task.first_microphone}\n`;
          scheduleText += `Микрофон 2: ${task.second_microphone}\n`;
          scheduleText += `Распорядитель Зал: ${task.steward_hall}\n\n`;
        }

        bot.sendMessage(chatId, scheduleText);
      }
    } catch (error) {
      console.log("Error retrieving schedule:", error);
      bot.sendMessage(
        chatId,
        "An error occurred while retrieving the schedule."
      );
    }
  });
};

// Function to handle the "/add_bro" command
// Function to handle the "/add_bro" command
const handleAddBroCommand = (chatId) => {
  const user = { chatId };
  let step = 0;

  const steps = [
    { text: "Напиши имя и фамилию брата, которого хочешь добавить:" },
    {
      text: "Напиши телеграм-ник брата используя вначале символ @, которого хочешь добавить:",
    },
    {
      text: "Напиши его возможности (в скобках):",
    },
  ];

  const userAddStep = () => {ы
    if (step >= steps.length) {
      if (user.name && user.nickname && user.role) {
        getUser(user);
        // Add logic to save the user to the database or perform any other desired action
        bot.sendMessage(chatId, "Брат успешно добавлен в список.");
        return;
      }
    }

    const currentStep = steps[step];
    bot.sendMessage(chatId, currentStep.text);
    step++;
  };

  bot.on("message", (msg) => {
    const text = msg.text;

    switch (step - 1) {
      case 0:
        user.name = text;
        break;
      case 1:
        user.nickname = text;
      case 2:
        user.role = text;
        break;
    }

    userAddStep();
  });

  userAddStep();
};

// Event listener for message commands
bot.onText(/\/\w+/, (msg) => {
  const chatId = msg.chat.id;
  const command = msg.text;

  switch (command) {
    case "/start":
      bot.sendMessage(
        chatId,
        `Приветсвую дорогой брат ${msg.from.first_name}! Рад что ты присоединился к нам.`
      );
      break;
    case "/info":
      bot.sendMessage(
        chatId,
        `Брат ${msg.from.first_name}, эта группа была создана для теста, в будущем она будет помогать братьям организовывать важные части встреч собрания и других мероприятий`
      );
      break;
    case "/listbrothers":
      console.log(brotherList);
      const brothers = brotherList
        ?.map((item) => `${item.name} ${item.role}`)
        .join("\n");
      bot.sendMessage(chatId, `Вот список всех братьев:\n${brothers}`);
      break;
    case "/add":
      handleAddCommand(chatId);
      break;
    case "/add_bro":
      handleAddBroCommand(chatId);
      break;
    case "/list_schedule":
      handleGetSchedule(chatId);

      break;
    default:
      break;
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
