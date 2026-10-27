# TubeScribe

[English](README.md) | [简体中文](README.zh-CN.md)

> **本分支的改动。** TubeScribe 基于
> [zarazhangrui/youtube-digest](https://github.com/zarazhangrui/youtube-digest)
> 二创，新增四件事：逐字稿自动跟随视频播放、中文默认全译、界面中英切换、一键把逐字稿发到
> Notion 或得到笔记；同时在 Windows 和 macOS 上都不再依赖 bash。具体改了什么、为什么改，见
> [FORK.md](FORK.md)。

第一次安装？**[INSTALL.md](INSTALL.md)** 里有 Windows 和 macOS 的一句话安装命令，
以及要填进 `chrome://extensions` 的准确路径。想把安装直接交给 AI Agent（豆包、
WorkBuddy、Codex、Claude 都可以），复制 **[AGENT-INSTALL.md](AGENT-INSTALL.md)**
里那段提示词即可。

把每个 YouTube 视频变成一份可以深入学习的资料。TubeScribe 把字幕、双语翻译、AI 概览、内容讲解和时间戳笔记放进同一个 Chrome 侧边栏，让你可以持续学习视频中的知识和语言，同时不丢失原视频上下文。

- 把零碎字幕变成清晰、可搜索的学习资料。
- 查看原文、简体中文翻译，或中英双语对照字幕来学习语言。
- 通过 AI 概览、章节、重点引用和选中文本讲解建立系统理解。
- 点击字幕、概览或笔记中的时间戳，快速跳转到对应位置。
- 保存自动润色的时间戳笔记，方便之后复习。
- 使用自己的 API Key，数据保存在本地 Chrome 中，不包含分析统计或行为追踪。

TubeScribe 是一个需要自行提供 API Key 的开源项目，通过 GitHub 安装。目前没有上架 Chrome 应用商店，不赠送 API 额度，也没有开发者运营的服务器。

点击查看演示和教学视频（小白友好）：[https://www.bilibili.com/video/BV1dnuq6dEak/](https://www.bilibili.com/video/BV1dnuq6dEak/)

![YouTube Digest 双语演示](YouTube%20Digest%20demo%20bilingual.png)

## 本分支新增（v1.3.0）

- 逐字稿自动跟随视频播放，切换语言模式后重新回到当前朗读位置。
- 中文默认全译；想保留英文技术词，设置里一个开关即可。
- 界面可以在英文与简体中文之间切换。
- 一键把逐字稿发到 Notion 或得到笔记。
- Windows 与 macOS 都不依赖 bash：`npm test`、`npm run check`、`npm run package` 全部用 Node。

## 安装（大约 2 分钟）

不需要构建步骤，也不上架商店。你只需要 [Git](https://git-scm.com/download) 和 [Node.js 20 或更高版本](https://nodejs.org)，，Node 只用于自检脚本，扩展本身没有任何依赖。

**第 1 步：把项目复制到本地。** 先想好它要长期放在哪里，然后执行一条命令。

Windows（PowerShell）：

```powershell
git clone https://github.com/Tianliang3542/TubeScribe.git "$HOME\Documents\tube-scribe"; cd "$HOME\Documents\tube-scribe"; node scripts/doctor.mjs
```

macOS / Linux：

```bash
git clone https://github.com/Tianliang3542/TubeScribe.git ~/Documents/tube-scribe && cd ~/Documents/tube-scribe && node scripts/doctor.mjs
```

命令最后会打印出第 2 步要用的**准确文件夹路径**。如果出现任何 `[fail]`，先解决再继续。

**第 2 步：在 Chrome 里加载它。**

1. 地址栏打开 `chrome://extensions`
2. 打开右上角的**开发者模式**
3. 点击**加载已解压的扩展程序**
4. 把上一步打印的路径粘贴进选择框，回车

**粘贴路径，不要一层层点文件夹**，，选错上级目录会提示「找不到 manifest 文件」。装好之后不要再移动或改名这个文件夹，否则扩展会失效，需要重新加载一次。

**第 3 步：填两把 Key。** 点 TubeScribe 图标打开侧边栏 → **Settings** → 粘贴：

| Key | 用途 | 申请地址 |
| --- | --- | --- |
| Supadata API Key | 获取字幕 | [dash.supadata.ai](https://dash.supadata.ai/auth/sign-up) |
| DeepSeek API Key | 概览、翻译、讲解 | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |

Key 只填在这两个输入框里。不要放进聊天、源代码或截图。

**第 4 步：第一次使用。**

1. 打开一个普通视频：`https://www.youtube.com/watch?v=...`（Shorts、直播、会员限定视频不支持）
2. 点 TubeScribe 图标，等侧边栏把字幕抓下来
3. 把面板右上角切到 **双语**，中文会随阅读逐行填上
4. 点任意时间戳可以跳到那一刻；选中任意一句可以「讲解」或存成带时间戳的笔记
5. 可选：填好设置页凭据后，点逐字稿工具条上的 **Notion** 或 **GetNote**，把逐字稿直接发进知识库

**想让 AI Agent 帮你装？** 复制 **[AGENT-INSTALL.md](AGENT-INSTALL.md)** 里那段提示词。
更详细的说明、更新方法和排错：**[INSTALL.md](INSTALL.md)**。

## 更新

```bash
cd <你克隆的那个文件夹>
git pull
```

然后回到 `chrome://extensions`，在 TubeScribe 卡片上点 **重新加载**，再刷新已打开的 YouTube 页面。
已解压的扩展不会自动更新。


## 设置 API Key

TubeScribe 需要你在自己的服务账号中准备两个 Key：

1. **Supadata API Key**，用于获取 YouTube 字幕。
2. **DeepSeek API Key**，用于生成概览、讲解内容、翻译和自动润色笔记。

### 获取 Supadata API Key

1. 打开 Supadata 官方[注册页面](https://dash.supadata.ai/auth/sign-up)。
2. 创建账号并完成简短的新手引导。
3. Supadata 会在新手引导过程中自动生成 API Key。
4. 之后可以随时打开 [Supadata 控制台](https://dash.supadata.ai/)查找或管理 Key。
5. 复制 Key，并粘贴到 TubeScribe 设置中的 **Supadata API key**。

如果页面流程发生变化，请查看 [Supadata 官方文档](https://docs.supadata.ai/)。

### 获取 DeepSeek API Key

1. 打开 DeepSeek 官方 [API Keys 页面](https://platform.deepseek.com/api_keys)。
2. 按照提示登录，或创建 DeepSeek 开放平台账号。
3. 点击 **Create new API key**，填写容易识别的名称，例如 `TubeScribe`，然后创建 Key。
4. 立即复制 Key。完整 Key 可能只会显示一次。
5. 把 Key 粘贴到 TubeScribe 设置中的 **DeepSeek API key**。
6. 如果 DeepSeek 提示余额不足，请在 DeepSeek 开放平台账号中充值后再试。

当前账号和接口说明请查看 [DeepSeek 官方 API 文档](https://api-docs.deepseek.com/)。

在侧边栏中打开 **Settings**。你也可以在 `chrome://extensions` 的 TubeScribe 卡片中打开扩展选项。Key 只能粘贴到这些设置输入框中。不要把 Key 发送到 AI 对话、项目文件、截图或公开消息中。

发布版本只支持 DeepSeek V4 Flash：

```text
Base URL: https://api.deepseek.com
Model: deepseek-v4-flash
```

TubeScribe 会让所有 DeepSeek 请求使用非思考模式，以获得更快、更稳定的交互。设置中的接口地址和模型固定，只需要填写 DeepSeek API Key。如果想使用其他服务或模型，请在设置中复制安全的自定义 prompt，让编程 Agent 修改你自己的本地副本。不要把任何 API Key 放进 prompt 或对话。

API Key 和设置保存在你设备上的 Chrome 扩展本地存储中。发布包不会包含或使用 `config.js`。

## 使用 TubeScribe

1. 打开一个有字幕的普通 YouTube 视频页面。
2. 点击 TubeScribe 扩展图标，打开侧边栏。
3. 阅读带时间戳的字幕，或选择 **Original**、**中文**、**双语**。
4. 打开 **Overview**，查看 AI 生成的章节和重点引用。
5. 选中字幕，获取 AI 内容讲解。
6. 从播放器或重点引用中保存笔记，之后可以在 **Notes** 中查看。

## 当前支持范围

- Chrome 116 或更高版本。
- 标准的 `youtube.com/watch` 视频页面。
- Supadata 能够返回的原生字幕。TubeScribe 会优先请求英文字幕，也可能显示其他可用的原生语言。
- 原文、简体中文和双语对照字幕。
- AI 概览、选中文本讲解、翻译和自动润色笔记。
- 本地笔记，以及最近字幕、概览和翻译的本地缓存。
- 发布版本的所有 AI 功能都使用 DeepSeek V4 Flash。其他服务需要修改本地代码，不属于发布版本的支持范围。

Shorts、直播、私密视频、受访问限制的视频，以及没有原生字幕的视频可能无法使用。目前没有测试 Firefox、Safari、移动浏览器或其他 Chromium 浏览器。

TubeScribe 强制使用 Supadata 的 `mode=native`，不会在没有原生字幕时请求 AI 生成转录，也不会在本地转录音频。

## Supadata 免费额度和请求成本

截至 2026 年 8 月 9 日，[Supadata 价格页面](https://supadata.ai/pricing)显示免费版每月提供 **100 credits**，不需要信用卡，未使用的额度不会结转。价格可能变化，使用前请查看最新页面。

[Supadata 字幕接口文档](https://docs.supadata.ai/get-transcript)说明了不同模式的计费方式：

- 获取一次原生字幕消耗 **1 credit**，与视频时长无关。
- AI 生成字幕每分钟消耗 **2 credits**。TubeScribe 不会使用这条路径，因为它强制使用 `mode=native`。
- 如果没有可用原生字幕并返回 HTTP `206`，仍会消耗 **1 credit**。

按照当前只获取原生字幕的方式，如果每次请求都成功，免费版每月大约可以查询 100 个视频。重试和没有字幕的查询也会消耗额度，所以实际成功数量可能更少。

DeepSeek 的额度与 Supadata 分开计算。TubeScribe 不收款，也不转售 API 服务。建议为两个账号设置消费上限并定期查看用量。

## DeepSeek V4 Flash 价格

截至 2026 年 8 月 27 日，DeepSeek 官方[价格页面](https://api-docs.deepseek.com/quick_start/pricing/)列出的每 100 万 token 美元价格如下：

| Token 类型 | 非高峰 | 高峰 |
| --- | ---: | ---: |
| 缓存命中输入 | $0.007 | $0.014 |
| 缓存未命中输入 | $0.22 | $0.44 |
| 输出 | $0.66 | $1.32 |

高峰时段为周一至周五 UTC 01:00–04:00 和 06:00–10:00，其他时间使用非高峰价格。

一个实测的 20 分钟英文视频使用约 **32,600 个输入 token**，并在 43 个小批次中产生约 **3,500 到 4,500 个输出 token**。按当前价格，完整翻译该视频的费用约为：

- **非高峰：$0.003 到 $0.010 USD**。
- **高峰：$0.005 到 $0.020 USD**。

低值假设大部分重复输入命中 DeepSeek 缓存，高值假设输入未命中缓存。翻译按需执行并复用缓存，只翻译部分视频时费用会更低。使用前请查看官方页面确认最新价格。

## 用编程 Agent 改造成自己的版本

这是一个个人 Remix 项目，不接受上游 Issue 或 Pull Request。如果功能出错，或者你想增加新功能，请下载或 Fork 自己的副本，再让你的编程 Agent 帮你修复、改造和个性化。

TubeScribe 使用原生 HTML、CSS 和 JavaScript，没有构建步骤，很适合用编程 Agent 做个人项目。你可以尝试：

- 增加更多翻译语言，并让每个人选择自己的学习语言。
- 为课程、访谈、教程、测评或研究视频增加自定义总结模板。
- 增加生词本，保存单词、原句、解释和视频时间戳。
- 把笔记和生词导出到 Markdown、CSV、Anki 或其他学习工具。
- 增加个人主题筛选，只突出与你目标相关的章节。
- 增加本地模型选项，获得不同的隐私和成本方案。
- 改善键盘操作、字体大小和高对比度等无障碍体验。

请让 Agent 保留用户自带 API Key 的模式，不要把秘密写入源代码，并运行下方检查。分享自己的版本前，也要在真实视频上测试。

如果想使用其他 AI 服务或模型，请先在编程 Agent 中打开 Chrome 通过“加载已解压的扩展程序”使用的那个准确的 TubeScribe 项目文件夹。然后打开 TubeScribe 设置并点击 **Copy customization prompt**。发送前替换 `[PROVIDER]` 和 `[MODEL]`，但不要加入任何 API Key。Agent 完成本地代码修改后，请你自己在它指出的设置位置填写 Key。

## 隐私和数据流向

TubeScribe 会直接从扩展向服务商发送请求：

1. 把标准化的 YouTube 视频地址发送给 Supadata，用于获取原生字幕。
2. 当你使用 AI 功能时，把字幕和相关视频信息发送给 DeepSeek。
3. 翻译或讲解等功能只发送当前需要的内容，例如选中的文本和上下文，或少量字幕分段。
4. API Key、设置、笔记和最近缓存保存在 Chrome 本地。

TubeScribe 没有账号系统、广告、分析统计或行为追踪。Supadata 和 DeepSeek 仍会按照各自的条款和隐私政策处理数据。详情请查看 [PRIVACY.md](PRIVACY.md)。

## 常见问题

### YouTube 视频页面没有显示 Digest 按钮

- 在 `chrome://extensions` 中找到 TubeScribe，点击“重新加载”，然后刷新 YouTube 页面。
- 确认当前页面是标准 `https://www.youtube.com/watch?...` 页面，而不是 Shorts、嵌入页面或直播页面。
- 当前版本会在 YouTube 响应式操作栏变化时自动重新定位按钮。页面加载完成后可以稍等片刻。
- 如果你使用的是较早下载的版本，可以先横向调整一次 YouTube 窗口宽度让按钮出现，然后下载最新版，这样之后不再需要调整窗口。
- 如果按钮仍然没有出现，让你的编程 Agent 在这个具体视频页面检查 content script。

### 侧边栏无法打开

- 确认你打开的是标准 `https://www.youtube.com/watch?...` 页面。
- 在 `chrome://extensions` 中确认 TubeScribe 已启用，并点击“重新加载”。
- 重新加载扩展后，刷新 YouTube 页面。
- 如果问题仍然存在，让你的编程 Agent 检查扩展。

### TubeScribe 提示需要设置

- 打开 **Settings**，保存 Supadata Key 和 DeepSeek Key。
- 发布版本固定使用 DeepSeek V4 Flash，没有需要填写的 Base URL 或 Model 字段。
- 如果设置提示旧的自定义服务已移除，请重新填写 DeepSeek Key。旧 AI Key 已安全清除，避免被错误用于 DeepSeek。

### 找不到字幕

- 确认视频是公开的，并且有原生字幕。
- 检查 Supadata Key、剩余额度、限速和账号状态。
- 没有字幕的查询和手动重试也可能消耗额度。

TubeScribe 不会自动改用 AI 生成字幕。

### AI 请求失败

- `401` 或 `403` 通常表示 DeepSeek Key 或账号权限有问题。
- `429` 通常表示达到了 DeepSeek 服务限速或消费上限。
- 确认 Key 来自上方链接的 DeepSeek 开放平台账号，并且账号有可用额度。
- 如果你把本地副本改成了其他模型，请再次使用设置中的自定义 prompt，让编程 Agent 检查本地实现。

不要在对话、截图或日志中分享 API Key、私密字幕或个人笔记。

## 给编程 Agent 的检查命令

修改项目后，让你的编程 Agent 运行：

```bash
npm test
npm run check
npm run package
```

Agent 还应该在 Chrome 中重新加载扩展，并测试多个真实 YouTube 视频。自动检查通过，不代表真实服务请求和 YouTube 交互一定正常。

## 开源许可

MIT，详见 [LICENSE](LICENSE)。
