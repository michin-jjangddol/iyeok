"""Compare data/hexagrams.json with Wikipedia's "List of hexagrams of the I Ching".

실행: python tests/check_hexagrams_wikipedia.py
인터넷에서 위키백과 원문을 받아 64괘의 번호, 괘명, 하괘·상괘를 대조합니다.
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

URL = "https://en.wikipedia.org/w/index.php?title=List_of_hexagrams_of_the_I_Ching&action=raw"
DATA = Path(__file__).resolve().parent.parent / "data" / "hexagrams.json"

# 이체자: 데이터는 한국에서 흔히 쓰는 자형을 쓴다
VARIANTS = {"恆": "恒", "旣濟": "既濟", "豊": "豐"}


def main():
    req = urllib.request.Request(URL, headers={"User-Agent": "iYeok-check/1.0"})
    text = urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
    data = json.loads(DATA.read_text(encoding="utf-8"))
    symbol_to_key = {t["symbol"]: k for k, t in data["trigrams"].items()}

    # 문단마다 "Hexagram N is named {{...|NAME}}" 와 아래(inner)·위(outer) 소성괘 기호를 뽑는다
    entries = {}
    pattern = r"''Hexagram (\d+)'' is named \{\{(?:lang\|zh|linktext\|lang=zh)\|([^}]+)\}\}(.*?)(?=''Hexagram \d+'' is named|\Z)"
    for m in re.finditer(pattern, text, re.S):
        num, name, rest = int(m.group(1)), m.group(2).strip(), m.group(3)
        lower = re.search(r"inner \(lower\) \[\[[^\]]+\]\] is ([☰-☷])", rest)
        upper = re.search(r"outer \(upper\) \[\[[^\]]+\]\] is ([☰-☷])", rest)
        identical = re.search(r"outer \(upper\) \[\[[^\]]+\]\] is identical", rest)
        lo = symbol_to_key.get(lower.group(1)) if lower else None
        up = symbol_to_key.get(upper.group(1)) if upper else (lo if identical else None)
        entries.setdefault(num, (VARIANTS.get(name, name), lo, up))

    problems = []
    missing = sorted(set(range(1, 65)) - set(entries))
    if missing:
        problems.append(f"not found in source: {missing}")
    for h in data["hexagrams"]:
        if h["number"] not in entries:
            continue
        name, lo, up = entries[h["number"]]
        if name != h["name"]:
            problems.append(f"#{h['number']} name: source {name} / data {h['name']}")
        if (lo, up) != (h["lower"], h["upper"]):
            problems.append(f"#{h['number']} trigrams: source {lo}/{up} / data {h['lower']}/{h['upper']}")

    if problems:
        print("\n".join(problems))
        return 1
    print(f"ok - all {len(entries)} hexagrams match Wikipedia (number, name, lower and upper trigrams)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
