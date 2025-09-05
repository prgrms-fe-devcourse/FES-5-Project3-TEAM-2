![header](https://capsule-render.vercel.app/api?type=waving&height=300&color=FF8E9E&section=middle&text=Planmingo!&fontSize=70&fontColor=ffffff&animation=fadeIn)

# 🦩 Planmingo

#### [🔗Planmingo 배포 링크](https://fes-5-project3-team-2.vercel.app/)
> <b>공동 여행 계획 서비스</b>
: React + TypeScript + Supabase 기반의 실시간 협업 여행 플래너

---

## ✨서비스 소개

<b>Planmingo</b>는 친구, 가족, 동아리 등 여러 명이 함께 <b>여행을 계획하고 관리</b>할 수 있는 플랫폼입니다.
채팅방, 엑셀, 메모장 등 여러 도구에 흩어진 여행 계획을 하나의 서비스에서 <b>일정·예산·앨범</b>까지 통합 관리할 수 있습니다.

---

## 👯‍♀️ 팀원 소개

<table>
  <tr>
    <td align="center"><a href="https://github.com/yoon00"><img src="https://avatars.githubusercontent.com/u/65941017?v=4" width="80"/><br/><b>김윤지</b></a></td>
    <td align="center"><a href="https://github.com/HyoYoung0829"><img src="https://avatars.githubusercontent.com/u/108615164?v=4" width="80"/><br/><b>백효영</b></a></td>
    <td align="center"><a href="https://github.com/mintsky0172"><img src="https://avatars.githubusercontent.com/u/183986392?v=4" width="80"/><br/><b>이소민</b></a></td>
    <td align="center"><a href="https://github.com/chechoii"><img src="https://avatars.githubusercontent.com/u/176888817?v=4" width="80"/><br/><b>최정은</b></a></td>
  </tr>
</table>

---

## 🚀 기술 스택

#### 🧩 Frontend
<img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />

<br/>

#### 🗃 State & Realtime
<img src="https://img.shields.io/badge/Zustand-Store-764ABC?style=flat-square&logo=redux&logoColor=white" />
<img src="https://img.shields.io/badge/Supabase-Realtime-3FCF8E?style=flat-square&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/WebSocket-Live-FFB86C?style=flat-square&logo=socketdotio&logoColor=white" />

<br/>

#### ☁ Infra & Deploy
<img src="https://img.shields.io/badge/Supabase-DB%20%26%20Auth-3FCF8E?style=flat-square&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/Vercel-Deploy-000000?style=flat-square&logo=vercel&logoColor=white" />

</div>

---

## 📂 프로젝트 구조

<details>
  <summary><b>프로젝트 구조</b></summary>


```txt
project-root/
├─ public/                     # 정적 리소스 (favicon...)
│
├─ src/
│  ├─ assets/                  # 이미지, 아이콘, 폰트 등
│  │   └─ icons/
│  │
│  ├─ components/              # 재사용 가능한 UI 컴포넌트
│  │   └─ common/              # 버튼, 사이드바, alert 등 공용 UI
│  │
│  ├─ lib/                     # 외부 라이브러리 초기화 & 유틸
│  │   └─ supabase.ts          # Supabase 클라이언트
│  │
│  ├─ pages/                   # 라우트 단위 페이지
│  │   ├─ Album/
│  │   ├─ Auth/
│  │   ├─ Budget/
│  │   ├─ DashBoard/
│  │   ├─ Group/
│  │   └─ Home /
│  │
│  ├─ router/
│  │
│  ├─ stores/                  # Zustand 전역 상태
│  │
│  ├─ styles/                  # 전역 스타일 및 Tailwind 확장
│  │   └─ globals.css
│  │
│  ├─ types/                   # 전역 타입 정의
│  │
│  ├─ App.tsx                  # 라우팅 및 전체 앱 구조
│  ├─ HomeLayout.tsx           # 홈 페이지 전용 레이아웃
│  ├─ main.tsx                 # 진입점
│
├─ .env                        # 환경변수 (Supabase URL/KEY 등)

```
</details>

---

## 🖥️ 핵심 기능

<table>
<tr>
<td width="50%" align="center">

#### 🔑 그룹 참여
구글 소셜 로그인
**초대 링크**로 그룹 참여
그룹 정보 관리 (이름, 여행 날짜, 썸네일)
그룹 삭제 (Owner 전용)

</td>
<td width="50%" align="center">

#### 🗓️ 일정 관리
날짜별 일정 표시
지도에서 일정 추가
**드래그 앤 드롭**으로 순서 변경
공동 편집 (실시간 반영)

</td>
</tr>

<tr>
<td width="50%" align="center">

#### 🗺️ 지도
**Google Maps API 연동**
장소 검색 (이름, 주소, 평점)
일정 마커 + InfoWindow
맵 클릭 시 일정 추가

</td>
<td width="50%" align="center">

#### 💰 예산 관리
카테고리별 내역 CRUD
**개인별 자동 정산**
카테고리별 통계 그래프

</td>
</tr>

<tr>
<td colspan="2" align="center">

#### 📸 앨범
사진 추가 / 삭제 (드래그 앤 드롭)
가상화 & 무한 스크롤
<b>사진 변경 시 실시간 알림</b>
이미지 최적화 (`browser-image-compression`)

</td>
</tr>
</table>




