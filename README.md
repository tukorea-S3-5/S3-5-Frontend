# S3-5-Frontend

## 로컬 네트워크(폰) 테스트
1. 백엔드 `main.ts` CORS origin에 추가 필요
   - `http://192.168.71.133:3002`
   - `listen(port, '0.0.0.0')` 추가

2. 프론트 `.env`
   - `VITE_API_BASE_URL=http://192.168.71.133:3001`

3. 실행
   - `npm run dev -- --host`