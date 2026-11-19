# 不懂 budong

一个**纯前端、零依赖、单文件即可运行**的大学课程学习库。

每门课一份内容包，书架上一本，各记各的：微积分按错题本用法，四级按知识点库用法，同一套代码承载两种形态。

> 双击 `index.html` 就能用，不需要安装、不需要服务器、不需要联网（除非要用 AI 批改）。

---

## 1. 它解决什么问题

一门课学完，材料散在 PDF、笔记、截图、错题纸里，期末回头找不着。这个项目要做的不是又一个笔记软件，而是**把一门课的全部材料收进一个能自己算账的东西**：

| 痛点 | 本项目的做法 |
|---|---|
| 错题抄了不翻，不知道哪一节最该补 | 按**错因权重 + 重复次数**算出每节掌握度，颜色越深越危险 |
| 英语没有"错题"可记，只有东西要背 | 四级走知识点库模式：词表直接摊开，单词按艾宾浩斯排期，认识的移出、不认识的回炉 |
| 写作翻译写完没人看 | 内置评分 Prompt，贴进去就能按四级标准批改，提示词可改 |
| 一门课一个笔记软件，最后找不到 | 内容包驱动的书架，加一门课就是加一个 JSON |

核心不是"把材料存下来"，而是**让每份材料知道自己什么时候该被再看一遍**。

---

## 2. 功能清单

**书架与内容包**

- 多本书，`PACKS` 驱动，每条目录、每个术语标签都来自内容包
- 两种形态：`course`（错题本）/ `exam`（知识点库），界面自动切换
- 加一门课＝往 `packs/` 放一个 JSON，不用改代码

**微积分（course）**

- 知识地图：按章 / 节网格展示掌握度
- 错题列表：按章节筛选、按错因分类、记录重复错误次数
- 复习调度：间隔重复，显示"逾期 N 天 / 今天 / N 天后"
- AI 讲题：贴题或拍照 → "错在哪 / 怎么做 / 怎么改"
- 拍照 OCR：先压缩再送视觉模型
- 公式键盘与轻量数学排版：∫ ∂ ∑ √ π θ 一键输入，分数上下分层

**四级备考（exam）**

- 五个部分：听力、阅读、写作、翻译、词汇
- 词表类内容平铺成两列，题目类内容折叠展开
- 背单词：艾宾浩斯排程，生词优先进队，认识的移出词卡
- 生词本 / 已掌握：随时回看，不参与背书流程
- 每日目标、连续天数、背诵月历
- 作文批改 / 翻译批改：默认提示词按阅卷标准写好，可改、可恢复

**通用**

- 本地存储 + 手动备份：结构化数据存 `localStorage`，图片存 `IndexedDB`，JSON 一键导出导入
- 超期未备份自动提醒：9 秒后自己淡出，不打断操作
- 打印 / PDF：四级导出全部知识点，微积分导出错题
- 纯离线：无 CDN、无埋点、无后端

---

## 3. 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 结构 | 原生 HTML5 | 单页应用，无框架，`src/template.html` 约 350 行 |
| 样式 | 原生 CSS3，约 960 行 | CSS 变量做设计令牌，Grid 做双栏，`@media print` 出打印版；字体 base64 内嵌 |
| 逻辑 | 原生 JavaScript，约 2120 行 / 90 个函数 | 无框架、无打包器，浏览器直接跑 |
| 持久化 | `localStorage` + `IndexedDB` | 图片不进 localStorage，避开 5MB 配额 |
| AI | `fetch` 调 OpenAI 兼容 `/chat/completions` | 适配 6 家厂商，只填域名，路径自动补全 |
| 构建 | Python 3 脚本 | 把 `src/` 与 `packs/` 拼成单文件 `index.html` |

**零依赖**：没有 `package.json`，不用 `npm install`。唯一的可选依赖是 `sympy`，只在校验例题时用。

---

## 4. 目录结构

```
budong/
├── src/
│   ├── template.html   # 页面骨架（约 350 行）
│   ├── style.css       # 全部样式与设计令牌（约 960 行）
│   ├── script-font.css # 封面字体的 base64
│   └── app.js          # 全部应用逻辑（约 2120 行）
├── packs/
│   ├── calculus.json   # 微积分：8 章 28 节，54 条例题
│   └── cet4.json       # 四级：5 部分 17 节，2184 条词条
├── scripts/
│   ├── build.py        # 构建：src + packs → index.html
│   └── verify.py       # 用 sympy 校验例题
├── fonts/              # 字体授权原文
├── index.html          # 构建产物，直接双击运行
└── README.md
```

`index.html` 是产物，改源码后必须重新构建。

---

## 5. 架构

### 5.1 分层

```
┌──────────────────────────────────────────────────────────┐
│  视图层  template.html + style.css                       │
│  书架 / 侧栏目录 / 知识地图 / 错题 / 复习 / 知识点 / 词卡   │
└────────────────────────┬─────────────────────────────────┘
                         │ 事件监听（68 处 addEventListener）
┌────────────────────────▼─────────────────────────────────┐
│  控制层  switchBook / openModule / goTab / openBook       │
│  统一入口：改 DB → save() → renderAll()                   │
└────────────────────────┬─────────────────────────────────┘
┌────────────────────────▼─────────────────────────────────┐
│  业务层                                                  │
│  classify()   题目 → 章节（规则 + 关键词）                 │
│  riskOf()     错因权重 × 重复次数                          │
│  masteryOf()  风险 → 掌握度 0.05~1                        │
│  vocabDue()   艾宾浩斯 → 今日队列                         │
│  renderMath() 数学记号 → 排版 HTML                        │
└────────────────────────┬─────────────────────────────────┘
┌────────────────────────▼─────────────────────────────────┐
│  数据层                                                  │
│  DB（内存态）⇄ localStorage ⇄ IndexedDB                   │
│  PACKS 内容包（只读种子）                                  │
│  PROVIDERS 厂商配置 → fetch → 大模型                      │
│  buildBackup / restoreFrom（JSON 导出导入）               │
└──────────────────────────────────────────────────────────┘
```

### 5.2 数据流

```
用户操作 → 事件回调 → 改内存里的 DB → save() 落盘
                                    └→ renderAll() 重绘
```

没有双向绑定，没有虚拟 DOM。状态只有一个全局 `DB`，任何改动后统一全量重绘。几百条数据的量级下这个策略够快，换来的是「界面为什么这样，看 `DB` 就知道」。

### 5.3 核心数据结构

```js
// 全局状态（每本书一份，存 budong.v1.<bookId>）
let DB = {
  bookId: "cet4",
  book:   { chapters: [{ no, title, sections: [{ id, title, kw }] }] },
  items:  [{ id, sec, cause, due, lapses, q, img, demo }],   // 只有 course 用
  notes:  { "2.2": { concepts, types, examples, plain } },
  srs:    { "w:peril": { stage, seen, due, mastered } },      // 只有 exam 用
  vocabDay: { "2026-11-19": 12 },
  vocabGoal: 30,
  contentVer: "9ecf1c"
};

// 内容包（只读种子，packs/*.json）
const PACKS = [{ id, name, tagline, mark, labels:{toc,unit,sec,ex},
                 mode: "course" | "exam", book:{...}, notes:{...} }];

// 厂商配置：只填域名，路径自动补
const PROVIDERS = {
  "api.deepseek.com":       { path:"/chat/completions",            model:"deepseek-chat",  vision:"..." },
  "api.openai.com":         { path:"/v1/chat/completions",         model:"gpt-4o-mini",    vision:"gpt-4o" },
  "open.bigmodel.cn":       { path:"/api/paas/v4/chat/completions",model:"glm-4-flash",    vision:"glm-4v" },
  "dashscope.aliyuncs.com": { path:"/compatible-mode/v1/chat/...", model:"qwen-plus",      vision:"qwen-vl-max" },
  "api.moonshot.cn":        { path:"/v1/chat/completions",         model:"moonshot-v1-8k", vision:"...-vision-preview" },
  "api.siliconflow.cn":     { path:"/v1/chat/completions",         model:"Qwen/Qwen2.5-7B-Instruct", vision:"..." }
};
```

---

## 6. 值得展开的 5 个设计

### 6.1 一本书两种形态

四级没有"错题"可记，硬套错题本会变成空壳。所以内容包多了一个 `mode` 字段：

- `course`：左栏是章节树，主区是薄弱点 / 错题 / 复习 / 知识点四个页签
- `exam`：左栏只列当前部分的小节，主区换成听力 / 阅读 / 写作 / 翻译 / 词汇五个部分

两套形态共用同一份渲染与存储代码，只在 `isExam()` 处分叉。加一门课选好模式，界面自动对上。

### 6.2 掌握度：不是数错题数量

```js
riskOf(sec)    = Σ ( 错因权重 CM[cause].w × (1 + 0.35 × lapses) )
masteryOf(sec) = clamp( 0.55 ^ riskOf(sec), 0.05, 1 )
levelOf(sec)   = mastery < 0.45 ? 高 : < 0.75 ? 中 : 低
```

三个设计点：

1. **错因分权重**——"不会" 1.0、"审题" 0.7、"算错" 0.5，严重程度不同；
2. **重复犯错递增惩罚**——同一节错第二次，风险乘 1.35；
3. **指数衰减**——`0.55^risk` 让错误多了以后掌握度快速贴近 0，视觉上分层清楚。

### 6.3 背单词：毕业制 + 到点回炉

```js
EBB = [4, 24, 48, 96, 168, 360, 720]   // 小时：4h 1d 2d 4d 7d 15d 30d
```

- 「不认识」归零，并**在本轮末尾再出现一次**，不用等 4 小时
- 「模糊」降一级
- 「认识」直接毕业，移出词卡，只留在「已掌握」里可查

每轮从到期词与未学词里各抽一部分打乱，先到期后新词，一轮 20 个。进度写 `DB.srs`，按词记录等级与下次时间。

### 6.4 AI 接入：把 6 家厂商抹平成一次调用

`normalizeApiUrl()` 处理用户粘进来的畸形输入（缺协议、带尾斜杠、只粘了 Base URL、粘了厂商原生路径），按 hostname 查 `PROVIDERS` 补全成 OpenAI 兼容路径。

`explainApiFailure()` 把状态码和厂商错误体翻成一句可执行的话（"key 填错了" / "这个模型不支持图片"），而不是把 401 甩给用户。

批改的提示词不写死在代码里，放在弹窗内可编辑，`{{essay}}` 之类的占位符由输入框替换，改完存本地。

### 6.5 数据不能丢：三层防线

1. `save()` 每次变更写 `localStorage`，`try/catch` 兜住配额溢出
2. `buildBackup()` 导出完整 JSON（含图片与背词进度），`restoreFrom()` 按备份所属的书恢复
3. `nagBackup()` 检测超期未备份，9 秒自动淡出的提醒条，30 分钟内不重复

内容包升级时用 `contentVer` 指纹判断，新节合进来、目录一起刷新，用户手改过的节（`edited`）不动。

---

## 7. 怎么运行

```bash
# 方式一：双击
双击 index.html

# 方式二：本地静态服务（测 AI 接口更方便）
python3 -m http.server 8000
```

改源码后重新构建：

```bash
python3 scripts/build.py     # src + packs → index.html
python3 scripts/verify.py    # 校验例题（需 sympy）
```

---

## 8. 已知局限

- **全量重渲染**：数据上万条时 `renderAll()` 会有压力，需改增量渲染
- **无自动化测试**：只有 `verify.py` 校验例题，界面靠手工回归
- **单文件体积**：内嵌字体与全部内容包后约 440KB，没有代码分割
- **AI 输出未净化**：`esc()` 转义了用户输入，但模型返回内容直接渲染，应再加一层 sanitize
- **不能多设备同步**：只靠 JSON 备份手动搬运
- **无障碍不完整**：键盘导航与屏幕阅读器支持有限

## 9. 后续规划

- 补 `classify` / `riskOf` / `masteryOf` 的单元测试
- AI 输出加 sanitize，隔离模型返回的 HTML
- 增量渲染替换 `renderAll()` 全量重绘
- 更多课程内容包（线代、概率论、微观经济学）
- 打包成 PWA，支持离线安装

---

## 10. 开发方式说明

本项目的需求定义、内容整理、数据结构与交互方案、逐轮验收与真机测试由本人完成；具体代码在明确约束下由 AI 辅助生成，逐段 review 后合入。

代码里的中文注释说明**为什么这么做**（存储为何分两套、图片为何不进 localStorage、备份为何按书归属、迁移为何早于 load），这些取舍是本人在 review 中提出的。
