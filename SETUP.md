# 서울 열린데이터 실시간 지도 플랫폼 - 실행 가이드

이 가이드는 로컬 개발 환경 설정부터 프로덕션 배포까지 모든 과정을 다룹니다.

---

## 사전 준비

### 필수 요구사항

프로젝트를 실행하기 위해 다음이 필요합니다:

| 요구사항 | 버전 | 설명 |
|---------|------|------|
| Node.js | 18+ | JavaScript 런타임 |
| npm | 11+ | 패키지 매니저 |
| Docker | 최신 | 컨테이너 엔진 |
| Docker Compose | 2+ | 컨테이너 오케스트레이션 |
| Git | 최신 | 버전 관리 시스템 |

### 필수 API 키 및 인증 정보

다음 항목을 사전에 준비해야 합니다:

#### 1. 서울 열린데이터 API 키

서울 열린데이터 포털에서 발급받아야 합니다.

```bash
# 링크: https://data.seoul.go.kr/
# 1. 계정 가입 및 로그인
# 2. "나의 페이지" > "인증키 관리"
# 3. "개인키" 발급 (REST API용)
# 4. SEOUL_API_KEY에 저장
```

#### 2. 지도 라이브러리 (토큰 불필요)

지도 표시에는 MapLibre GL JS와 CARTO 무료 타일을 사용합니다. 별도 API 키나 토큰이 필요 없습니다.

```bash
# MapLibre GL JS: https://maplibre.org/
# CARTO 무료 타일: https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json
# 토큰 없이 바로 사용 가능
```

#### 3. Google OAuth 2.0 (선택사항)

소셜 로그인을 원할 경우:

```bash
# 링크: https://console.cloud.google.com/
# 1. Google Cloud 프로젝트 생성
# 2. "OAuth 2.0 클라이언트 ID" 생성
# 3. 인증 정보 유형: "웹 애플리케이션"
# 4. 리디렉션 URI 설정:
#    - 로컬: http://localhost:3000/api/auth/callback/google
#    - 프로덕션: https://your-domain.com/api/auth/callback/google
# 5. 클라이언트 ID/Secret을 환경변수로 저장
```

#### 4. NextAuth 시크릿

JWT 토큰 암호화용 랜덤 문자열:

```bash
# 로컬 개발용
openssl rand -base64 32

# 또는 온라인 생성기 사용
# https://generate-secret.vercel.app/32
```

---

## 1. 로컬 개발 환경 (Local Development)

### 1.1 프로젝트 클론 및 의존성 설치

저장소를 클론하고 의존성을 설치합니다.

```bash
# 저장소 클론
git clone <repository-url>
cd seoul-opendata-map

# 의존성 설치
npm install

# 또는 (권장)
npm ci
```

**설명:**
- 이 프로젝트는 Turborepo 모노레포 구조입니다.
- `npm install`은 루트와 모든 앱(`apps/api`, `apps/web`), 패키지(`packages/*`)의 의존성을 설치합니다.
- `npm ci`는 `package-lock.json`을 기반으로 정확한 버전을 설치하므로 CI/CD에 권장됩니다.

### 1.2 환경변수 설정

이 프로젝트는 두 개의 별도 환경변수 파일을 사용합니다.

#### 루트 환경변수 (`.env` 또는 `.env.local`)

```bash
# 루트 디렉토리에서 .env.example을 참고하여 .env 파일 생성
cp .env.example .env
```

`.env` 파일 내용:

```env
# 데이터베이스 연결
DATABASE_URL=postgresql://dev:dev@localhost:5432/seoul_opendata

# 서울 열린데이터 API
SEOUL_API_KEY=your_actual_api_key_here

# 지도: MapLibre GL JS + CARTO 무료 타일 (토큰 불필요)

# NextAuth 설정
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (선택사항)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# API URL (프론트엔드에서 백엔드 접근)
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**환경변수 설명:**

| 변수 | 용도 | 필수 | 예시 |
|------|------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | O | `postgresql://user:pass@localhost:5432/db_name` |
| `SEOUL_API_KEY` | 서울 API 인증 | O | `abc123xyz...` |
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL | O | `http://localhost:4000` |
| `NEXTAUTH_SECRET` | JWT 암호화 키 | O | 32자 이상의 랜덤 문자열 |
| `NEXTAUTH_URL` | NextAuth 기본 URL | O | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | X | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | X | `GOCSPX-...` |

### 1.3 데이터베이스 시작 (Docker)

PostgreSQL + PostGIS 데이터베이스를 Docker로 실행합니다.

```bash
# Docker Compose로 데이터베이스 시작
docker compose up -d

# 상태 확인
docker compose ps
```

예상 출력:

```
NAME                IMAGE                      STATUS
seoul-opendata-map-db-1   postgis/postgis:16-3.4   Up 2 seconds
```

**데이터베이스 확인:**

```bash
# 데이터베이스 연결 테스트
psql postgresql://dev:dev@localhost:5432/seoul_opendata -c "SELECT version();"

# 또는 Docker 컨테이너 내부에서
docker compose exec db psql -U dev -d seoul_opendata -c "SELECT version();"
```

**의존성:**
- `docker-compose.yml`은 PostGIS 확장 프로그램이 포함된 PostgreSQL 16을 정의합니다.
- 데이터는 `pgdata` 볼륨에 저장됩니다.
- 헬스체크는 10초마다 실행됩니다.

### 1.4 데이터베이스 마이그레이션 및 초기 데이터

TypeORM 마이그레이션을 실행하여 스키마를 생성합니다.

#### 마이그레이션 실행

```bash
# API 디렉토리로 이동
cd apps/api

# 마이그레이션 실행 (개발 모드에서는 synchronize: true이므로 자동 적용)
npm run start:dev

# 또는 명시적으로 마이그레이션 실행
npm run typeorm migration:run
```

**마이그레이션 내용:**

파일: `/apps/api/src/database/migrations/001-initial-schema.ts`

생성되는 테이블:
- `users`: 사용자 정보
- `locations`: 지역 위치 (지오메트리 지원)
- `population_data`: 인구 데이터
- `commercial_data`: 상업 데이터
- `scenarios`: 분석 시나리오
- `scenario_locations`: 시나리오에 포함된 위치
- `scenario_periods`: 시나리오의 시간 구간
- `comparison_reports`: 비교 리포트

#### 초기 데이터 로드 (40개 핫스팟)

서울의 주요 장소 40곳을 데이터베이스에 삽입합니다.

파일: `/apps/api/src/database/seeds/seoul-hotspots.seed.ts`

초기 데이터에 포함되는 장소:
- 강남역, 홍대입구, 명동, 광화문, 여의도, 잠실, 신촌, 이태원 등
- 각 장소는 위도, 경도, 카테고리(문화, 쇼핑, 업무 등) 포함

```bash
# 개발 서버 실행 시 자동으로 시드 데이터가 로드됩니다
npm run dev
```

**시드 데이터 확인:**

```bash
# API 서버가 실행 중일 때
curl http://localhost:4000/api/locations

# 응답 예시:
# [
#   {
#     "id": "uuid",
#     "name": "강남역",
#     "district": "강남구",
#     "latitude": 37.4979,
#     "longitude": 127.0276,
#     "category": "교통"
#   },
#   ...
# ]
```

### 1.5 개발 서버 실행

프론트엔드와 백엔드를 동시에 실행합니다.

```bash
# 루트 디렉토리에서 (백엔드는 자동으로 PORT=4000으로 실행)
PORT=4000 npm run dev
```

또는 더 간단하게:

```bash
npm run dev
```

그 후 .env 파일에 PORT=4000이 설정되어 있는지 확인하거나, 터미널에서:

```bash
# 백엔드가 4000번 포트에서 실행되도록 명시
export PORT=4000 && npm run dev
```

Turbo가 두 개의 개발 서버를 병렬로 시작합니다.

**실행 결과 (약 30초 후):**

```
web:dev: ▲ Next.js 16.2.0
web:dev: - Local: http://localhost:3000
web:dev: - Environments: .env.local

api:start:dev: [Nest] 12/13 12:00:00 AM     LOG [NestFactory] Nest application successfully started +1ms
api:start:dev: Application running on port 4000
api:start:dev: Swagger docs at http://localhost:4000/api/docs
```

**주의:** API의 기본 포트는 3000이므로, 반드시 `PORT=4000` 환경변수를 설정해야 프론트엔드(3000)에서 백엔드(4000)에 정상적으로 연결됩니다.

### 1.6 서버 접근

개발 서버 실행 후 다음 주소로 접근할 수 있습니다.

| 서비스 | URL | 설명 |
|--------|-----|------|
| **프론트엔드** | http://localhost:3000 | 사용자 인터페이스 (지도, 데이터 시각화) |
| **백엔드 API** | http://localhost:4000 | REST API 엔드포인트 |
| **API 문서** | http://localhost:4000/api/docs | Swagger UI (API 테스트 가능) |
| **데이터베이스** | localhost:5432 | PostgreSQL (pgAdmin 등으로 접근) |

**프론트엔드 확인:**

브라우저에서 http://localhost:3000 접속 시:
- 서울 지도가 표시됩니다 (MapLibre GL JS)
- 40개의 핫스팟이 마커로 표시됩니다
- 마커 클릭 시 인구/상업 데이터가 표시됩니다

**API 테스트:**

```bash
# 모든 위치 조회
curl http://localhost:4000/api/locations

# 특정 위치의 인구 데이터 조회
curl http://localhost:4000/api/population/location/POI001

# 상업 데이터 조회
curl http://localhost:4000/api/commercial/location/POI001
```

### 1.7 개발 중 유용한 명령어

```bash
# 타입스크립트 타입 체크
npm run check-types

# 코드 린트
npm run lint

# 코드 포맷팅
npm run format

# 빌드
npm run build

# API만 개발 실행
npm run dev -- --filter=api

# 웹만 개발 실행
npm run dev -- --filter=web
```

### 1.8 CSV 데이터 벌크 임포트 (선택사항)

기존 CSV 파일이 있다면 데이터를 벌크로 임포트할 수 있습니다.

```bash
cd apps/api

# CSV 파일 임포트 스크립트 실행
npm run import:csv -- --file path/to/data.csv

# 또는 API 엔드포인트 사용
curl -X POST http://localhost:4000/api/locations/import \
  -F "file=@data.csv" \
  -H "Authorization: Bearer <token>"
```

**CSV 포맷:**

```csv
name,district,latitude,longitude,category
강남역,강남구,37.4979,127.0276,교통
서울역,중구,37.5563,126.9723,교통
```

---

## 2. 배포 환경 (Production Deployment)

### 2.1 Frontend - Vercel 배포

Vercel은 Next.js 배포에 최적화된 플랫폼입니다.

#### 2.1.1 Vercel 프로젝트 설정

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 초기 배포
vercel --prod
```

**Vercel Dashboard에서 수동 설정:**

1. https://vercel.com/ 접속
2. "Add New" > "Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build` (기본값)
   - **Output Directory:** `.next` (기본값)

#### 2.1.2 환경변수 설정 (Vercel Dashboard)

Vercel Dashboard의 "Settings" > "Environment Variables"에 다음을 추가합니다:

```
NEXT_PUBLIC_API_URL = https://api.your-domain.com
NEXTAUTH_SECRET = <your-nextauth-secret>
NEXTAUTH_URL = https://your-domain.vercel.app
GOOGLE_CLIENT_ID = <your-google-client-id>
GOOGLE_CLIENT_SECRET = <your-google-client-secret>
```

**환경변수 설정 팁:**

- `NEXT_PUBLIC_*`로 시작하는 변수는 클라이언트에 노출됩니다.
- `NEXTAUTH_SECRET`은 프로덕션에서 반드시 설정해야 합니다.
- `NEXTAUTH_URL`은 배포된 도메인으로 설정합니다.
- 각 환경(Preview, Production)별로 다른 값 사용 가능합니다.

#### 2.1.3 리전 설정

한국 (Seoul) 리전에 배포하려면 `vercel.json`을 설정합니다.

파일: `/vercel.json`

```json
{
  "regions": ["icn1"],
  "buildCommand": "npm run build --filter=web"
}
```

또는 Vercel Dashboard에서:
- Settings > General > Regions
- "icn1" (Seoul) 선택

#### 2.1.4 자동 배포

GitHub 푸시 시 자동으로 배포하려면:

1. Vercel Dashboard > Settings > Git
2. "Production Branch" 설정 (기본값: `main`)
3. "Automatic Updates" 활성화

이제 `main` 브랜치에 푸시하면 자동으로 배포됩니다.

```bash
# 배포 수동 실행
vercel --prod

# 상태 확인
vercel ls

# 배포 로그 확인
vercel logs <deployment-url>
```

---

### 2.2 Backend - Oracle Cloud 배포

NestJS API를 Oracle Cloud Compute 인스턴스에 배포합니다.

#### 2.2.1 Oracle Cloud Compute Instance 준비

**인스턴스 생성:**

1. Oracle Cloud 콘솔 접속
2. "Compute" > "Instances" > "Create Instance"
3. 다음 설정 사용:

| 설정 | 값 |
|------|-----|
| Image | Ubuntu 22.04 (무료 티어) |
| Shape | VM.Standard.E2.1.Micro (무료 티어) |
| OCPU | 1 |
| Memory | 1 GB |
| Storage | 50 GB (무료 티어) |

4. SSH 키 다운로드 및 저장 (`seoul-api-key.key`)

**보안 그룹 (Security List) 설정:**

방화벽 규칙 추가:

| 프로토콜 | 포트 | 소스 | 용도 |
|---------|------|------|------|
| TCP | 22 | 0.0.0.0/0 | SSH |
| TCP | 80 | 0.0.0.0/0 | HTTP |
| TCP | 443 | 0.0.0.0/0 | HTTPS |
| TCP | 4000 | 0.0.0.0/0 | API (선택) |
| TCP | 5432 | 10.0.0.0/16 | PostgreSQL (내부) |

#### 2.2.2 서버 초기 설정

```bash
# SSH 접속
ssh -i seoul-api-key.key ubuntu@<instance-ip>

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Node.js 설치 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# npm 업데이트
sudo npm install -g npm@latest

# Docker 설치
sudo apt install -y docker.io docker-compose-v2

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker ubuntu

# Docker 서비스 시작
sudo systemctl start docker
sudo systemctl enable docker

# Git 설치
sudo apt install -y git

# Nginx 설치 (리버스 프록시용)
sudo apt install -y nginx

# Certbot 설치 (SSL 인증서용)
sudo apt install -y certbot python3-certbot-nginx

# 버전 확인
node --version  # v20.x.x
npm --version   # 11.x.x
docker --version
```

#### 2.2.3 PostgreSQL + PostGIS 설정

```bash
# 서버에 프로젝트 클론
cd ~
git clone <repository-url>
cd seoul-opendata-map

# .env 파일 생성
cat > .env << 'EOF'
DATABASE_URL=postgresql://dev:dev@db:5432/seoul_opendata
SEOUL_API_KEY=<your-production-api-key>
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=<your-nextauth-secret>
EOF

# Docker Compose로 PostgreSQL 시작
docker compose up -d

# 데이터베이스 연결 확인
docker compose exec db psql -U dev -d seoul_opendata -c "SELECT 1;"
```

#### 2.2.4 NestJS 배포 방법

두 가지 방법 중 하나를 선택합니다.

**방법 A: Docker (권장)**

Dockerfile을 생성하여 컨테이너로 실행합니다.

파일: `/apps/api/Dockerfile`

```dockerfile
# 빌드 단계
FROM node:20-alpine AS builder

WORKDIR /app

# 루트 패키지 설치
COPY package*.json ./
RUN npm ci

# API 패키지 설치
COPY apps/api/package*.json ./apps/api/
RUN cd apps/api && npm ci

# 공유 패키지 설치
COPY packages/shared/package*.json ./packages/shared/
RUN cd packages/shared && npm ci

# 전체 코드 복사
COPY . .

# API 빌드
RUN cd apps/api && npm run build

# 프로덕션 이미지
FROM node:20-alpine

WORKDIR /app

# 빌드 결과만 복사
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./

EXPOSE 4000

CMD ["node", "dist/main.js"]
```

Docker 이미지 빌드 및 실행:

```bash
# Oracle Cloud 서버에서

# Docker 이미지 빌드
docker build -t seoul-api:latest -f apps/api/Dockerfile .

# 컨테이너 실행 (docker-compose 대신 직접 실행)
docker run -d \
  --name seoul-api \
  --env-file .env \
  --link db:db \
  -p 4000:4000 \
  seoul-api:latest

# 또는 docker-compose.yml에 API 서비스 추가
docker compose up -d
```

`docker-compose.yml` 예시 (API 서비스 추가):

```yaml
version: '3.8'

services:
  db:
    image: postgis/postgis:16-3.4
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: seoul_opendata
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev -d seoul_opendata"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://dev:dev@db:5432/seoul_opendata
      SEOUL_API_KEY: ${SEOUL_API_KEY}
      PORT: 4000
      CORS_ORIGIN: ${CORS_ORIGIN}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  pgdata:
```

서비스 상태 확인:

```bash
# 실행 중인 컨테이너 확인
docker ps

# API 로그 확인
docker logs -f seoul-api

# API 헬스체크
curl http://localhost:4000/api/health
```

**방법 B: PM2 (직접 실행)**

Node.js 프로세스 관리자 PM2를 사용합니다.

```bash
# PM2 설치
sudo npm install -g pm2

# API 빌드
cd apps/api
npm run build

# PM2로 시작
pm2 start dist/main.js --name "seoul-api" --env production

# 부팅 시 자동 실행
pm2 startup
pm2 save

# 상태 확인
pm2 status
pm2 logs seoul-api
```

#### 2.2.5 Nginx 리버스 프록시 + SSL

Nginx를 리버스 프록시로 설정하여 API 요청을 처리합니다.

**Nginx 설정 파일 생성:**

파일: `/etc/nginx/sites-available/seoul-api`

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    # Let's Encrypt 챌린지용
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # HTTPS로 리다이렉트
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    # SSL 인증서 (certbot에서 생성됨)
    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

    # SSL 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # GZIP 압축
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # NestJS API로 프록시
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 타임아웃 설정 (장시간 요청용)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Nginx 사이트 활성화:**

```bash
# 설정 파일 심링크
sudo ln -s /etc/nginx/sites-available/seoul-api \
  /etc/nginx/sites-enabled/seoul-api

# 기본 사이트 비활성화 (선택사항)
sudo unlink /etc/nginx/sites-enabled/default

# 설정 문법 확인
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

**Let's Encrypt SSL 인증서 발급:**

```bash
# Certbot으로 인증서 자동 발급 및 설정
sudo certbot --nginx -d api.your-domain.com

# 프롬프트에 따라:
# 1. 이메일 입력
# 2. 약관 동의 (Y)
# 3. 뉴스레터 구독 선택

# 자동 갱신 활성화 확인
sudo systemctl status certbot.timer

# 인증서 확인
certbot certificates
```

**도메인 DNS 설정:**

DNS 레코드에 다음을 추가합니다:

```
api.your-domain.com  A  <oracle-instance-ip>
```

또는 CNAME으로:

```
api.your-domain.com  CNAME  your-instance.region.compute.oraclecloud.com
```

#### 2.2.6 환경변수 설정

Oracle Cloud 서버의 `.env` 파일:

```env
# 데이터베이스
DATABASE_URL=postgresql://dev:dev@localhost:5432/seoul_opendata

# 서울 API
SEOUL_API_KEY=<your-production-api-key>

# 환경
NODE_ENV=production

# 서버 포트 (Nginx에서 프록시)
PORT=4000

# CORS 설정 (Vercel 프론트엔드)
CORS_ORIGIN=https://your-app.vercel.app

# NextAuth
NEXTAUTH_SECRET=<your-nextauth-secret>

# 선택사항
GOOGLE_CLIENT_ID=<production-google-client-id>
GOOGLE_CLIENT_SECRET=<production-google-client-secret>
```

---

### 2.3 배포 후 검증

배포 완료 후 다음을 확인합니다.

**프론트엔드 검증:**

```bash
# Vercel 배포된 URL 접속 (브라우저)
https://your-app.vercel.app

# 확인 사항:
# 1. 페이지 로드 (에러 없음)
# 2. 지도 표시 (MapLibre GL JS)
# 3. 40개 핫스팟 마커 표시
# 4. 마커 클릭 시 팝업 표시
# 5. 로그인/로그아웃 기능 작동
```

**백엔드 검증:**

```bash
# API 헬스체크
curl https://api.your-domain.com/api/health

# 위치 조회
curl https://api.your-domain.com/api/locations

# Swagger 문서
https://api.your-domain.com/api/docs
```

**로그 모니터링:**

```bash
# Vercel 로그
vercel logs <deployment-url> --follow

# Oracle Cloud API 로그 (Docker)
docker logs -f seoul-api

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**성능 확인:**

```bash
# 페이지 로드 시간 측정
curl -w "Time: %{time_total}s\n" https://api.your-domain.com/api/locations

# 동시 요청 테스트
ab -n 100 -c 10 https://api.your-domain.com/api/locations
```

---

## 3. 유용한 명령어

### 개발 명령어

```bash
# 전체 개발 서버 시작
npm run dev

# 특정 앱만 실행
npm run dev -- --filter=api
npm run dev -- --filter=web

# 타입 체크
npm run check-types

# 린트 검사
npm run lint

# 코드 포맷팅
npm run format

# 전체 빌드
npm run build

# 특정 앱 빌드
npm run build -- --filter=api
npm run build -- --filter=web
```

### API 테스트 명령어

```bash
# 모든 위치 조회
curl http://localhost:4000/api/locations

# 특정 위치 조회
curl http://localhost:4000/api/locations/POI001

# 특정 위치의 인구 데이터
curl http://localhost:4000/api/population/location/POI001

# 상업 데이터
curl http://localhost:4000/api/commercial/location/POI001

# 시나리오 생성 (인증 필요)
curl -X POST http://localhost:4000/api/scenarios \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Scenario","description":"test"}'
```

### Docker 명령어

```bash
# 컨테이너 시작
docker compose up -d

# 컨테이너 중지
docker compose down

# 로그 확인
docker compose logs -f db
docker compose logs -f api

# 데이터베이스 접속
docker compose exec db psql -U dev -d seoul_opendata

# 볼륨 정리
docker compose down -v
```

### 데이터베이스 명령어

```bash
# PostgreSQL 접속
psql postgresql://dev:dev@localhost:5432/seoul_opendata

# 테이블 목록 조회
\dt

# 위치 데이터 조회
SELECT * FROM locations LIMIT 10;

# 인구 데이터 조회
SELECT * FROM population_data WHERE "locationId" = '...' LIMIT 10;
```

---

## 4. 트러블슈팅

### CORS 에러

**증상:**
```
Access to XMLHttpRequest at 'http://localhost:4000/api/...'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**해결:**

1. API의 CORS 설정 확인 (`apps/api/src/main.ts`):

```typescript
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.enableCors({
  origin: corsOrigin,
  credentials: true,
});
```

2. 환경변수 확인:

```bash
# 로컬 개발: .env에 있는지 확인
CORS_ORIGIN=http://localhost:3000

# 프로덕션: Vercel에 설정되었는지 확인
CORS_ORIGIN=https://your-app.vercel.app
```

3. API 재시작:

```bash
# 개발 서버 재시작
npm run dev

# 또는 Docker 컨테이너 재시작
docker restart seoul-api
```

### 지도 로딩 오류

**증상:**
지도가 표시되지 않거나 빈 화면이 나타남

**해결:**

1. 네트워크 확인:

```bash
# CARTO 타일 서버 접근 가능한지 확인
curl -I https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json
```

2. 브라우저 콘솔 확인:
- 개발자 도구(F12) > Console 탭에서 오류 메시지 확인
- Network 탭에서 타일 요청 실패 여부 확인

3. 프론트엔드 재시작:

```bash
# 개발 서버 재시작 (HMR이 감지하지 못한 경우)
npm run dev -- --filter=web
```

### 데이터베이스 연결 오류

**증상:**
```
error: connect ECONNREFUSED 127.0.0.1:5432
```

**해결:**

1. Docker 상태 확인:

```bash
docker compose ps

# 출력 확인: db 컨테이너가 "Up" 상태인지 확인
```

2. PostgreSQL 시작:

```bash
# 컨테이너 재시작
docker compose down
docker compose up -d

# 헬스체크 대기 (약 15초)
docker compose exec db pg_isready -U dev
```

3. 데이터베이스 연결 테스트:

```bash
psql postgresql://dev:dev@localhost:5432/seoul_opendata -c "SELECT 1;"

# 또는
docker compose exec db psql -U dev -d seoul_opendata -c "SELECT 1;"
```

4. 연결 문자열 확인:

```bash
# .env의 DATABASE_URL 확인
cat .env | grep DATABASE_URL

# 예시: postgresql://dev:dev@localhost:5432/seoul_opendata
```

### NextAuth JWT 오류

**증상:**
```
JWTClaimValidationFailed: "aud" claim does not contain the issuer
```

**해결:**

1. NextAuth 시크릿 확인:

```bash
# .env에서 NEXTAUTH_SECRET 확인
cat .env | grep NEXTAUTH_SECRET

# 32자 이상의 랜덤 문자열이어야 함
# 재생성: openssl rand -base64 32
```

2. NextAuth URL 확인:

```bash
# 로컬 개발
NEXTAUTH_URL=http://localhost:3000

# 프로덕션
NEXTAUTH_URL=https://your-app.vercel.app
```

3. 환경변수 동기화:
- Vercel과 로컬 `.env`의 `NEXTAUTH_SECRET`이 동일해야 함
- 변경 후 프론트엔드 재배포

### 서울 API 속도 제한 (Rate Limiting)

**증상:**
```
Error 429: Too Many Requests
```

**해결:**

1. API 호출 제한 확인:
- 서울 열린데이터 API: 시간당 최대 호출 수 확인
- 현재 사용량 확인: https://data.seoul.go.kr/

2. 캐싱 활성화:
- NestJS의 `@Cacheable()` 데코레이터 사용
- Redis 캐싱 설정

3. API 호출 간격 조정:

```typescript
// apps/api/src/modules/data-collector/data-collector.service.ts
// 크롤링 간격을 늘림
@Cron('0 */6 * * *')  // 6시간마다
async fetchData() {
  // ...
}
```

### 포트 충돌

**증상:**
```
listen EADDRINUSE :::3000
```

**해결:**

1. 포트 사용 확인:

```bash
# 3000 포트 사용 중인 프로세스 확인
lsof -i :3000

# 4000 포트 확인
lsof -i :4000
```

2. 프로세스 종료:

```bash
# 포트 3000 사용 중인 프로세스 종료
kill -9 <PID>

# 또는 개발 서버 재시작
npm run dev
```

3. 포트 변경 (선택사항):

```bash
# 웹 포트 변경
PORT=3001 npm run dev -- --filter=web

# API 포트 변경
PORT=4001 npm run dev -- --filter=api
```

### 메모리 부족 (Out of Memory)

**증상:**
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed
JavaScript heap out of memory
```

**해결:**

1. Node.js 힙 크기 증가:

```bash
# 힙 크기를 1GB로 설정
NODE_OPTIONS="--max-old-space-size=1024" npm run build

# 또는 환경변수 설정
export NODE_OPTIONS="--max-old-space-size=2048"
npm run dev
```

2. 대용량 데이터 임포트 최적화:

```bash
# 배치 크기 조정
NODE_OPTIONS="--max-old-space-size=2048" npm run import:csv -- --batch-size=100
```

---

## 5. 추가 리소스

### 문서

- [Next.js 공식 문서](https://nextjs.org/docs)
- [NestJS 공식 문서](https://docs.nestjs.com/)
- [TypeORM 공식 문서](https://typeorm.io/)
- [Turborepo 공식 문서](https://turborepo.dev/docs)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [Oracle Cloud 가이드](https://docs.oracle.com/en-us/iaas/)

### 커뮤니티

- [서울 열린데이터 포털](https://data.seoul.go.kr/)
- [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)
- [Next.js 커뮤니티](https://github.com/vercel/next.js/discussions)
- [NestJS 커뮤니티](https://github.com/nestjs/nest/discussions)

### 도움말 연락처

문제가 발생하면:

1. 로그 확인:
   - 개발: 터미널 출력 확인
   - 프로덕션: 서버 로그, Vercel 로그 확인

2. GitHub Issues 검색:
   - 기존 이슈 확인
   - 새 이슈 작성

3. 토론:
   - 커뮤니티 포럼 참여

---

**최종 수정:** 2026년 3월 23일
**버전:** 1.0.0
