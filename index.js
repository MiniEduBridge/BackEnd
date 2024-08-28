const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./db'); // MongoDB 연결 모듈 가져오기

const app = express();
const port = 3000;

app.use(bodyParser.json());

let db; // 데이터베이스 객체

// 서버 시작 시 데이터베이스 연결
connectDB().then((database) => {
  db = database; // 데이터베이스 객체 할당

  // GET API
  app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello, World!' });
  });

  // POST API
  app.post('/api/echo', (req, res) => {
    const { message } = req.body;
    res.json({ receivedMessage: message });
  });

  // 예시: MongoDB에서 데이터를 조회하는 API
  app.get('/api/data', async (req, res) => {
    try {
      const collection = db.collection('mycollection');
      const data = await collection.find().toArray();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: '데이터 조회 중 오류가 발생했습니다.' });
    }
  });

  // 서버 실행
  app.listen(port, () => {
    console.log(`API 서버가 http://localhost:${port} 에서 실행 중입니다.`);
  });

}).catch((err) => {
  console.error("서버 시작 시 데이터베이스 연결에 실패했습니다.", err);
});
