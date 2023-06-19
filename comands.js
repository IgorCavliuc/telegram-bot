const moment = require("moment");
const { addTask, getUser } = require("./db.js");
const { Markup } = require('telegraf');

function sendTaskConfirmation(ctx, task) {
  const message = `Привет всем!
  На неделе от ${task.date} на встрече распорядителями послужат:
  Пульт: ${task.voice_acting}
  Микрофон 1: ${task.first_microphone}
  Микрофон 2: ${task.second_microphone}
  Распорядитель Зал: ${task.steward_hall}

  Если у тебя нет возможности послужить, прошу, предупреди об этом заранее!`;

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

let brotherList = [];

async function fetchBrotherList() {
  brotherList = await getUser();
}

fetchBrotherList();


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

const handleAddCommand = (bot, ctx) => {
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
        resetTask();
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

  const resetTask = () => {
    task = {
      date: undefined,
      voice_acting: undefined,
      first_microphone: undefined,
      second_microphone: undefined,
      steward_hall: undefined,
    };
    step = 0;
  };

  const removeCallbackQueryHandler = () => {
    bot.off("callback_query", handleCallbackQuery);
  };

  bot.on("callback_query", handleCallbackQuery);
  bot.on("message", removeCallbackQueryHandler);

  processStep(ctx);
};

module.exports = handleAddCommand;
