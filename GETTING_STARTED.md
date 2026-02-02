# 임산부 운동 가이드 앱 - 설치 및 실행 가이드

## 📦 설치 방법

### 1. 프로젝트 폴더로 이동
```bash
cd pregnancy-exercise-app
```

### 2. 패키지 설치
```bash
npm install
```

설치되는 주요 패키지:
- `react` & `react-dom` (v18.2.0)
- `typescript` (v5.2.2)
- `vite` (v5.0.8)
- `styled-components` (v6.1.8)
- `react-router-dom` (v6.20.0)
- `zustand` (v4.4.7) - 상태관리

## 🚀 실행 방법

### 개발 모드 실행
```bash
npm run dev
```
- 브라우저가 자동으로 열립니다 (http://localhost:3000)
- 파일 수정 시 자동으로 새로고침됩니다 (Hot Module Replacement)

### 프로덕션 빌드
```bash
npm run build
```
- `dist/` 폴더에 최적화된 파일이 생성됩니다

### 빌드 결과 미리보기
```bash
npm run preview
```

## 📱 모바일에서 테스트하기

### 1. 같은 네트워크에서 테스트
개발 서버 실행 시 표시되는 Network 주소로 모바일에서 접속:
```
Local:   http://localhost:3000
Network: http://192.168.x.x:3000  ← 이 주소로 접속
```

### 2. 모바일 브라우저에서
- iOS Safari 또는 Android Chrome에서 Network 주소로 접속
- "홈 화면에 추가"를 통해 앱처럼 사용 가능

## 🎨 프로젝트 특징

### 모바일 앱 느낌
- 최대 너비 480px로 제한하여 모바일 디바이스처럼 보임
- 터치 인터랙션 최적화
- 하단 네비게이션 바

### 개발 환경
- **Vite**: 빠른 개발 서버와 빌드
- **TypeScript**: 타입 안정성
- **Styled-Components**: CSS-in-JS 스타일링
- **Path Alias**: 깔끔한 import 경로

## 📂 주요 파일 설명

```
pregnancy-exercise-app/
├── src/
│   ├── App.tsx              # 메인 앱 컴포넌트 (라우팅 설정)
│   ├── main.tsx             # 앱 시작점
│   ├── components/
│   │   └── Layout.tsx       # 레이아웃 컴포넌트 (하단 네비게이션)
│   ├── pages/
│   │   └── HomePage.tsx     # 홈 페이지
│   └── styles/
│       ├── theme.ts         # 디자인 시스템 (색상, 간격, 폰트 등)
│       ├── GlobalStyle.ts   # 전역 스타일
│       └── styled.d.ts      # styled-components 타입 정의
├── index.html               # HTML 템플릿
├── vite.config.ts           # Vite 설정
├── tsconfig.json            # TypeScript 설정
└── package.json             # 프로젝트 정보
```

## 🛠 개발 시 유용한 명령어

```bash
# 린트 검사
npm run lint

# 타입 체크
npx tsc --noEmit

# 의존성 업데이트 확인
npm outdated

# 특정 포트로 실행
npm run dev -- --port 3001
```

## 🔧 커스터마이징

### 테마 색상 변경
`src/styles/theme.ts` 파일에서 색상을 수정:
```typescript
colors: {
  primary: '#FF6B6B',  // 메인 색상
  secondary: '#FFE5E5', // 보조 색상
  // ...
}
```

### 최대 너비 변경
`src/styles/theme.ts`에서:
```typescript
layout: {
  maxWidth: '480px',  // 원하는 너비로 변경
}
```

## 💡 다음 단계

1. **운동 데이터 추가**: `src/data/exercises.ts` 파일 생성
2. **운동 상세 페이지**: `src/pages/ExerciseDetailPage.tsx` 추가
3. **운동 기록 기능**: 로컬 스토리지 또는 백엔드 연동
4. **PWA 설정**: `vite-plugin-pwa` 설치 및 설정

## 🐛 문제 해결

### 포트가 이미 사용중일 때
```bash
# 다른 포트로 실행
npm run dev -- --port 3001
```

### node_modules 재설치
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript 오류
```bash
# 타입 정의 재설치
npm install -D @types/react @types/react-dom @types/styled-components
```

## 📞 추가 도움

- Vite 공식 문서: https://vitejs.dev
- React 공식 문서: https://react.dev
- Styled-Components 문서: https://styled-components.com

---

즐거운 개발 되세요! 🎉
