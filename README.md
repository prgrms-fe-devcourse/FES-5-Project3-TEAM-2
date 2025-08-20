# 🦩 Planmingo

> 팀 프로젝트: React + TypeScript + Tailwind 기반 웹 서비스

---

## 🚀 기술 스택

- **Frontend**: React 19 + TypeScript
- **Bundler**: Vite 7
- **State Management**: Zustand
- **UI Framework**: TailwindCSS 4
- **Database & Auth**: Supabase

---

## 📂 프로젝트 구조

```
project-root/
├─ public/                     # 정적 리소스 (favicon, robots.txt 등)
│
├─ src/
│  ├─ assets/                  # 이미지, 아이콘, 폰트 등
│  │   └─ icons/
│  │
│  ├─ components/              # 재사용 가능한 UI 컴포넌트
│  │   ├─ common/              # 버튼, 모달, 로딩스피너 등 공용 UI
│  │   ├─ layout/              # Header, Sidebar, Footer
│  │   └─ group/               # 그룹 관련 컴포넌트 (그룹카드, 멤버리스트 등)
│  │
│  ├─ features/                # 도메인 단위 기능 폴더
│  │   ├─ auth/                # 로그인/회원가입 관련
│  │   ├─ group/               # 그룹 생성/관리
│  │   ├─ itinerary/           # 일정 관리
│  │   ├─ budget/              # 예산 관리
│  │   ├─ album/               # 사진 앨범
│  │   └─ poll/                # 투표 기능
│  │
│  ├─ hooks/                   # 커스텀 훅
│  │   ├─ useAuth.ts           # 인증 관련
│  │   ├─ useSupabase.ts       # Supabase 관련
│  │   ├─ useWebSocket.ts      # 실시간 WebSocket
│  │   └─ useStore.ts          # Zustand 스토어 훅
│  │
│  ├─ lib/                     # 외부 라이브러리 초기화 & 유틸
│  │   ├─ supabase.ts          # Supabase 클라이언트
│  │   ├─ websocket.ts         # WebSocket 클라이언트
│  │   └─ api.ts               # 공용 API 유틸
│  │
│  ├─ pages/                   # 라우트 단위 페이지
│  │   ├─ Home.tsx
│  │   ├─ Dashboard.tsx
│  │   ├─ GroupDetail.tsx
│  │   ├─ ItineraryPage.tsx
│  │   ├─ BudgetPage.tsx
│  │   ├─ AlbumPage.tsx
│  │   └─ PollPage.tsx
│  │
│  ├─ router/
│  │   ├─ router.tsx
│  │
│  ├─ stores/                   # Zustand 전역 상태
│  │   ├─ authStore.ts
│  │   ├─ groupStore.ts
│  │   └─ uiStore.ts
│  │
│  ├─ styles/                  # 전역 스타일 및 Tailwind 확장
│  │   └─ globals.css
│  │
│  ├─ types/                   # 전역 타입 정의
│  │   ├─ auth.d.ts
│  │   ├─ group.d.ts
│  │   ├─ itinerary.d.ts
│  │   ├─ budget.d.ts
│  │   └─ album.d.ts
│  │
│  ├─ App.tsx                  # 라우팅 설정
│  ├─ main.tsx                 # 진입점
│  ├─ root.tsx                 # 페이지 레이아웃
│  └─ vite-env.d.ts
│
├─ .env                        # 환경변수 (Supabase URL/KEY 등)
├─ .gitignore
├─ .prettierrc
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ README.md
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```



