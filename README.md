# Modi

Modi는 과거 주식 시장 데이터를 블라인드로 체험하는 모의 투자 학습 시뮬레이션입니다. 코로나 폭락장, 서브프라임 금융위기, 닷컴버블 붕괴 시나리오를 선택해 다음 날로 이동하며 매수와 매도를 연습하고 결과 리포트에서 내 수익률, 존버 수익률, 최대 낙폭, 투자 성향을 확인합니다.

## 실행 방법

```bash
npm install
npm run dev
```

## 빌드 확인

```bash
npm run build
```

## 데이터

앱은 런타임에 외부 API를 호출하지 않고 `public/data/`의 정적 JSON을 읽습니다. 현재 포함된 데이터는 Yahoo Finance Chart API에서 받은 과거 지수 데이터를 기획서 스키마에 맞춰 저장한 것입니다.

데이터를 다시 생성하려면 Python 패키지를 설치한 뒤 스크립트를 실행합니다.

```bash
pip install pandas yfinance pykrx
python scripts/fetch_data.py
```

`pykrx`가 없으면 KOSPI도 `^KS11` Yahoo Finance 데이터로 대체 수집합니다.
