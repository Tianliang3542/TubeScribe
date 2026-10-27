# 交给 AI Agent 安装 · Agent install prompt

> **点代码块右上角的「复制」按钮**，整段发给 Agent 就行，不用手动框选。

适用于豆包 / WorkBuddy、Codex、Claude、Cursor、Cline 等任何能执行命令的 Agent。
它不需要预先了解这个项目。

## 中文版

```text
请帮我安装 TubeScribe 这个 Chrome 扩展。严格按顺序执行，每一步都验证结果，不要跳步：

1. 先问我：把项目克隆到哪个长期保留的文件夹？不要替我决定。如果我让你推荐，macOS/Linux 给 ~/Documents/tube-scribe，Windows 给 %USERPROFILE%\Documents\tube-scribe，但最终以我的选择为准。

2. 检查 git 和 node 是否可用，Node 需要 20 或更高。缺哪个就告诉我怎么安装，装好再继续。

3. 执行：git clone https://github.com/Tianliang3542/TubeScribe.git "<我选的路径>"。如果目标文件夹已经存在，先问我，不要覆盖。

4. 进入该目录运行：node scripts/doctor.mjs。把输出原样给我看；如果出现任何 [fail]，停下来先修，不要继续。

5. 把 doctor 打印的那个绝对路径原样告诉我，并说明后续操作：打开 chrome://extensions，打开「开发者模式」，点「加载已解压的扩展程序」，在选择框里直接粘贴这个路径并回车。不要让我一层层点目录，选错上级目录会报找不到 manifest。

6. 提醒我：这个文件夹之后不能移动或改名，否则 Chrome 里的扩展会失效。需要更新时在该目录执行 git pull，再回到 chrome://extensions 点扩展卡片上的 Reload。

7. 最后告诉我：需要在扩展的 Settings 页自己填写 Supadata API Key 和 DeepSeek API Key，并给出这两个 key 的申请地址。Notion 和得到笔记是可选导出，不填也能正常翻译。

约束：不要向我索要、也不要读取或写入任何 API Key；不要改动我已经在用的其他扩展文件夹；所有命令都在我选定的那个目录内执行。
```

## English version

```text
Install the TubeScribe Chrome extension for me. Follow these steps in order and verify each one before moving on:

1. Ask me which permanent folder to clone into. Do not choose one for me. If I ask for a suggestion: ~/Documents/tube-scribe on macOS/Linux, %USERPROFILE%\Documents\tube-scribe on Windows.

2. Check that git and node are available. Node must be 20 or newer. Tell me how to install whatever is missing, then continue.

3. Run: git clone https://github.com/Tianliang3542/TubeScribe.git "<the path I chose>". If that folder already exists, ask me first instead of overwriting it.

4. Run node scripts/doctor.mjs inside that folder and show me the output. Stop and fix any [fail] line before continuing.

5. Give me the absolute path that doctor prints, then explain: open chrome://extensions, enable Developer mode, click Load unpacked, and paste that exact path into the picker. Tell me not to click through folders, because selecting a parent folder fails with a missing manifest error.

6. Warn me that this folder must not be moved or renamed afterwards, and that updates are git pull in that folder followed by Reload on the extension card.

7. Finally, tell me to enter my own Supadata and DeepSeek API keys on the extension Settings page, with the sign-up links. Notion and GetNote export are optional and not required for translation.

Never ask me for API keys, never read or write them, never modify another extension folder I already use, and run every command inside the folder I picked.
```

## Agent 能做到 / 做不到的

| 步骤 | 自动 | 需要你亲手做 |
|---|---|---|
| 克隆、检查环境、跑 doctor | ✅ | |
| 告诉你准确路径 | ✅ | |
| Chrome 里「加载已解压」 | ⚠️ 只有能操作图形界面的 Agent 才行 | ✅ 通常需要你点三下 |
| 填 API Key | ❌ 不该代填 | ✅ 你自己粘贴 |

## 装完之后自检

```bash
cd <你选的文件夹>
node scripts/doctor.mjs
```

全部 `[ok]` 即可。然后打开一个**有原生字幕**的普通 YouTube 视频（`watch?v=…`），
点扩展图标打开侧边栏，切到「双语」，能看到中文译文就算成功。
