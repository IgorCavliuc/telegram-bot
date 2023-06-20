const { MongoClient } = require("mongodb");

const url =
  "mongodb+srv://cavliucserv:Te9MhRzgLZ2ZvYK3@bot.idah9gg.mongodb.net/?retryWrites=true&w=majority";
const dbName = "schedule";

let db;
let client; // Add this line to store the MongoDB client

const connectToDb = async () => {
  client = new MongoClient(url);
  try {
    // Connect to the MongoDB server
    await client.connect();

    // Access the database
    db = client.db(dbName);
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
    const collection = db.collection("scheduleJw");

    await collection.insertOne(task);
    return { app_code: "SUCCESS" };
  } finally {
    await client.close();
  }
}

async function getSchedule() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("scheduleJw");
    const scheduleList = collection.find().toArray();
    return scheduleList;
  } catch (error) {
    console.log("Error retrieving schedule:", error);
    return [];
  }
}
const addUser = async (user) => {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("user");

    await collection.insertOne(user);
    return { app_code: "SUCCESS" };
  } finally {
    await client.close();
  }
};
async function getUser() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("user");
    const scheduleList = collection.find().toArray();
    return scheduleList;
  } catch (error) {
    console.log("Error retrieving schedule:", error);
    return [];
  }
}

// Add other database operations (getUser, addUser, getSchedule) here...

module.exports = { connectToDb, addTask, addUser, getUser, getSchedule };
