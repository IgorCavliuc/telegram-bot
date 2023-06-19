const { MongoClient } = require("mongodb");

const url =
    "mongodb+srv://cavliucserv:Te9MhRzgLZ2ZvYK3@bot.idah9gg.mongodb.net/?retryWrites=true&w=majority";
const dbName = "schedule";

let bot;
let client; // Add this line to store the MongoDB client

const connectToDb = async () => {
  client = new MongoClient(url);
  try {
    // Connect to the MongoDB server
    await client.connect();

    // Access the database
    bot = client.db(dbName);
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

async function addTask(task) {
  const client = new MongoClient(url);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('scheduleJw');

    await collection.insertOne(task);
    return {app_code:'SUCCESS'};
  } finally {
    await client.close();
  }
}
const addUser = async (user) => {
  try {
    const collection = bot.collection("user");
    await collection.insertOne(user);
    console.log("user added:", user);
  } catch (error) {
    console.log("Error adding user:", error);
  }
};
const getUser = async () => {
  let client; // Declare the client variable within the function scope

  try {
    client = new MongoClient(url); // Initialize the MongoDB client
    await client.connect(); // Connect to the MongoDB server

    const db = client.db(dbName); // Access the database
    const collection = db.collection("user");
    const userList = await collection.find().toArray();
    return userList;
  } catch (error) {
    console.log("Error retrieving user:", error);
    return [];
  } finally {
    if (client) {
      await client.close(); // Close the client connection
    }
  }
};

// Add other database operations (getUser, addUser, getSchedule) here...

module.exports = { connectToDb, addTask,  addUser, getUser,/* getSchedule */ };
