# Modi
<img width="1254" height="1254" alt="Modi_profile" src="https://github.com/user-attachments/assets/47a4a62a-2e2b-49ec-a3ef-afbff6b88b3f" />

Modi는 "모의투자"와 "스터디"를 합친 주식 학습 서비스입니다. 과거 시장 데이터를 블라인드로 체험하는 시나리오 모드와, 로그인 기반 10억 원 모의투자 모드를 통해 투자 초보자가 리스크 없이 차트, 매수, 매도, 수익률, 손실 관리를 연습할 수 있게 합니다.

- 서비스 URL: https://modi-two.vercel.app/
- 배포 플랫폼: Vercel
- 핵심 키워드: 과거 데이터 시뮬레이션, 초보자 튜토리얼, 10억 모의투자, 소셜 로그인, 포트폴리오, 랭킹

## 주요 기능

### 1. 과거 데이터 시나리오 모드

- 실제 과거 지수 데이터를 사용한 블라인드 투자 시뮬레이션
- 다음 날로 이동하며 캔들 차트가 순차 공개되는 구조
- 매수, 매도, 예수금, 보유 수량, 평균 단가, 자산 평가액 계산
- 시뮬레이션 종료 후 실제 시장 구간 공개
- 최종 수익률, 존버 수익률, 최대 낙폭, 총 매매 횟수, 투자 성향 리포트 제공

현재 포함된 시나리오:

| 시나리오 | 데이터 | 학습 포인트 |
|---|---|---|
| V자 반등의 정석 | 2020년 코로나 폭락장 KOSPI | 공포 구간에서의 진입 판단 |
| 끝없는 하락의 공포 | 2008년 서브프라임 사태 S&P 500 | 손절과 현금 관리 |
| 버블의 끝 | 2000년 닷컴버블 NASDAQ | 고점 추격과 탐욕 제어 |

### 2. 초보자 튜토리얼

- 양봉, 음봉, 시가, 고가, 저가, 종가를 차트 위에서 학습
- 시장가 주문 개념을 10주 매수 미션으로 실습
- 초보자와 경험자를 분기하는 첫 진입 플로우 제공

### 3. 10억 모의투자 모드

- Google, Kakao, 게스트 로그인 지원
- 사용자별 10억 원 초기 자금 지급
- 종목 목록, 현재가, 전일 대비 수익률 조회
- 시장가 매수와 매도 주문 처리
- 보유 종목, 평가금액, 수익률, 예수금, 총자산 계산
- 체결 내역 저장 및 조회
- 전체 사용자 기준 랭킹 표시
- 5초 주기 포트폴리오와 랭킹 갱신

### 4. 데이터와 API

- 과거 시나리오 데이터는 `public/data/` 정적 JSON으로 제공
- 데이터 재생성 스크립트는 `scripts/fetch_data.py`
- Vercel Serverless Functions 기반 `/api` 라우트 제공
- Supabase 테이블로 사용자, 종목, 현재가, 보유 종목, 체결 내역 저장
- KIS Open API 키가 있으면 국내 주식 현재가를 동기화하고, 없으면 seed 가격으로 동작
- 로컬 개발용 Spring Boot API 서버는 `server/`에 별도 제공

## 화면 흐름

| 경로 | 역할 |
|---|---|
| `/` | 랜딩, 서비스 소개, 진입 모달 |
| `/tutorial` | 초보자 차트 학습과 매수 실습 |
| `/mode-select` | 시나리오 모드와 10억 모의투자 선택 |
| `/select` | 과거 시나리오 선택 |
| `/simulation` | 과거 데이터 기반 매매 시뮬레이션 |
| `/result` | 시뮬레이션 결과 리포트 |
| `/login` | Google, Kakao, 게스트 로그인 |
| `/login/callback` | OAuth 로그인 완료 처리 |
| `/trade` | 10억 모의투자 대시보드 |

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, Zustand |
| UI | Tailwind CSS, Framer Motion, lightweight-charts |
| API | Vercel Serverless Functions, Spring Boot 로컬 서버 |
| Database | Supabase PostgreSQL, 로컬 H2 |
| Auth | Google OAuth, Kakao OAuth, Guest session |
| Market Data | 정적 OHLCV JSON, yfinance, pykrx, KIS Open API |
| Test | Node test runner, TypeScript strip types |

## 프로젝트 구조

```text
api/                  Vercel Serverless Functions
public/data/          과거 지수 시나리오 JSON
scripts/              데이터 수집 스크립트
server/               로컬 개발용 Spring Boot API 서버
src/components/       공통 UI, 차트, 거래, 결과 컴포넌트
src/data/             시나리오 메타데이터
src/hooks/            차트 데이터와 시뮬레이션 훅
src/pages/            라우트 단위 페이지
src/services/         프론트 API 클라이언트
src/store/            인증과 시뮬레이션 상태
src/types/            공통 타입
src/utils/            수익률, 포맷, 투자 성향 계산
supabase/schema.sql   Supabase 스키마와 seed 데이터
tests/                주요 플로우 검증 테스트
```

## 실행 방법

### 프론트엔드 실행

과거 시나리오 모드와 튜토리얼은 프론트엔드만으로 확인할 수 있습니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

### 10억 모의투자 로컬 실행

`/trade`는 API 서버가 필요합니다. 로컬에서는 Spring Boot 서버를 함께 실행합니다.

```bash
cp .env.example .env
```

`.env`의 기본 API 주소는 다음 값으로 둡니다.

```env
VITE_API_BASE_URL=http://localhost:8080/api
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080
```

Java 17 이상을 설치한 뒤 별도 터미널에서 서버를 실행합니다.

```powershell
cd server
.\gradlew.bat bootRun
```

루트 터미널에서는 프론트엔드를 실행합니다.

```bash
npm run dev
```

OAuth 키가 없어도 게스트 로그인으로 10억 모의투자를 체험할 수 있습니다.

## 배포 설정

Vercel 배포 주소는 다음 URL을 기준으로 사용합니다.

```text
https://modi-two.vercel.app/
```

Vercel Environment Variables에 다음 값을 등록합니다.

```env
VITE_API_BASE_URL=/api
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=...
FRONTEND_URL=https://modi-two.vercel.app
BACKEND_URL=https://modi-two.vercel.app
KIS_APP_KEY=...
KIS_APP_SECRET=...
KIS_BASE_URL=https://openapi.koreainvestment.com:9443
KIS_SYNC_INTERVAL_MS=15000
```

Supabase SQL Editor에서 `supabase/schema.sql`을 실행한 뒤 배포합니다.

OAuth 리디렉션 URI:

```text
Google: https://modi-two.vercel.app/api/auth/oauth/google/callback
Kakao: https://modi-two.vercel.app/api/auth/oauth/kakao/callback
```

## 데이터 갱신

과거 시나리오 데이터는 런타임에 외부 API를 호출하지 않고 정적 JSON을 읽습니다. 데이터를 다시 생성하려면 Python 패키지를 설치한 뒤 스크립트를 실행합니다.

```bash
pip install pandas yfinance pykrx
python scripts/fetch_data.py
```

`pykrx`가 없으면 KOSPI 데이터도 Yahoo Finance의 `^KS11` 데이터로 대체 수집합니다.

## API 요약

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/auth/providers` | 사용 가능한 로그인 제공자 조회 |
| `POST` | `/api/auth/guest` | 게스트 로그인 |
| `GET` | `/api/auth/me` | 현재 사용자 조회 |
| `POST` | `/api/auth/logout` | 로그아웃 |
| `GET` | `/api/auth/oauth/google/authorize` | Google OAuth 시작 |
| `GET` | `/api/auth/oauth/google/callback` | Google OAuth 콜백 |
| `GET` | `/api/auth/oauth/kakao/authorize` | Kakao OAuth 시작 |
| `GET` | `/api/auth/oauth/kakao/callback` | Kakao OAuth 콜백 |
| `GET` | `/api/stocks` | 거래 가능 종목 조회 |
| `GET` | `/api/portfolio` | 내 포트폴리오 조회 |
| `GET` | `/api/executions` | 내 체결 내역 조회 |
| `POST` | `/api/orders/buy` | 매수 주문 |
| `POST` | `/api/orders/sell` | 매도 주문 |
| `GET` | `/api/rankings` | 전체 랭킹 조회 |
| `POST` | `/api/prices/sync` | KIS 현재가 강제 동기화 |

## 검증 방법

```bash
node --test --experimental-strip-types tests/*.test.ts
npm run build
```

## 앞으로 추가할 기능

### 단기 개선

- 결과 리포트에 시장 배경 카드 추가
- 투자 습관 분석 규칙 고도화
- 결과 공유 카드 생성
- 포트폴리오와 거래내역 전용 페이지 분리
- 파산 조건, 원인 분석, 재도전 플로우 추가

### 중기 확장

- 대회방 생성과 참가 기능
- 시즌별 랭킹과 친구 랭킹
- 지정가 주문, 미체결 주문, 주문 취소
- Scheduler와 Batch 체결 구조
- KIS 가격 스냅샷 저장과 가격 stale 처리

### 장기 서비스화

- 실제 장중 시세 기반 데일리 라이브 대회
- WebSocket 기반 실시간 시세 갱신
- 관리자용 대회 생성기
- 사용자별 장기 투자 히스토리
- OpenDART, FRED, 한국은행 ECOS 기반 학습 카드

## 개발 메모

- 시크릿은 `.env`에만 넣고 Git에 커밋하지 않습니다.
- `.env.example`은 실행에 필요한 키 이름만 제공하는 템플릿입니다.
- 프론트엔드 기본 빌드는 `npm run build`입니다.
- 로컬 Spring Boot 서버는 루트 `.env`를 읽습니다.
- Vercel 배포에서는 `api/` 디렉터리의 Serverless Functions가 `/api`를 담당합니다.
