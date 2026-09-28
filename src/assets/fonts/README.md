# 字体说明

| 文件 | 字体 | 用途 | 许可 |
|---|---|---|---|
| `title.woff2` | 站酷小薇体 ZCOOL XiaoWei | 卡片标题、菜单等楷体风格文字 | SIL Open Font License 1.1 |
| `brush.woff2` | 马善政楷书 Ma Shan Zheng | 大屏主标题、品牌名等书法字 | SIL Open Font License 1.1 |

两个字体均来自 Google Fonts，已按项目实际用到的汉字做了子集化（原字体约 6MB，子集后分别约 360KB / 13KB）。
新增标题文字时如果显示成系统楷体，说明该字不在子集里，需要重新生成：

```bash
pip install fonttools brotli
pyftsubset ZCOOLXiaoWei-Regular.ttf --text-file=chars.txt --flavor=woff2 --output-file=title.woff2
```
