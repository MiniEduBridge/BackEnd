const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./db'); // MongoDB 연결 모듈 가져오기
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(session({
  secret: 'vvoi54ll8h',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // HTTPS를 사용하는 경우 secure: true로 설정
}));

let db; // 데이터베이스 객체

// 서버 시작 시 데이터베이스 연결
connectDB().then((database) => {
  db = database; // 데이터베이스 객체 할당

  // GET API 
  app.get('/', (req, res) => {
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


 // 회원가입 API
 app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const collection = db.collection('users');
    const existingUser = await collection.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: '이미 존재하는 사용자입니다.' });
    }

    await collection.insertOne({ username, password: hashedPassword });
    res.status(201).json({ message: '회원가입이 성공적으로 완료되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
  }
});

// 로그인 API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const collection = db.collection('users');
    const user = await collection.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: '존재하지 않는 사용자입니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: '비밀번호가 올바르지 않습니다.' });
    }

    req.session.userId = user._id;
    res.json({ message: '로그인 성공' });
  } catch (error) {
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
  }
});

 // 로그아웃 API
 app.post('/api/logout', (req, res) => {
  if (req.session.userId) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: '로그아웃 중 오류가 발생했습니다.' });
      }
      res.clearCookie('connect.sid'); // 세션 쿠키 삭제
      res.json({ message: '로그아웃 성공' });
    });
  } else {
    res.status(400).json({ error: '로그인된 상태가 아닙니다.' });
  }
});

// 인증 미들웨어
const authMiddleware = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: '로그인이 필요합니다.' });
  }
};


  // 서버 실행
  app.listen(port, () => {
    console.log(`API 서버가 http://localhost:${port} 에서 실행 중입니다.`);
  });

}).catch((err) => {
  console.error("서버 시작 시 데이터베이스 연결에 실패했습니다.", err);
});
