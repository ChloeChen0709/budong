# 不懂 budong

无需后端的学习工具。单个 HTML 文件，双击运行，数据保存在浏览器本地。

打开后是书架，可选微积分或四级备考。

微积分是错题本：导入教材目录，录入题目，按章节与错因统计，按错因设置复习间隔。题目支持分数、指数、根号的排版样式，附一套数学键盘。每节另附概念、题型与例题。

四级备考是知识点库，内容内置，分听力、阅读、写作、翻译、词汇五部分，词表类内容直接展示。词汇页按艾宾浩斯曲线安排背诵，另有生词本与已掌握两处可回看。写作、翻译各有一个 AI 批改入口。

## 构建

```bash
python3 scripts/build.py
python3 scripts/verify.py
```

`build.py` 读取 `src/` 与 `packs/` 下的全部内容包，生成 `index.html`。`verify.py` 依赖 sympy，用于校验例题的符号计算结果。

## 内容包

`packs/` 下一个 JSON 对应一本书：

- `id`：同时是本地存储的命名空间
- `mode`：`course` 为错题本，`exam` 为知识库
- `book`：章节结构
- `notes`：各节内容

## 数据

存于 localStorage 与 IndexedDB，不跨设备同步。说明面板可导出 JSON 备份，并在其他设备恢复。

## AI

仅四级的批改调用模型。接口地址与 key 存于本机，请求直连所填地址；其余功能离线可用。

## 许可

MIT。封面所用的 Great Vibes 字体以 SIL Open Font License 1.1 授权，原文见 `fonts/OFL-GreatVibes.txt`。
