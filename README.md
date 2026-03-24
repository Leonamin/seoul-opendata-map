# 서울 실시간 생활인구 지도

서울시 공공데이터 기반 실시간 생활인구 및 상권 분석 플랫폼

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Zustand, TanStack Query |
| Backend | NestJS 11, TypeORM, PostgreSQL |
| 지도 | MapLibre GL JS, CARTO Dark Matter 타일 |
| 인프라 | Turborepo, Docker Compose |

## 프로젝트 구조

```
apps/
  web/          Next.js 프론트엔드
  api/          NestJS API 서버
packages/
  shared/       공통 타입, 상수
  ui/           공유 UI 컴포넌트
  eslint-config/
  typescript-config/
```

## 주요 기능

- **실시간 인구 지도** - 서울 115개 핫스팟의 실시간 생활인구 히트맵
- **구별 경계 시각화** - 25개 자치구 인터랙티브 레이어 (클릭/호버)
- **상권 데이터 오버레이** - 업종별 매출/점포 데이터
- **시나리오 비교 분석** - 기간별 인구 변화 시나리오 생성 및 리포트
- **타임라인 재생** - 시계열 데이터 애니메이션 재생

## 빠른 시작

### 사전 준비

- Node.js 18+
- Docker & Docker Compose
- 서울 열린데이터 API 키 ([발급 안내](https://data.seoul.go.kr/))

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# .env 파일에 SEOUL_API_KEY, DB 정보 등 입력

# 3. PostgreSQL 실행
docker compose up -d

# 4. 개발 서버 실행
npm run dev
```

- 프론트엔드: http://localhost:3000
- API 서버: http://localhost:4000
- API 문서 (Swagger): http://localhost:4000/api/docs

### 환경변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `DATABASE_URL` | O | PostgreSQL 연결 문자열 |
| `SEOUL_API_KEY` | O | 서울 열린데이터 API 키 |
| `NEXTAUTH_SECRET` | O | JWT 암호화 시크릿 |
| `NEXTAUTH_URL` | O | 앱 URL (기본: http://localhost:3000) |
| `NEXT_PUBLIC_API_URL` | O | API 서버 URL (기본: http://localhost:4000) |
| `GOOGLE_CLIENT_ID` | - | Google OAuth (선택) |
| `GOOGLE_CLIENT_SECRET` | - | Google OAuth (선택) |

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/locations` | 서울 핫스팟 목록 |
| GET | `/api/locations/search?q=` | 장소 검색 |
| GET | `/api/population/realtime` | 실시간 인구 데이터 |
| GET | `/api/population/history` | 인구 시계열 데이터 |
| GET | `/api/population/bulk` | 다중 지점 인구 조회 |
| POST | `/api/scenarios` | 시나리오 생성 |
| GET | `/api/scenarios/:id` | 시나리오 조회 |
| POST | `/api/reports/generate` | 비교 리포트 생성 |

## 데이터 출처

- [서울 열린데이터 광장](https://data.seoul.go.kr/) - 실시간 생활인구
- [서울시 상권분석 서비스](https://golmok.seoul.go.kr/) - 상업 데이터
- [southkorea/seoul-maps](https://github.com/southkorea/seoul-maps) - 구 경계 GeoJSON

## 라이선스

MIT
