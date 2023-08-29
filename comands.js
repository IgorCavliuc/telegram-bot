const moment = require("moment");
const { addTask, getUser, addUser, getSchedule } = require("./db.js");
const { Markup } = require("telegraf");

function sendTaskConfirmation(ctx, task) {
  const message = `Привет всем!
  На неделе от ${task.date} на встрече распорядителями послужат:
  Пульт: ${task.voice_acting}
  Микрофон 1: ${task.first_microphone}
  Микрофон 2: ${task.second_microphone}
  Распорядитель Зал: ${task.steward_hall}`;

  ctx.reply(message);
}

const generateMondayDates = () => {
  const startDate = moment().startOf("isoWeek");
  const endDate = moment().add(2, "months").endOf("isoWeek");

  const dates = [];
  let currentDate = startDate;

  while (currentDate.isBefore(endDate)) {
    const formattedDate = currentDate.format("DD.MM.YYYY");
    dates.push([{ callback_data: formattedDate, text: formattedDate }]);
    currentDate = currentDate.add(1, "week");
  }

  return dates;
};

const dateOptions = Markup.inlineKeyboard(generateMondayDates());

const validateTask = (task) => {
  if (
    task.date &&
    task.voice_acting &&
    task.first_microphone &&
    task.second_microphone &&
    task.steward_hall
  ) {
    return true; // Все поля заполнены
  } else {
    return false; // Не все поля заполнены
  }
};

const validateUser = (user) => {
  if (user.name && user.nickname && user.role) {
    return true; // Все поля заполнены
  } else {
    return false; // Не все поля заполнены
  }
};

const handleAddCommand = async (bot, ctx) => {
  let brotherList = [];

  brotherList = await getUser();

  const getBrotherOptions = () => {
    if (!brotherList || brotherList.length === 0) {
      return {
        reply_markup: JSON.stringify({
          inline_keyboard: [],
        }),
      };
    }

    return {
      reply_markup: JSON.stringify({
        inline_keyboard: brotherList.map((brother) => [
          {
            text: brother.name,
            callback_data: brother.nickname,
          },
        ]),
      }),
    };
  };

  const steps = [
    "Выбери дату:",
    "Выбери брата для службы в озвучке:",
    "Выбери брата для службы на первом микрофоне:",
    "Выбери брата для службы на втором микрофоне:",
    "Выбери брата для службы на службе распорядителя:",
  ];

  let step = 0;
  let task = {};

  const processStep = async (ctx) => {
    if (step === steps.length) {
      if (validateTask(task)) {
        await addTask(task).then((res) => {
          if (res.app_code === "SUCCESS") {
            sendTaskConfirmation(ctx, task);
          }
        });
        task = {
          date: undefined,
          voice_acting: undefined,
          first_microphone: undefined,
          second_microphone: undefined,
          steward_hall: undefined,
        };
        step = 0;
        step = 0;
        return;
      }
    }

    const currentStep = steps[step];

    if (currentStep === "Выбери дату:") {
      ctx.reply(currentStep, dateOptions);
    } else {
      ctx.reply(currentStep, getBrotherOptions());
    }
  };

  const handleCallbackQuery = (ctx) => {
    const answer = ctx.callbackQuery.data;

    const currentStep = steps[step];

    switch (currentStep) {
      case "Выбери дату:":
        task.date = answer;
        break;
      case "Выбери брата для службы в озвучке:":
        task.voice_acting = answer;
        break;
      case "Выбери брата для службы на первом микрофоне:":
        task.first_microphone = answer;
        break;
      case "Выбери брата для службы на втором микрофоне:":
        task.second_microphone = answer;
        break;
      case "Выбери брата для службы на службе распорядителя:":
        task.steward_hall = answer;
        break;
      default:
        break;
    }

    if (answer) {
      step++;
      processStep(ctx);
    }
  };

  const removeCallbackQueryHandler = () => {
    bot.off("callback_query", handleCallbackQuery);
  };

  bot.on("callback_query", handleCallbackQuery);
  bot.on("message", removeCallbackQueryHandler);

  processStep(ctx);
};

const handleAddBroCommand = (bot, ctx) => {
  const steps = [
    "Напиши имя и фамилию брата, которого хочешь добавить:",
    "Напиши телеграм-ник брата, используя вначале символ @, которого хочешь добавить:",
    "Напиши его возможности (в скобках):",
  ];

  let step = 0;
  let user = {};

  const processStep = async (ctx) => {
    if (step === steps.length) {
      if (validateUser(user)) {
        await addUser(user).then((res) => {
          if (res.app_code === "SUCCESS") {
            ctx.reply(
              `Брат ${user.name} был добавлен в общий сипсок братьев доступных для помощи в зале царства`
            );
          }
        });
        user = {};
        step = 0;
        return;
      }
    }

    const currentStep = steps[step];
    ctx.reply(currentStep);
    step++;
  };

  const handleMessage = (ctx) => {
    const answer = ctx.message.text;

    const currentStep = steps[step - 1];

    switch (currentStep) {
      case "Напиши имя и фамилию брата, которого хочешь добавить:":
        user.name = answer;
        break;
      case "Напиши телеграм-ник брата, используя вначале символ @, которого хочешь добавить:":
        user.nickname = answer;
        break;
      case "Напиши его возможности (в скобках):":
        user.role = answer;
        break;
      default:
        break;
    }

    processStep(ctx);
  };

  bot.on("message", handleMessage);

  processStep(ctx);
};
const handleGetSchedule = async (bot, ctx) => {
  try {
    const scheduleList = await getSchedule();

    if (scheduleList.length === 0) {
      ctx.reply("No schedule data found.");
    } else {
      let scheduleText = "Расписание на месяц:\n";
      for (const task of scheduleList) {
        scheduleText += `Неделя от: ${task.date}\n`;
        scheduleText += `Озвучка / пульт: ${task.voice_acting}\n`;
        scheduleText += `Микрофон 1: ${task.first_microphone}\n`;
        scheduleText += `Микрофон 2: ${task.second_microphone}\n`;
        scheduleText += `Распорядитель Зал: ${task.steward_hall}\n\n`;
      }
      ctx.reply(scheduleText);
    }
  } catch (error) {
    console.log("Error retrieving schedule:", error);
    ctx.reply("An error occurred while retrieving the schedule.");
  }
};
const handleGetBrother = async (bot, ctx) => {
  try {
    const userList = await getUser();

    console.log(userList);

    if (userList.length === 0) {
      ctx.reply("No schedule data found.");
    } else {
      let userText = "Список всех братьев\n(Фамилия Имя: его возможности):\n";
      for (const user of userList) {
        userText += `${user.name}: ${user.role}\n`;
      }
      ctx.reply(userText);
    }
  } catch (error) {
    console.log("Error retrieving schedule:", error);
    ctx.reply("An error occurred while retrieving the schedule.");
  }

  // try {
  //   const brotherList = await getUser();

  //   if (brotherList.length === 0) {
  //     ctx.reply("No schedule data found.");
  //   } else {
  //     let userText = "";
  //     for (const brother of brotherList) {
  //       userText += `Вот список всех братьев:\n${brother}`;
  //     }
  //     ctx.reply(userText);
  //     console.log(userText);
  //   }
  // } catch (error) {
  //   console.log("Error retrieving brother list:", error);
  //   // ctx.reply("An error occurred while retrieving the brother list.");
  //   // ctx.reply("An error occurred while retrieving the brother list.");
  // }
};

// bot.launch().then(() => {
//   console.log("Bot started");
// });

module.exports = {
  handleGetSchedule,
  handleAddCommand,
  handleAddBroCommand,
  handleGetBrother,
};
