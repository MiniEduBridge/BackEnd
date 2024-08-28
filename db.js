const { MongoClient } = require("mongodb");

const url = "mongodb+srv://admin:admin@miniedubridge.cnupy.mongodb.net/?retryWrites=true&w=majority&appName=MiniEduBridge";
const dbName = "miniEduBridge"; // 데이터베이스 이름을 지정합니다.

let client;

const connectDB = async () => {
  if (client) {
    return client.db(dbName);
  }

  try {
    client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    console.log('MongoDB에 성공적으로 연결되었습니다.');
    return client.db(dbName);
  } catch (err) {
    console.error('MongoDB 연결 오류:', err);
    throw err;
  }
};

const getDB = () => {
  if (!client) {
    throw new Error("데이터베이스가 초기화되지 않았습니다. connectDB()를 먼저 호출하세요.");
  }
  return client.db(dbName);
};

const closeDB = async () => {
  if (client) {
    await client.close();
    client = null;
    console.log('MongoDB 연결이 닫혔습니다.');
  }
};

module.exports = { connectDB, getDB, closeDB };