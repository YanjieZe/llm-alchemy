# 炼丹模拟器

一个手机端网页小游戏。你是一家 AI 公司的首席炼丹师，有 12 个月和 1000 卡·月算力，每个月遇到一件事并做出选择，最后打出 16 个结局之一。

线上地址：https://llm-alchemy.yanjieze.com

姊妹游戏：[你是几B的LLM](https://your-llm-param.yanjieze.com)（[repo](https://github.com/YanjieZe/your-llm-param)）

## 本地运行

单文件静态页面，没有构建步骤。在本目录起一个静态服务器：

```bash
python3 -m http.server 8766
```

然后打开 http://localhost:8766 。直接双击 `index.html` 也能玩，但部分浏览器在 `file://` 下会限制 localStorage。

## 修改事件和结局

数据和游戏逻辑都在 `index.html` 的 `/* DATA-START */` 和 `/* DATA-END */` 之间：

- `START`：初始数值。`TRAIN` 是每月自动变化的训练进度，`DECAY` 是老板耐心每月减少的量。
- `OPEN` / `REVIEW` / `LAUNCH`：第 1、6、12 个月的固定事件。
- `POOL`：随机事件池。其余 9 个月从这里抽，同一局里不重复。每个事件可以有：
  - `when`：出现条件
  - `w`：抽中权重
  - `hot`：显示成红色标签，并触发警报效果
  - `spike`：在 loss 曲线上画一个尖峰
- 选项的三种写法：
  - 固定效果：`{ o, fx, f, t }`
  - 概率判定：`{ o, p, win, lose }`，`p` 可以是函数
  - 按当前数值计算效果：`{ o, run }`
- `ENDINGS`：16 个结局，顺序就是结局收集格子的顺序。
- `final()`：结局的判定顺序，越靠前的优先级越高。

改完数值后跑一下模拟，确认每个结局都能出现：

```bash
node scripts/sim.js
```

## 音乐和音效

全部用 Web Audio 现场合成，没有音频文件。代码在 `Sound` 模块里：

- 和弦进行在 `CHORDS`，节奏在 `playStep()`。
- 老板耐心 ≤ 20 或算力 < 150 时，`mood` 变成 1，鼓点变密。
- 音效在 `fx()` 里，按名字区分。

浏览器要求用户先点一下才能出声，所以音乐从点「开炉炼丹」或右上角的音量按钮开始。

## 本地记录和统计

- 进行中的一局存在 localStorage 的 `lab-run-v1` 里，刷新后可以继续。
- 每局结束在 `lab-history-v1` 里记一条，结局收集进度从这里算。
- `API` 填上统计服务的地址后，每局会匿名上报：选择序列、结局和最终数值。上报带一个随机生成的访客 id，和 your-llm-param 共用同一个 key（`jib-llm-visitor`）。现在 `API` 是空字符串，不发送任何数据。

## 部署

GitHub Pages，从 `main` 分支根目录发布。自定义域名写在 `CNAME` 文件里，DNS 在 Cloudflare 上加一条 CNAME 记录：`llm-alchemy` → `yanjieze.github.io`。
