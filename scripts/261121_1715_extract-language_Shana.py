"""현재 페이지·활성 모듈·괘사에서 번역 단위를 추출한다. 원본 파일은 읽기만 한다.

python scripts/261121_1715_extract-language_Shana.py --output /새/버전_ko_Shana.json
새 파일만 생성한다. 기존 번역 파일은 자동 갱신하지 않는다.
"""
import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = {}
ORIGINS = {}
SEEN = set()


def add(source, origin):
    source = re.sub(r"\s+", " ", source).strip()
    if not source or not re.search(r"[a-zA-Z가-힣]", source):
        return
    value = 2166136261
    for char in source:
        value = ((value ^ ord(char)) * 16777619) & 0xFFFFFFFF
    key = f"text.{value:08x}"
    assert key not in MESSAGES or MESSAGES[key] == source, f"key collision: {key}"
    MESSAGES[key] = source
    ORIGINS.setdefault(key, set()).add(str(origin))


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("script", "style"):
            self.skip += 1
        if tag == "script" and attrs.get("src"):
            module((self.path.parent / attrs["src"]).resolve())
        for name in ("aria-label", "aria-valuetext", "alt", "title", "placeholder"):
            if attrs.get(name):
                add(attrs[name], self.path.relative_to(ROOT))
        if tag == "meta" and (attrs.get("name") == "description" or attrs.get("property") in ("og:title", "og:description")):
            add(attrs.get("content", ""), self.path.relative_to(ROOT))

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = max(0, self.skip - 1)

    def handle_data(self, value):
        if not self.skip:
            add(value, self.path.relative_to(ROOT))


def module(path):
    if path in SEEN or not path.is_file() or ROOT not in path.parents:
        return
    SEEN.add(path)
    text = path.read_text()
    # 문자열 리터럴을 후보로 삼는다. 템플릿 식은 명시적 템플릿과 t()로 단계적으로 옮긴다.
    for match in re.finditer(r'''(["'])(?:\\.|(?!\1)[^\\\n])*?\1''', text):
        value = match.group()[1:-1]
        if re.search(r"[가-힣]", value):
            add(value.replace(r"\n", " ").replace(r"\'", "'").replace(r'\"', '"'), path.relative_to(ROOT))
    for dependency in re.findall(r'''(?:from\s*|import\s*)["']([^"']+)["']''', text):
        if dependency.startswith("."):
            module((path.parent / dependency).resolve())


def collect():
    for page in ("index.html", "app/index.html", "yarrow/index.html", "yarrow/learn/index.html", "yarrow/options/index.html"):
        path = ROOT / page
        Page(path).feed(path.read_text())
    application = (ROOT / "app/app.js").read_text()
    active = re.search(r'const CONTENT_INDEX = "../([^"]+)"', application)[1]
    index = json.loads((ROOT / active).read_text())
    for entry in index["hexagrams"].values():
        path = ROOT / "data/hexagrams" / entry["judgment"]["ko"]
        data = json.loads(path.read_text())
        for field in ("titleKo", "reading", "translation", "interpretation", "translationNote"):
            for value in data.get(field, []) if isinstance(data.get(field), list) else [data.get(field, "")]:
                add(value, path.relative_to(ROOT))
    def names(value):
        if isinstance(value, dict):
            for v in value.values():
                names(v)
        elif isinstance(value, list):
            for v in value:
                names(v)
        elif isinstance(value, str) and re.search(r"[가-힣]", value):
            add(value, "data/hexagrams.json")
    names(json.loads((ROOT / "data/hexagrams.json").read_text()))
    controls = {
        "controls.label": "언어 선택",
        "controls.home": "언어 설정은 아이역 홈에서",
        "controls.region": "언어 설정",
        "controls.pendingSuffix": " · 번역 준비 중",
        "controls.failed": "언어 자료를 불러오지 못해 한국어로 표시합니다. 다시 방문하면 재시도합니다.",
        "controls.korean": "한국어로 표시합니다. 다른 언어는 번역 준비 중입니다.",
        "controls.preparing": "{language} 번역 준비 중입니다. 번역된 항목부터 적용하며, 아직 없는 글은 한국어로 표시합니다.",
        "controls.storageBlocked": " 이 브라우저에서는 언어 선택을 저장할 수 없습니다.",
    }
    return {
        "format": 1,
        "locale": "ko",
        "messages": dict(sorted({**MESSAGES, **controls}.items())),
        "templates": {
            "runtime.split": {"source": "왼쪽 {left} · 오른쪽 {right} · 합계 {total}"},
            "runtime.stopped": {"source": "멈췄습니다 · 왼쪽 {left} · 오른쪽 {right} · 합계 {total}"},
            "runtime.remaining": {"source": "남은 {count}가지 ÷ 4 = {value}"},
        },
        "origins": {key: sorted(value) for key, value in sorted(ORIGINS.items())},
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    data = collect()
    with Path(args.output).open("x") as stream:
        json.dump(data, stream, ensure_ascii=False, indent=2)
        stream.write("\n")
    print(f"{len(data['messages'])} Korean source units → {args.output}")
