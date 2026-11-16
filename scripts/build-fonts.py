#!/usr/bin/env python3
"""生成站点自托管的字体文件（assets/fonts/）。

为什么要子集化：这是静态单页，中英两套文案都写在 index.html 里。中文字体完整版十几 MB，
所以只保留页面实际用到的字；拉丁字体保留完整的 Latin 字符集，英文文案怎么改都不缺字。

什么时候要重跑：中文文案里出现了新的汉字或符号。不重跑也不会坏，缺的字会退回系统字体。

用法：
    python3 -m venv .cache/venv && .cache/venv/bin/pip install fonttools brotli
    .cache/venv/bin/python scripts/build-fonts.py

源字体下载到 .cache/fonts/（已在 .gitignore 里），只提交生成的 woff2 和授权文件。
所有字体均为 SIL Open Font License 1.1，可免费商用、可再分发（须附带授权文件）。
"""

import io
import pathlib
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = pathlib.Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache" / "fonts"
OUT = ROOT / "assets" / "fonts"
PAGE = ROOT / "index.html"

GF = "https://raw.githubusercontent.com/google/fonts/main/ofl"
# 文楷：新版（v1.5x）最粗只到 Medium；v1.320/v1.330 的 Bold 字符映射表不规范，fontTools 读不了，所以固定 v1.315
WENKAI = "https://github.com/lxgw/LxgwWenKai/releases/download/v1.315"

# Google Fonts「latin」分片的码位范围
LATIN = (
    list(range(0x0000, 0x0100)) + [0x0131, 0x0152, 0x0153, 0x02BB, 0x02BC, 0x02C6, 0x02DA, 0x02DC,
    0x0304, 0x0308, 0x0329] + list(range(0x2000, 0x2070)) + [0x20AC, 0x2122, 0x2191, 0x2192, 0x2193,
    0x2212, 0x2215, 0xFEFF, 0xFFFD]
)

# (输出文件, 源文件 URL, 可变轴的取值, 字符范围)
#   可变轴：None 表示固定在默认值，(min, max) 表示保留这一段
#   字符范围："latin" = 完整 Latin + 页面里的其他西文符号；"page" = 页面里出现的所有字符
FONTS = [
    ("inter.woff2", f"{GF}/inter/Inter%5Bopsz,wght%5D.ttf", {"opsz": None, "wght": (400, 700)}, "latin"),
    ("dm-serif-display-italic.woff2", f"{GF}/dmserifdisplay/DMSerifDisplay-Italic.ttf", None, "latin"),
    ("jetbrains-mono.woff2", f"{GF}/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf", {"wght": (400, 500)}, "latin"),
    ("noto-sans-sc.woff2", f"{GF}/notosanssc/NotoSansSC%5Bwght%5D.ttf", {"wght": (400, 700)}, "page"),
    ("lxgw-wenkai-bold.woff2", f"{WENKAI}/LXGWWenKai-Bold.ttf", None, "page"),
]

LICENSES = {
    "Inter-OFL.txt": f"{GF}/inter/OFL.txt",
    "DMSerifDisplay-OFL.txt": f"{GF}/dmserifdisplay/OFL.txt",
    "JetBrainsMono-OFL.txt": f"{GF}/jetbrainsmono/OFL.txt",
    "NotoSansSC-OFL.txt": f"{GF}/notosanssc/OFL.txt",
    "LXGWWenKai-OFL.txt": "https://raw.githubusercontent.com/lxgw/LxgwWenKai/v1.315/OFL.txt",
}


def fetch(url: str, dest: pathlib.Path) -> pathlib.Path:
    if not dest.exists():
        print(f"  下载 {url}")
        dest.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(url, dest)
    return dest


def main() -> None:
    page_chars = set(PAGE.read_text(encoding="utf-8"))
    unicodes = {
        "latin": sorted(set(LATIN) | {ord(c) for c in page_chars if ord(c) < 0x2E80}),
        "page": sorted({ord(c) for c in page_chars if ord(c) >= 0x20}),
    }

    OUT.mkdir(parents=True, exist_ok=True)
    for name, url, axes, charset in FONTS:
        src = fetch(url, CACHE / url.rsplit("/", 1)[-1].replace("%5B", "[").replace("%5D", "]"))
        font = TTFont(src)
        if axes:
            # 截取后先写出再读回：直接在截取结果上做子集，fontTools 的懒加载 gvar 会对不上字形
            buf = io.BytesIO()
            instancer.instantiateVariableFont(font, axes).save(buf)
            buf.seek(0)
            font = TTFont(buf)
        options = subset.Options()
        options.flavor = "woff2"
        options.layout_features = ["*"]   # 保留全部 OpenType 特性（正文用了 Inter 的 ss01 / cv11）
        options.name_IDs = ["*"]
        options.notdef_outline = True
        subsetter = subset.Subsetter(options)
        subsetter.populate(unicodes=unicodes[charset])
        subsetter.subset(font)
        font.flavor = "woff2"
        font.save(OUT / name)
        print(f"  {name}: {(OUT / name).stat().st_size / 1024:.0f} KB")

    for name, url in LICENSES.items():
        fetch(url, OUT / "licenses" / name)


if __name__ == "__main__":
    main()
