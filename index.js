const express = require('express');
const bodyParser = require('body-parser');
const { connectDB, getDB } = require('./db'); // MongoDB 연결 모듈 가져오기
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// 세션 설정
app.use(session({
  secret: 'vvoi54ll8h',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // HTTPS를 사용하는 경우 secure: true로 설정
}));

let db;

// 서버 시작 시 데이터베이스 연결
connectDB().then(() => {
  db = getDB(); // getDB로 연결된 DB 인스턴스 가져오기

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

  // 게시물 등록
  app.post('/api/create', authMiddleware, async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: '제목과 내용을 모두 입력해주세요.' });
    }

    try {
      const collection = db.collection('posts');
      const result = await collection.insertOne({
        title,
        content,
        userId: req.session.userId,
        createdAt: new Date()
      });

      res.status(201).json({ message: '게시물이 성공적으로 생성되었습니다.', postId: result.insertedId });
    } catch (error) {
      res.status(500).json({ error: '게시물 생성 중 오류가 발생했습니다.' });
    }
  });

  // 전체 게시글 목록 조회
  app.get('/api/posts', async (req, res) => {
    try {
      const collection = db.collection('posts');
      const posts = await collection.find({}).sort({ createdAt: -1 }).toArray();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: '게시글 목록 조회 중 오류가 발생했습니다.' });
    }
  });

  // 특정 게시글 조회
  app.get('/api/posts/:id', async (req, res) => {
    try {
      const postId = req.params.id;
      
      // ObjectId 변환 시 오류가 발생할 경우 예외 처리
      if (!ObjectId.isValid(postId)) {
        return res.status(400).json({ error: '잘못된 게시글 ID 형식입니다.' });
      }

      const collection = db.collection('posts');
      const post = await collection.findOne({ _id: new ObjectId(postId) });

      if (!post) {
        return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
      }

      res.json(post);
    } catch (error) {
      res.status(500).json({ error: '게시글 조회 중 오류가 발생했습니다.' });
    }
  });

  // 서버 실행
  app.listen(port, () => {
    console.log(`API 서버가 http://localhost:${port} 에서 실행 중입니다.`);
  });

}).catch((err) => {
  console.error("서버 시작 시 데이터베이스 연결에 실패했습니다.", err);
});
