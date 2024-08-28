// index.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// body-parser 설정
app.use(bodyParser.json());

// GET API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

// POST API
app.post('/api/echo', (req, res) => {
  const { message } = req.body;
  res.json({ receivedMessage: message });
});

// 서버 실행
app.listen(port, () => {
  console.log(`API 서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
