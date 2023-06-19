const { Telegraf } = require("telegraf");

const bot = new Telegraf("6111431374:AAHSRoUJvAjWoNvCoZBtJPw0rKDSr4_pW3o");

const handleAddCommand = require('./comands.js')

bot.start((ctx) => {
  ctx.reply(`Добро пожаловать, брат ${ctx.from.first_name}`);
});

bot.help((ctx) => {
  ctx.reply(`Брат ${ctx.from.first_name}, эта группа была создана для теста. В будущем она будет помогать братьям организовывать важные части встреч, собрания и других мероприятий.`);
});

bot.command("addTask", (ctx) => {

    handleAddCommand(bot,ctx)

    console.log(ctx)
});

bot.launch().then(() => {
  console.log("Bot started");
});

// Helper function to validate the task
function validateTask(task) {
  return (
      task.date &&
      task.voice_acting &&
      task.first_microphone &&
      task.second_microphone &&
      task.steward_hall
  );
}

// Helper function to add the task
function addTask(task) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Task added:", task);
      resolve();
    }, 1000);
  });
}

