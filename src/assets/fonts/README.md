# 离线字体

两款字体均随前端资源打包、本地加载，运行时不请求 Google Fonts 或其他外部字体 CDN。中文正文保留系统字体；标题和品牌文字使用以下字体。

| 商户端文件 | 景区端对应文件 | 字体 | 完整许可 |
|---|---|---|---|
| `jin-title.woff2` | `title.woff2` | 站酷小薇体 ZCOOL XiaoWei | [SIL OFL 1.1](OFL-ZCOOL-XiaoWei.txt) |
| `jin-brush.woff2` | `brush.woff2` | 马善政楷书 Ma Shan Zheng | [SIL OFL 1.1](OFL-Ma-Shan-Zheng.txt) |

字体来源：[ZCOOL XiaoWei](https://github.com/google/fonts/tree/main/ofl/zcoolxiaowei)、[Ma Shan Zheng](https://github.com/google/fonts/tree/main/ofl/mashanzheng)。版权声明见各许可文件；分发字体时请保留许可。这里只制作 WOFF2 字符子集，未新增字体家族。

2026-09-29 同步两个前端的字符集合：扫描两项目 `src` 文本，加入 ASCII 可打印字符，并合并四份既有 WOFF2 的全部码点，保留原有覆盖。集合共 1224 个码点，每款原字体支持其中 1211 个；所有实际汉字均已覆盖。原字体不支持的少量符号、emoji 仍由系统回退。两端相同字体使用完全相同的子集内容。接口动态返回的其他汉字不保证包含在子集中。

## 再生成

完整 TTF 保留在两个项目同级的 `merchant-font-work/` 下，分别为 `ZCOOLXiaoWei-Regular.ttf` 和 `MaShanZheng-Regular.ttf`。新增标题后，在**两个项目的共同上级目录**运行以下 Python 代码；环境需安装 `fonttools`、`brotli`。所有处理在内存完成，直接更新四份 WOFF2，不需要临时字符文件或联网下载字体。

```python
from pathlib import Path
from io import BytesIO
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path.cwd()
projects = ["yingyou-merchant-admin", "yingyou-scenic-web"]
extensions = {".vue", ".js", ".ts", ".jsx", ".tsx", ".css", ".scss", ".sass", ".less", ".html", ".json"}
chars = set(range(32, 127))
for project in projects:
    for path in (root / project / "src").rglob("*"):
        if path.suffix in extensions:
            text = path.read_text(encoding="utf-8", errors="ignore")
            chars.update(ord(c) for c in text if ord(c) >= 128 and not c.isspace())
    for path in (root / project / "src/assets/fonts").glob("*.woff2"):
        chars.update(TTFont(path).getBestCmap())

for source, merchant, scenic in [
    ("ZCOOLXiaoWei-Regular.ttf", "jin-title.woff2", "title.woff2"),
    ("MaShanZheng-Regular.ttf", "jin-brush.woff2", "brush.woff2"),
]:
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    font = subset.load_font(str(root / "merchant-font-work" / source), options)
    expected = set(font.getBestCmap()) & chars
    worker = subset.Subsetter(options)
    worker.populate(unicodes=chars)
    worker.subset(font)
    output = BytesIO()
    subset.save_font(font, output, options)
    data = output.getvalue()
    assert set(TTFont(BytesIO(data)).getBestCmap()) == expected
    for project, filename in zip(projects, [merchant, scenic]):
        (root / project / "src/assets/fonts" / filename).write_bytes(data)
    print(source, len(expected), len(data))
```

更新后按各项目原有方式构建并部署前端，保留原文件名和现有 `@font-face` 引用。
