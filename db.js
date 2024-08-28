const MongoClient = require("mongodb").MongoClient;

const url = "mongodb+srv://admin:admin@miniedubridge.cnupy.mongodb.net/?retryWrites=true&w=majority&appName=MiniEduBridge";

// MongoDB 연결 함수
const connectDB = async () => {
  try {
    const client = await MongoClient.connect(url);
    console.log('MongoDB에 성공적으로 연결되었습니다.');
    return client.db('mydatabase');  // 연결된 데이터베이스 반환 (예: 'mydatabase')
  } catch (err) {
    console.error('MongoDB 연결 오류:', err);
    throw err;
  }
};

module.exports = connectDB;

