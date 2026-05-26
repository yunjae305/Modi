# Modi
<img width="1254" height="1254" alt="Modi_profile" src="https://github.com/user-attachments/assets/47a4a62a-2e2b-49ec-a3ef-afbff6b88b3f" />

Modi는 과거 시장 데이터를 블라인드로 체험하는 시나리오 투자 학습 서비스입니다. 사용자는 대표 종목 20개가 포함된 과거 위기장을 선택하고, 실제 주식처럼 종목을 골라 매수와 매도를 연습합니다. 계정 로그인은 일반 아이디/비밀번호와 Kakao 간편 로그인을 지원합니다.

- 서비스 URL: https://modi-two.vercel.app/
- 배포 플랫폼: Vercel
- 핵심 키워드: 과거 데이터 시뮬레이션, 대표 종목 투자, 아이디/비밀번호 로그인, Kakao 간편 로그인, 포트폴리오 평가, 투자 성향 리포트

## 주요 기능

### 1. 과거 데이터 시나리오 모드

- 실제 과거 대표 종목 20개를 사용한 블라인드 투자 시뮬레이션
- 종목을 선택해 캔들 차트를 확인하고 여러 종목을 동시에 보유하는 구조
- 재생 중 가격이 실시간처럼 움직이고 0.5배속, 1배속, 2배속으로 시장 시간 조절
- 다음 날 버튼으로 수동 진행 가능
- 매수, 매도, 예수금, 종목별 보유 수량, 평균 단가, 자산 평가액 계산
- 시뮬레이션 종료 후 실제 시장 구간 공개
- 최종 수익률, 존버 수익률, 최대 낙폭, 총 매매 횟수, 투자 성향 리포트 제공

현재 포함된 시나리오:

| 시나리오 | 데이터 | 학습 포인트 |
|---|---|---|
| V자 반등의 정석 | 2020년 코로나 폭락장 KOSPI 대표주 20개 | 공포 구간에서의 진입 판단 |
| 끝없는 하락의 공포 | 2008년 서브프라임 사태 S&P 500 대표주 20개 | 손절과 현금 관리 |
| 버블의 끝 | 2000년 닷컴버블 NASDAQ 기술주 중심 20개 | 고점 추격과 탐욕 제어 |

### 2. 초보자 튜토리얼

- 양봉, 음봉, 시가, 고가, 저가, 종가를 차트 위에서 학습
- 시장가 주문 개념을 10주 매수 미션으로 실습
- 초보자와 경험자를 분기하는 첫 진입 플로우 제공

### 3. 계정 로그인

- 일반 아이디(이메일)와 비밀번호로 회원가입과 로그인
- Kakao OAuth 기반 간편 로그인
- 로그인 완료 후 시나리오 선택 화면으로 복귀
- 게스트 로그인과 별도 모의투자 모드는 프론트 흐름에 노출하지 않음

### 4. 데이터와 API

- 과거 시나리오 데이터는 `public/data/` 정적 JSON으로 제공
- 데이터 재생성 스크립트는 `scripts/fetch_data.py`
- 시나리오 거래 데이터는 런타임에 외부 API를 호출하지 않고 정적 JSON을 읽음
- 로그인은 `/api/auth/login`, `/api/auth/register`, `/api/auth/oauth/kakao/*`, `/api/auth/me`, `/api/auth/logout`을 사용
- Vercel Serverless Functions와 Supabase 사용자 테이블을 기준으로 세션 쿠키를 발급

## 화면 흐름

| 경로 | 역할 |
|---|---|
| `/` | 랜딩, 서비스 소개, 진입 모달 |
| `/tutorial` | 초보자 차트 학습과 매수 실습 |
| `/login` | 아이디/비밀번호 로그인과 Kakao 간편 로그인 |
| `/login/callback` | Kakao 로그인 완료 후 세션 확인 |
| `/select` | 과거 시나리오 선택 |
| `/simulation` | 과거 데이터 기반 매매 시뮬레이션 |
| `/result` | 시뮬레이션 결과 리포트 |

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, Zustand |
| UI | Tailwind CSS, Framer Motion, lightweight-charts |
| API | Vercel Serverless Functions, Spring Boot 로컬 서버 |
| Database | Supabase PostgreSQL, 로컬 H2 |
| Auth | Email password auth, Kakao OAuth, cookie session |
| Market Data | 정적 OHLCV JSON, yfinance, pykrx |
| Test | Node test runner, TypeScript strip types |

## 프로젝트 구조

```text
api/                  Vercel Serverless Functions
public/data/          과거 대표 종목 시나리오 JSON
scripts/              데이터 수집 스크립트
server/               로컬 개발용 Spring Boot API 서버
src/components/       공통 UI, 차트, 거래, 결과 컴포넌트
src/data/             시나리오 메타데이터
src/hooks/            차트 데이터와 시뮬레이션 훅
src/pages/            라우트 단위 페이지
src/services/         프론트 API 클라이언트
src/store/            로그인과 시뮬레이션 상태
src/types/            공통 타입
src/utils/            수익률, 포맷, 투자 성향 계산
supabase/schema.sql   Supabase 스키마와 seed 데이터
tests/                주요 플로우 검증 테스트
```

## 실행 방법

### 프론트엔드 실행

시나리오 투자와 튜토리얼은 프론트엔드만으로 확인할 수 있습니다. 로그인 기능은 API 서버와 환경변수가 필요합니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

### 로그인 API 설정

로컬 Spring Boot API를 함께 사용할 때는 `.env.example`을 `.env`로 복사하고 다음 값을 채웁니다.

```env
VITE_API_BASE_URL=http://localhost:8080/api
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
KAKAO_CLIENT_ID=...
KAKAO_CLIENT_SECRET=...
JWT_SECRET=change-this-to-a-long-random-local-secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080
```

Kakao Developers의 Redirect URI에는 다음 값을 등록합니다.

```text
http://localhost:8080/api/auth/oauth/kakao/callback
https://modi-two.vercel.app/api/auth/oauth/kakao/callback
```

## 배포 설정

Vercel 배포 주소는 다음 URL을 기준으로 사용합니다.

```text
https://modi-two.vercel.app/
```

Vercel 배포에서는 `VITE_API_BASE_URL=/api`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `JWT_SECRET`, `FRONTEND_URL`, `BACKEND_URL`을 환경변수로 등록합니다.

## API 요약

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/auth/providers` | 사용 가능한 로그인 제공자 조회 |
| `POST` | `/api/auth/register` | 아이디/비밀번호 회원가입 |
| `POST` | `/api/auth/login` | 아이디/비밀번호 로그인 |
| `GET` | `/api/auth/oauth/kakao/authorize` | Kakao 로그인 시작 |
| `GET` | `/api/auth/oauth/kakao/callback` | Kakao 로그인 콜백 |
| `GET` | `/api/auth/me` | 현재 사용자 조회 |
| `POST` | `/api/auth/logout` | 로그아웃 |

## 데이터 갱신

과거 시나리오 데이터는 런타임에 외부 API를 호출하지 않고 정적 JSON을 읽습니다. 데이터를 다시 생성하려면 Python 패키지를 설치한 뒤 스크립트를 실행합니다.

```bash
pip install pandas yfinance pykrx
python scripts/fetch_data.py
```

`pykrx`가 없으면 KOSPI 데이터도 Yahoo Finance의 `^KS11` 데이터로 대체 수집합니다.

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
- 파산 조건, 원인 분석, 재도전 플로우 추가

### 중기 확장

- 시나리오별 난이도와 추천 학습 순서
- 지정가 주문, 미체결 주문, 주문 취소
- 추가 과거 시장 시나리오
- 더 긴 기간의 대표 종목 데이터

### 장기 서비스화

- 사용자별 장기 학습 히스토리
- 시나리오 제작 도구
- 관리자용 시나리오 생성기
- OpenDART, FRED, 한국은행 ECOS 기반 학습 카드

## 개발 메모

- 시크릿은 `.env`에만 넣고 Git에 커밋하지 않습니다.
- `.env.example`은 실행에 필요한 키 이름만 제공하는 템플릿입니다.
- 프론트엔드 기본 빌드는 `npm run build`입니다.
