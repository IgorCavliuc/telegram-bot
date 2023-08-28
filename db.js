<<<<<<< HEAD
let db;

const getDb = (database) => {
  db = database;
=======
require("dotenv").config();
const { MongoClient } = require("mongodb");

const url = process.env.BOOT_URL_MONGODB;
const dbName = "schedule";

let db;
let client;

const connectToDb = async () => {
  client = new MongoClient(url);
  try {
    await client.connect();
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

const updateUser = async (nickname, user_id) => {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("user");

    await collection.updateOne(
      { nickname: nickname },
      { $set: { user_id: user_id } }
    );
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

module.exports = {
  connectToDb,
  addTask,
  addUser,
  getUser,
  getSchedule,
  updateUser,
>>>>>>> ece11a84961e16d4d241ddc0df5be6df27862245
};

const addTask = async (task) => {
  try {
    const collection = db.collection("scheduleJw");
    await collection.insertOne(task);
  } catch (error) {
    console.log("Error adding task:", error);
  }
};
const addUser = async (user) => {
  console.log("fetch", user);
  try {
    const collection = db.collection("user");
    await collection.insertOne(user);
    return { message: "Новый брат был успешно добавлен", app_code: "SUCCESS" };
  } catch (error) {
    return { message: "Новый брат был не был добавлен, т.к произошла ошибка" };
  }
};

const getSchedule = async () => {
  try {
    const collection = db.collection("scheduleJw");
    const scheduleList = await collection.find().toArray();
    return scheduleList;
  } catch (error) {
    console.log("Error retrieving schedule:", error);
    return [];
  }
};
const getUser = async () => {
  try {
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

module.exports = { getDb, addTask, addUser, getSchedule };
