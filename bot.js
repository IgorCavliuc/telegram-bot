const token = process.env.TOKEN;
const moment = require("moment");

const { MongoClient } = require("mongodb");
const TelegramApi = require("node-telegram-bot-api");

const mongoUrl = process.env.MONGO_URL;

const dbName = process.env.DB_NAME;

const client = new MongoClient(mongoUrl);
const bot = new TelegramApi(token, { polling: true });

// Command definitions
const commands = [
  { command: "/start", description: "Начальное приветствие." },
  { command: "/info", description: "Информация о боте и его свойствах." },
  {
    command: "/listbrothers",
    description: "Список братьев допущенных к обслуживанию.",
  },
  { command: "/add", description: "Добавление чего-то." },
  { command: "/add_bro", description: "Добавление нового брата в список." },
  {
    command: "/list_schedule",
    description: "Получить весь список на месяц.",
  },
];

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

// Function to add a task to the database
const addTask = async (task) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("scheduleJw");
    await collection.insertOne(task);
  } catch (error) {
    console.log("Error adding task:", error);
  } finally {
    await client.close();
  }
};
const getSchedule = async () => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("scheduleJw");
    const scheduleList = await collection.find().toArray();
    return scheduleList;
  } catch (error) {
    console.log("Error retrieving schedule:", error);
    return [];
  } finally {
    await client.close();
  }
};

const getUser = async () => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("user");
    const scheduleList = await collection.find().toArray();
    return scheduleList;
  } catch (error) {
    console.log("Error retrieving user:", error);
    return [];
  } finally {
    await client.close();
  }
};

let brotherList;

getUser().then((res) => {
  brotherList = res;
});
// Inline keyboard options for brother selection
// const brotherList = [
//   {
//     callback_data: "@cavliman",
//     text: "Cavliuc Igor",
//     role: "Распорядитель, Микрофон",
//   },
//   { callback_data: "@bellylollipop", text: "Radionov Igor", role: "Микрофон" },
//   {
//     callback_data: "@your_pixel",
//     text: "Fleanku Yaroslav",
//     role: "Аппаратура, Микрофон",
//   },
//   {
//     callback_data: "@rosin_rusanovschi",
//     text: "Rusanivsci Rosin",
//     role: "Распорядитель, Микрофон, Аппаратура",
//   },
// ];

// Inline keyboard options for brother selection
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

// Function to handle the "/add" command
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

  const userAddStep = () => {
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

// Set the bot commands
bot.setMyCommands(commands);

// Connect to the database and start the bot
const connectToDb = () => {
  client
    .connect()
    .then(() => {
      console.log("Connected to MongoDB");
      console.log("Bot started");
    })
    .catch((err) => {
      console.log("Error connecting to MongoDB:", err);
    });
};

connectToDb();
