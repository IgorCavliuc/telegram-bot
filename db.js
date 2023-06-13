const { MongoClient } = require("mongodb");

const URL =
  "mongodb+srv://cavliucserv:JZcO7udBUJP2xPxs@bot.idah9gg.mongodb.net";

let dbConnection;

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(URL)
      .then((client) => {
        // console.log(client);
        dbConnection = client.db();
        return cb();
      })
      .catch((err) => {
        return cb(err);
      });
  },
  getDb: () => dbConnection,
};
