const moment = require("moment");

// const dateOptions = {
//   reply_markup: JSON.stringify({
//     inline_keyboard: [
//       [{ callback_data: "12.12", text: "12.12" }],
//       [{ callback_data: "13.13", text: "13.13" }],
//       [{ callback_data: "14.14", text: "14.14" }],
//     ],
//   }),
// };

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

const dateOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: generateMondayDates(),
  }),
};

let brotherList ;

addUser().then((res) => {
  brotherList = res;
});

const getBrotherOptions = () => {
  return {
    reply_markup: JSON.stringify({
      inline_keyboard: brotherList.map((brother) => [
        {
          callback_data: brother.name,
          text: brother.nickname,
          role: brother.role,
        },
      ]),
    }),
  };
};
const handleAddCommand = (chatId) => {
  const task = { chatId };
  let step = 0;

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
};

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

// const userData = {};

const handleAddBroCommand = (chatId) => {
  const user = { chatId };
  let step = 0;

  const steps = [
    { text: "Напиши имя и фамилию брата, которого хочешь добавить:" },
    {
      text: "Напиши телеграм-ник брата, используя вначале символ @, которого хочешь добавить:",
    },
    {
      text: "Напиши его возможности (в скобках):",
    },
  ];

  const userAddStep = () => {
    if (step >= steps.length) {
      if (user.name && user.nickname && user.role) {
        addUser(user)
          .then((res) => {
            console.log(res);
            bot.sendMessage(chatId, "Брат успешно добавлен в список.");
          })
          .catch((error) => {
            console.error(error);
            bot.sendMessage(chatId, "Произошла ошибка при добавлении брата.");
          });
        return;
      }
    }

    const currentStep = steps[step];
    bot.sendMessage(chatId, currentStep.text);
    step++;
  };

  const handleMessage = (msg) => {
    const text = msg.text;
    console.log("Text", text);

    switch (step - 1) {
      case 0:
        user.name = text;
        break;
      case 1:
        user.nickname = text;
        break;
      case 2:
        user.role = text;
        break;
    }

    userAddStep();
  };

  bot.on("message", handleMessage);
  userAddStep();
};

// Function to handle the "/add_bro" command
const handleAddBrotherCommand = (chatId) => {
  const user = { chatId };
  let step = 0;

  const steps = [
    { text: "Напиши имя и фамилию брата, которого хочешь добавить:" },
    {
      text: "Напиши телеграм-ник брата, используя вначале символ @, которого хочешь добавить:",
    },
    {
      text: "Напиши его возможности (в скобках):",
    },
  ];

  const userAddStep = () => {
    if (step >= steps.length) {
      if (user.name && user.nickname && user.role) {
        addUser(user)
          .then((res) => {
            console.log(res);
            bot.sendMessage(chatId, "Брат успешно добавлен в список.");
          })
          .catch((error) => {
            console.error(error);
            bot.sendMessage(chatId, "Произошла ошибка при добавлении брата.");
          });
        return;
      }
    }

    const currentStep = steps[step];
    bot.sendMessage(chatId, currentStep.text);
    step++;
  };

  const handleMessage = (msg) => {
    const text = msg.text;
    console.log("Text", text);

    switch (step - 1) {
      case 0:
        user.name = text;
        break;
      case 1:
        user.nickname = text;
        break;
      case 2:
        user.role = text;
        break;
    }

    userAddStep();
  };

  bot.on("message", handleMessage);
  userAddStep();
};

module.exports = {
  handleAddCommand,
  handleGetSchedule,
  handleAddBroCommand,
};
