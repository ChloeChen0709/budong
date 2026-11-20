# 不懂 budong

把大学课程收进一个地方：微积分是错题本，四级是知识点库，同一套代码承载两种形态。

两种用法并存：

- **网页版**（主）：https://chloechen0709.github.io/budong/ ，手机可用，登录后数据跟账号走
- **单文件版**：`index.html`，双击即用，完全离线，数据只在本机

## 功能

**书架**：多本书，内容包驱动，加一门课就是加一个 JSON。

**微积分（错题本）**

- 记题：公式键盘（分数、上下标、根号所见即所得）、相册选图、拍照识别、按关键词自动归节
- 薄弱点：按错因权重 × 重复次数算每节掌握度
- 复习：按错因间隔顺延，逾期天数直接标出
- 知识点：8 章 42 节，每节含概念、重点题型、例题（原书页图，可放大）、参考答案（折叠）、易错点
- 导出 PDF：只含内容，打印窗口里可存为 PDF

**四级备考（知识库）**

- 听力 / 阅读 / 写作 / 翻译 / 词汇五部分，顶部切换
- 词表类内容两列平铺，其余折叠展开
- 背单词：艾宾浩斯排程，不认识 4 小时回炉、模糊降级、认识移出词卡
- 生词本、已掌握可随时查看；每日目标可选；连续天数点进月历
- 写作与翻译的 AI 批改，提示词可改、可恢复默认

**通用**

- 触摸反馈：按下 0.1s 收缩、松手弹簧回弹、滑动可中断
- 数据：结构化存在 localStorage，附图与页面图走 IndexedDB
- 备份：JSON 导出/恢复，含错题、笔记、背词进度
- 登录：邮箱链接或 GitHub，登录后按书同步

## 目录

```
budong/
├── web/                 网页版（Vite + React + TS）
│   ├── src/
│   │   ├── data/        类型、内容包、存储、背词、同步
│   │   ├── lib/         数学排版、AI、OCR、打印、图片库、按压反馈
│   │   ├── components/  公式输入、裁剪、图片、讲解
│   │   └── views/       书架、知识点、错题、词汇、我的
│   └── scripts/         内容包同步
├── src/                 单文件版的源（template / style / script）
├── packs/               calculus.json、cet4.json
├── scripts/             build.py（单文件）、publish-web.sh（发布网页版）
└── index.html           单文件版产物
```

## 开发与发布

```bash
# 网页版
cd web
npm install
npm run dev            # 本地 http://localhost:5173
npm run build          # 产物在 web/dist

# 发布网页版（推 gh-pages，GitHub Pages 从这里取）
bash scripts/publish-web.sh

# 单文件版
python3 scripts/build.py
```

`packs/` 是唯一内容源，改完执行 `npm run packs` 同步进网页版。

## 内容包

一个 JSON 一本书：

- `id`：同时是本地存储命名空间
- `mode`：`course` 错题本，`exam` 知识库
- `book`：章节结构
- `notes`：每节的概念、重点题型、例题、答案页、易错点

节里加 `plain: true`，条目平铺成两列而不是折叠卡。

## 技术选型

| 层 | 选型 |
|---|---|
| 前端 | React 18 + TypeScript，Vite 构建 |
| 样式 | 原生 CSS，CSS 变量做令牌，无 UI 库 |
| 存储 | localStorage（结构）+ IndexedDB（图片） |
| 后端 | Supabase（Postgres + Auth），按书存快照 |
| AI | 用户自带 key，直连 OpenAI 兼容接口 |

## 已知限制

- 附图不上云，换设备看不到图（结构会同步）
- 同步是整本书快照覆盖，两台设备同时改同一本会后写覆盖先写
- 例题与答案是扫描页图片，不能搜索、不能复制文字
- Supabase 免费版 7 天不访问会暂停，后台点一下恢复

## 开发方式

代码由 AI 辅助生成，不是纯手写。

- 需求、功能取舍、内容校订、数据结构、视觉方向、验收与真机测试：本人
- 具体实现、构建脚本、迁移逻辑：AI 按上述约束生成
- 每轮改动由本人验收，指出具体位置与现象后修改

注释里记的多是决策理由：图片为何放 IndexedDB、同步为何用整本快照、空掉的节为何从内容包回填。这些取舍来自实际使用中遇到的问题。

## 许可

MIT。封面的 Great Vibes 字体以 SIL Open Font License 1.1 授权，见 `fonts/OFL-GreatVibes.txt`。
