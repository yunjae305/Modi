# Modi

Modi는 과거 주식 시장 데이터를 블라인드로 체험하는 모의 투자 학습 시뮬레이션입니다. 코로나 폭락장, 서브프라임 금융위기, 닷컴버블 붕괴 시나리오를 선택해 다음 날로 이동하며 매수와 매도를 연습하고 결과 리포트에서 내 수익률, 존버 수익률, 최대 낙폭, 투자 성향을 확인합니다.

## 실행 방법

```bash
npm install
npm run dev
```

10억 모의투자 서버까지 함께 쓰려면 Java 17 이상을 설치한 뒤 별도 터미널에서 서버를 실행합니다.

```powershell
cd server
.\gradlew.bat bootRun
```

프론트에서 `/trade`로 이동하면 Google, Kakao, 게스트 로그인을 통해 서버 저장형 모의투자를 시작할 수 있습니다.

## 빌드 확인

```bash
npm run build
```

## 소셜 로그인 설정

OAuth 없이도 게스트 로그인은 사용할 수 있습니다. Google과 Kakao 로그인을 켜려면 `.env.example`을 `.env`로 복사한 뒤 값을 채웁니다.

```bash
cp .env.example .env
```

Google 리디렉션 URI는 `http://localhost:8080/api/auth/oauth/google/callback`입니다.

Kakao 리디렉션 URI는 `http://localhost:8080/api/auth/oauth/kakao/callback`입니다.

배포 환경에서는 Vercel의 Environment Variables에 값을 넣습니다.

```env
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
```

Supabase SQL Editor에서 `supabase/schema.sql`을 실행한 뒤 배포하면 Vercel의 `/api` 함수가 로그인, 포트폴리오, 주문, 랭킹, KIS REST 현재가 동기화를 처리합니다.

배포용 Kakao 리디렉션 URI는 `https://modi-two.vercel.app/api/auth/oauth/kakao/callback`입니다.

## 데이터

앱은 런타임에 외부 API를 호출하지 않고 `public/data/`의 정적 JSON을 읽습니다. 현재 포함된 데이터는 Yahoo Finance Chart API에서 받은 과거 지수 데이터를 기획서 스키마에 맞춰 저장한 것입니다.

데이터를 다시 생성하려면 Python 패키지를 설치한 뒤 스크립트를 실행합니다.

```bash
pip install pandas yfinance pykrx
python scripts/fetch_data.py
```

`pykrx`가 없으면 KOSPI도 `^KS11` Yahoo Finance 데이터로 대체 수집합니다.
