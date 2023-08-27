const moment = require("moment");
const { addTask, getUser, addUser, getSchedule } = require("./db.js");
const { Markup } = require("telegraf");
const schedule = require("node-schedule");

function sendTaskConfirmation(ctx, task) {
  const message = `Запись была внесена в список запланированных задач!
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
  if (
    (user.name && user.nickname) ||
    user.admin ||
    user.microphone ||
    user.voice_acting ||
    user.manager
  ) {
    return true; // Все поля заполнены
  } else {
    return false; // Не все поля заполнены
  }
};

function handleStartCommand(bot, ctx, root, firstName) {
  root.auth
    ? ctx.reply(
        `Добро пожаловать, брат ${ctx.from.first_name}, Вот ссылка для работы с графиком http://t.me/JWscheduleBot/JwScheduleBot`
      )
    : ctx.reply(
        `${firstName},  у тебя нет доступа к этой команде, если ты хочешь просмотреть данные этой команды, пожалуйста обратись к назначеному брату`
      );
}

function handleHelpCommand(bot, ctx, root, firstName) {
  root.auth
    ? ctx.reply(
        `Брат ${ctx.from.first_name}, эта группа была создана для облегчения организации руботы в службе озвучиания, службы с микрофоном и в службе распорядителей. Телеграм бот сможет создавать график слуюбы, добавлять новых братьев в общий список и давать им разные возможности, доступные в собрании а так же можно  смотреть список всех братьев и общий график. И что важнее всего он имеет функию заблаговременого напоминания о том где, кто и когда учавтвует в той или иной службе.`
      )
    : ctx.reply(
        `${firstName}, обратись пожалуйста к назначеному брату для инфоормациии и получения доступа`
      );
}
function handleAddCommandAdmin(bot, ctx, root, firstName) {
  root.admin
    ? handleAddCommand(bot, ctx)
    : ctx.reply(
        `Брат ${firstName}, у тебя нет доступа к этой команде, если ты хочешь добавить/изменить/удалить график, пожалуйста обратись к назначеному брату`
      );
}
function handleAddBroCommandAdmin(bot, ctx, root, firstName) {
  root.admin
    ? handleAddBroCommand(bot, ctx)
    : ctx.reply(
        `Брат ${firstName}, у тебя нет доступа к этой команде, если ты хочешь добавить/изменить/удалить данные о брате, пожалуйста обратись к назначеному брату`
      );
}

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
  const filteredUsers = brotherList
    .filter((user) => typeof user.user_id === "number")
    .map((id) => id.user_id);

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
            // const rule = new schedule.RecurrenceRule();
            // rule.dayOfWeek = [1, 5];
            // rule.hour = 10;
            // rule.minute = 0;

            // const inputDate = `${task?.date} 10:00`;
            const inputDate = `25.06.2023 13:15`;
            const parts = inputDate.split(" ");
            const dateParts = parts[0].split(".");
            const timeParts = parts[1].split(":");
            const formattedDate = new Date(
              dateParts[2],
              dateParts[1] - 1,
              dateParts[0],
              timeParts[0],
              timeParts[1]
            );

            const nextDate = new Date(formattedDate);
            nextDate.setMinutes(nextDate.getDate() + 4);

            function sendToAllUsers(message) {
              filteredUsers.forEach((userId) => {
                schedule.scheduleJob(formattedDate, () => {
                  bot.telegram
                    .sendMessage(userId, message)
                    .then(() => {
                      console.log(`Message sent to user ${userId}`);
                    })
                    .catch((error) => {
                      console.error(
                        `Error sending message to user ${userId}:`,
                        error
                      );
                    });
                });
              });
            }
            const message = `Привет всем!
            На неделе от ${task.date} на встрече собрания, распорядителями послужат:
            Пульт: ${task.voice_acting}
            Микрофон 1: ${task.first_microphone}
            Микрофон 2: ${task.second_microphone}
            Распорядитель Зал: ${task.steward_hall}
            Если у тебя нет возможности послужить, прошу, предупреди об этом заранее!`;
            sendToAllUsers(message);

            // schedule.scheduleJob(formattedDate, () => {
            //   sendScheduleTaskConfirmation(ctx, task);
            // });

            // schedule.scheduleJob(nextDate, () => {
            //   sendScheduleTaskConfirmation(ctx, task);
            // });
          }
        });
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
    "Является ли этот брат Администратором и может ли он добавлять/изменять/удалять график?",
    "Может ли этот брат служить с микрофоном?",
    "Может ли этот брат служить в службе озвучивания?",
    "Может ли этот брат служить в службе распорядителей?",
  ];

  let step = 0;
  let user = {};

  const TrueFalse = () => ({
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "ДА",
            callback_data: "true",
          },
          {
            text: "НЕТ",
            callback_data: "false",
          },
        ],
      ],
    },
  });

  const processStep = async () => {
    if (step >= steps.length) {
      if (validateUser(user)) {
        const res = await addUser(user);
        if (res.app_code === "SUCCESS") {
          ctx.reply(
            `Брат ${user.name} был добавлен в общий список братьев, доступных для помощи в зале царства`
          );
        }
      }

      user = {};
      step = 0;
      return;
    }

    const currentStep = steps[step];

    if (currentStep && currentStep.trim() !== "") {
      if (
        [
          `Является ли этот брат Администратором и может ли он добавлять/изменять/удалять график?`,
          `Может ли этот брат служить с микрофоном?`,
          `Может ли этот брат служить в службе озвучивания?`,
          `Может ли этот брат служить в службе распорядителей?`,
        ].includes(currentStep)
      ) {
        ctx.reply(currentStep, TrueFalse());
      } else {
        ctx.reply(currentStep);
      }
    }

    return;
  };

  const handleMessage = (ctx) => {
    const answer = ctx.message.text;

    const currentStep = steps[step];

    switch (currentStep) {
      case "Напиши имя и фамилию брата, которого хочешь добавить:":
        user.name = answer;
        break;
      case "Напиши телеграм-ник брата, используя вначале символ @, которого хочешь добавить:":
        user.nickname = answer;
        user.user_id = getUserIdByUsername(answer);
        break;
      // case "Является ли этот брат Администратором и может ли он добавлять/изменять/удалять график?":
      //   user.admin = answerBoolean;
      //   break;
      // case "Может ли этот брат служить с микрофоном?":
      //   user.microphone = answerBoolean;
      //   break;
      // case "Может ли этот брат служить в службе озвучивания?":
      //   user.voice_acting = answerBoolean;
      //   break;
      // case "Может ли этот брат служить в службе распорядителей?":
      //   user.manager = answerBoolean;
      //   break;
      default:
        break;
    }

    step++;
    processStep();
  };

  bot.on("message", handleMessage);

  bot.action(["true", "false"], (ctx) => {
    const currentStep = steps[step];
    const answerBoolean = ctx.callbackQuery.data === "true";

    switch (currentStep) {
      case "Является ли этот брат Администратором и может ли он добавлять/изменять/удалять график?":
        user.admin = answerBoolean;
        break;
      case "Может ли этот брат служить с микрофоном?":
        user.microphone = answerBoolean;
        break;
      case "Может ли этот брат служить в службе озвучивания?":
        user.voice_acting = answerBoolean;
        break;
      case "Может ли этот брат служить в службе распорядителей?":
        user.manager = answerBoolean;
        break;
      default:
        break;
    }

    step++;
    processStep();
  });

  processStep();
};

const handleGetSchedule = async (bot, ctx) => {
  try {
    const scheduleList = await getSchedule();

    if (scheduleList.length === 0) {
      ctx.reply("График пока пуст.");
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

    if (userList.length === 0) {
      ctx.reply("Список братьев пуст.");
    } else {
      let userText = "Список всех братьев\n(Фамилия Имя: его возможности):\n";
      for (const user of userList) {
        userText += `${user.name}: (${user.microphone ? "Микрофон, " : ""}${
          user.manager ? "Распорядитель, " : ""
        }${user.voice_acting ? "Аппаратура" : ""})\n`;
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
  handleStartCommand,
  handleHelpCommand,
  handleAddCommandAdmin,
  handleAddBroCommandAdmin,
};
