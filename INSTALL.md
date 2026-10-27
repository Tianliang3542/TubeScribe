# 安装与使用 · Install

整个项目没有构建步骤，安装就是「克隆 + 在 Chrome 里加载这个文件夹」。

## 一句话安装

**Windows（PowerShell）**

```powershell
git clone https://github.com/Tianliang3542/TubeScribe.git "$HOME\Documents\tube-scribe"; cd "$HOME\Documents\tube-scribe"; node scripts/doctor.mjs
```

**macOS / Linux**

```bash
git clone https://github.com/Tianliang3542/TubeScribe.git ~/Documents/tube-scribe && cd ~/Documents/tube-scribe && node scripts/doctor.mjs
```

自检脚本最后会打印一行**完整路径**，那行就是要填进 Chrome 的路径。它会顺带检查 Node 版本、核心文件、清单权限和换行符。

## 或者把这句话交给编程 Agent

> 把 https://github.com/Tianliang3542/TubeScribe.git 克隆到一个长期保留的文件夹（macOS/Linux 建议 `~/Documents/tube-scribe`，Windows 建议 `%USERPROFILE%\Documents\tube-scribe`，但先问我），运行 `node scripts/doctor.mjs`，然后告诉我准确完整路径，并指导我在 `chrome://extensions` 里用「加载已解压的扩展程序」选中它。

## 之后三步

1. Chrome 打开 `chrome://extensions` → 右上角打开 **开发者模式** → 点 **加载已解压的扩展程序** → 直接粘贴上面打印的路径（不要一层层点进去）。
2. 点工具栏的 TubeScribe 图标打开侧边栏 → **Settings** → 填 **Supadata API key** 和 **DeepSeek API key**。
3. 打开一个**有原生字幕**的 YouTube 视频 → 侧边栏 → 切到 **双语**。

⚠️ 这个文件夹**不要移动或改名**。移动后扩展会失效，需要重新加载一次。

## 可选：导出到知识库

设置页的「知识库导出」区块，两条都是可选的，不填也能正常用翻译。

**Notion**：在 <https://www.notion.so/my-integrations> 建一个内部集成 → 复制 Token → 把目标页面右上角「连接」里加上这个集成（不加会 403）→ 页面链接或 32 位 ID 都可以直接粘进来。

**得到笔记**：在 <https://www.biji.com/openapi> 创建应用，拿到 `gk_live_…`（API Key）和 `cli_…`（Client ID），两个都要填。需要**付费会员**，每日最多新建 1000 条笔记。

> 为什么不是「跳转授权」：得到笔记只提供静态 API Key，没有 OAuth；Notion 的 OAuth 需要公网回调服务器和公开应用审核，不适合本地自用扩展。这也是本项目坚持自己填 Token、不做跳转授权的原因：这两种凭据都不适合放进一个本地扩展的 OAuth 流程。

## 更新

```bash
cd <你克隆的文件夹>
git pull
```

然后到 `chrome://extensions` 点 TubeScribe 卡片上的 **Reload**，再刷新已打开的 YouTube 页面。已解压扩展不会自动更新。

## 排错

| 现象 | 原因与处理 |
|---|---|
| `git: command not found` | 装 Git：Windows <https://git-scm.com/download/win>，macOS `xcode-select --install` |
| `node: command not found` | 装 Node 20+：<https://nodejs.org> |
| 翻译时报 `Prompt section not found` | 旧版本的 Windows 换行 bug。本分支已修；`git pull` 后 Reload 即可 |
| 侧边栏一直没有内容 | 确认是 `watch?v=…` 的普通视频页（Shorts、直播、会员限定不支持），并在加载扩展后刷新过页面 |
| 点 Notion 没反应或报 403 | 集成没有添加到目标页面；到页面右上角「连接」里添加 |
| 得到笔记报 429 | 不是付费会员，或当日新建笔记超过 1000 条 |
