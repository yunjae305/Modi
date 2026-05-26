import json
from pathlib import Path

import pandas as pd
import yfinance as yf

try:
    from pykrx import stock
except ImportError:
    stock = None


OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "data"

STOCK_SCENARIOS = {
    "corona_stocks_2020.json": {
        "start": "2020-01-01",
        "end": "2020-12-31",
        "stocks": [
            ("005930.KS", "005930", "삼성전자", "KOSPI"),
            ("000660.KS", "000660", "SK하이닉스", "KOSPI"),
            ("035420.KS", "035420", "NAVER", "KOSPI"),
            ("035720.KS", "035720", "카카오", "KOSPI"),
            ("005380.KS", "005380", "현대차", "KOSPI"),
            ("000270.KS", "000270", "기아", "KOSPI"),
            ("051910.KS", "051910", "LG화학", "KOSPI"),
            ("006400.KS", "006400", "삼성SDI", "KOSPI"),
            ("207940.KS", "207940", "삼성바이오로직스", "KOSPI"),
            ("068270.KS", "068270", "셀트리온", "KOSPI"),
            ("012330.KS", "012330", "현대모비스", "KOSPI"),
            ("005490.KS", "005490", "POSCO홀딩스", "KOSPI"),
            ("105560.KS", "105560", "KB금융", "KOSPI"),
            ("055550.KS", "055550", "신한지주", "KOSPI"),
            ("066570.KS", "066570", "LG전자", "KOSPI"),
            ("096770.KS", "096770", "SK이노베이션", "KOSPI"),
            ("017670.KS", "017670", "SK텔레콤", "KOSPI"),
            ("028260.KS", "028260", "삼성물산", "KOSPI"),
            ("032830.KS", "032830", "삼성생명", "KOSPI"),
            ("086790.KS", "086790", "하나금융지주", "KOSPI"),
        ],
    },
    "sp500_stocks_2008.json": {
        "start": "2007-01-01",
        "end": "2009-12-31",
        "stocks": [
            ("AAPL", "AAPL", "Apple", "S&P 500"),
            ("MSFT", "MSFT", "Microsoft", "S&P 500"),
            ("XOM", "XOM", "Exxon Mobil", "S&P 500"),
            ("GE", "GE", "General Electric", "S&P 500"),
            ("JNJ", "JNJ", "Johnson & Johnson", "S&P 500"),
            ("PG", "PG", "Procter & Gamble", "S&P 500"),
            ("JPM", "JPM", "JPMorgan Chase", "S&P 500"),
            ("WMT", "WMT", "Walmart", "S&P 500"),
            ("BAC", "BAC", "Bank of America", "S&P 500"),
            ("C", "C", "Citigroup", "S&P 500"),
            ("IBM", "IBM", "IBM", "S&P 500"),
            ("CVX", "CVX", "Chevron", "S&P 500"),
            ("KO", "KO", "Coca-Cola", "S&P 500"),
            ("PFE", "PFE", "Pfizer", "S&P 500"),
            ("INTC", "INTC", "Intel", "S&P 500"),
            ("CSCO", "CSCO", "Cisco", "S&P 500"),
            ("ORCL", "ORCL", "Oracle", "S&P 500"),
            ("T", "T", "AT&T", "S&P 500"),
            ("VZ", "VZ", "Verizon", "S&P 500"),
            ("WFC", "WFC", "Wells Fargo", "S&P 500"),
        ],
    },
    "nasdaq_stocks_2000.json": {
        "start": "1999-01-01",
        "end": "2002-12-31",
        "stocks": [
            ("MSFT", "MSFT", "Microsoft", "NASDAQ"),
            ("CSCO", "CSCO", "Cisco", "NASDAQ"),
            ("INTC", "INTC", "Intel", "NASDAQ"),
            ("ORCL", "ORCL", "Oracle", "NASDAQ"),
            ("QCOM", "QCOM", "Qualcomm", "NASDAQ"),
            ("AMGN", "AMGN", "Amgen", "NASDAQ"),
            ("AAPL", "AAPL", "Apple", "NASDAQ"),
            ("AMAT", "AMAT", "Applied Materials", "NASDAQ"),
            ("ADBE", "ADBE", "Adobe", "NASDAQ"),
            ("CMCSA", "CMCSA", "Comcast", "NASDAQ"),
            ("KLAC", "KLAC", "KLA", "NASDAQ"),
            ("ADI", "ADI", "Analog Devices", "NASDAQ"),
            ("TXN", "TXN", "Texas Instruments", "NASDAQ"),
            ("MU", "MU", "Micron", "NASDAQ"),
            ("AMZN", "AMZN", "Amazon", "NASDAQ"),
            ("EBAY", "EBAY", "eBay", "NASDAQ"),
            ("SBUX", "SBUX", "Starbucks", "NASDAQ"),
            ("COST", "COST", "Costco", "NASDAQ"),
            ("NVDA", "NVDA", "NVIDIA", "NASDAQ"),
            ("PAYX", "PAYX", "Paychex", "NASDAQ"),
        ],
    },
}


def _normalize_df(df: pd.DataFrame) -> list[dict]:
    frame = df.copy()
    frame.index = pd.to_datetime(frame.index)
    frame.index.name = "date"
    if isinstance(frame.columns, pd.MultiIndex):
        frame.columns = [str(col[0]).lower() for col in frame.columns]
    else:
        frame.columns = [str(col).lower().split()[0] for col in frame.columns]
    frame = frame[["open", "high", "low", "close", "volume"]].dropna()
    records = []
    for idx, row in frame.iterrows():
        records.append(
            {
                "date": idx.strftime("%Y-%m-%d"),
                "open": round(float(row["open"]), 2),
                "high": round(float(row["high"]), 2),
                "low": round(float(row["low"]), 2),
                "close": round(float(row["close"]), 2),
                "volume": int(row["volume"]),
            }
        )
    return records


def _write_json(name: str, records: list[dict]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUTPUT_DIR / name
    path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{name} 저장 완료: {len(records)}개")


def _download_yahoo(symbol: str, start: str, end: str) -> list[dict]:
    data = yf.download(symbol, start=start, end=end, auto_adjust=True, progress=False)
    return _normalize_df(data)


def _download_kospi() -> list[dict]:
    if stock is None:
        return _download_yahoo("^KS11", "2020-01-01", "2020-12-31")
    data = stock.get_index_ohlcv("20200101", "20201231", "1001")
    data.columns = ["open", "high", "low", "close", "volume", "trading_value", "market_cap"]
    return _normalize_df(data)


def _download_stock_bundle(config: dict) -> list[dict]:
    bundle = []
    for yahoo_symbol, stock_id, name, market in config["stocks"]:
        bars = _download_yahoo(yahoo_symbol, config["start"], config["end"])
        if len(bars) < 2:
            raise RuntimeError(f"{stock_id} 데이터가 부족합니다.")
        bundle.append({"id": stock_id, "name": name, "market": market, "bars": bars})
    return bundle


def main() -> None:
    _write_json("kospi_2020.json", _download_kospi())
    _write_json("sp500_2008.json", _download_yahoo("^GSPC", "2007-01-01", "2009-12-31"))
    _write_json("nasdaq_2000.json", _download_yahoo("^IXIC", "1999-01-01", "2002-12-31"))
    for name, config in STOCK_SCENARIOS.items():
        _write_json(name, _download_stock_bundle(config))


if __name__ == "__main__":
    main()
