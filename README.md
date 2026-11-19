# 不懂 budong

大学课程的集中入口。单文件网页应用，双击 `index.html` 运行，数据存在浏览器本地。

打算把自己大学期间所有课程放进同一个地方：每门课一份内容包，书架上一本，各自记录、各自复习。现在有两本。

**微积分** 是错题本：导入教材目录，录入题目，按章节与错因统计，按错因设置复习间隔。题目支持分数、指数、根号的排版，附一套数学键盘。

**四级备考** 是知识点库：内容内置，分听力、阅读、写作、翻译、词汇五部分。词汇页按艾宾浩斯安排背诵，另有生词本与已掌握。写作、翻译各有一个 AI 批改入口。

## 加一门课

`packs/` 下一个 JSON 对应一本书：

- `id`：同时是本地存储的命名空间
- `mode`：`course` 为错题本，`exam` 为知识库
- `book`：章节结构
- `notes`：各节内容

复制一份改掉这几项，重新构建即可出现在书架上。

## 构建

```bash
python3 scripts/build.py
python3 scripts/verify.py
```

`build.py` 读取 `src/` 与 `packs/` 下的全部内容包，生成 `index.html`。`verify.py` 依赖 sympy，用于校验例题的符号计算结果。

## 数据

存于 localStorage 与 IndexedDB，不跨设备同步。说明面板可导出 JSON 备份，并在其他设备恢复。

## AI

仅四级的批改调用模型。接口地址与 key 存于本机，请求直连所填地址；其余功能离线可用。

## 许可

MIT。封面所用的 Great Vibes 字体以 SIL Open Font License 1.1 授权，原文见 `fonts/OFL-GreatVibes.txt`。
