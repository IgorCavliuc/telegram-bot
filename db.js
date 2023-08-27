let db;

const getDb = (database) => {
  db = database;
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
