import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// content.json 파일 읽기
const contentData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'content.json'), 'utf-8')
);

// 1초 지연 미들웨어
const delayResponse = (req, res, next) => {
  setTimeout(() => {
    next();
  }, 1000);
};

// ✅ 루트 페이지 추가
app.get("/", (req, res) => {
  res.send("✅ Express 서버가 정상적으로 실행 중입니다!");
});

// 콘텐츠 데이터 API
app.get('/api/content', (req, res) => {
  res.json({
    success: true,
    data: contentData
  });
});

// 검색 API - 1초 지연 적용
app.get('/api/search', delayResponse, (req, res) => {
  const query = req.query.q || '';

  // 모든 섹션의 아이템을 하나의 배열로 합치기
  let allItems = [];
  contentData.sections.forEach(section => {
    allItems = allItems.concat(section.items);
  });

  // 검색어가 있으면 제목으로 필터링
  const results = query
    ? allItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  res.json({
    success: true,
    query: query,
    results: results,
    count: results.length
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`검색 API: http://localhost:${PORT}/api/search?q=검색어`);
});
