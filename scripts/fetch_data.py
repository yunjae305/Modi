import json
from pathlib import Path

import pandas as pd
import yfinance as yf

try:
    from pykrx import stock
except ImportError:
    stock = None


OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "data"


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
    print(f"{name} 저장 완료: {len(records)}일")


def _download_yahoo(symbol: str, start: str, end: str) -> list[dict]:
    data = yf.download(symbol, start=start, end=end, auto_adjust=True, progress=False)
    return _normalize_df(data)


def _download_kospi() -> list[dict]:
    if stock is None:
        return _download_yahoo("^KS11", "2020-01-01", "2020-12-31")
    data = stock.get_index_ohlcv("20200101", "20201231", "1001")
    data.columns = ["open", "high", "low", "close", "volume", "trading_value", "market_cap"]
    return _normalize_df(data)


def main() -> None:
    _write_json("kospi_2020.json", _download_kospi())
    _write_json("sp500_2008.json", _download_yahoo("^GSPC", "2007-01-01", "2009-12-31"))
    _write_json("nasdaq_2000.json", _download_yahoo("^IXIC", "1999-01-01", "2002-12-31"))


if __name__ == "__main__":
    main()
