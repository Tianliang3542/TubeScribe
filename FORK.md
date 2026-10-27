# 二创说明 · Fork notes

基于 [zarazhangrui/youtube-digest](https://github.com/zarazhangrui/youtube-digest) v1.2.0 的个人二创。
A personal fork of YouTube Digest v1.2.0 (MIT).

## 这个版本改了什么

### 1. 逐字稿跟随视频自动滚动

原来的实现在三种情况下会误判成「用户手动滚动」并停止跟随：程序自身的平滑滚动、翻译逐条渲染造成的布局抖动、切换语言模式后的列表重建。因为你一旦在某个视频里滚动过，位置就被记住，下次进入该视频时跟随是**默认关闭**的。

现在：

- 默认跟随开启，只有**滚轮 / 触屏滑动**才算用户意图（滚动事件不再参与判断）。
- 切换「原文 / 中文 / 双语」导致列表重建后，自动回到当前朗读位置并恢复高亮。
- 想临时暂停并回看，滚动即可；底部 `Follow playback / 跟随播放` 按钮一键恢复。
- 默认值可在设置页「播放与翻译」里关闭。

### 2. 中文翻译补全

原版提示词明确要求 `AI`、`API`、`skill`、`builder`、`deck` 这类词保留英文，所以中文句子里会夹着没翻译的英文词。

现在默认**全译**：只保留人名、品牌、产品名、代码标识、命令、文件名和 URL；`plugin → 插件`、`dependency → 依赖`、`deploy → 部署`。

想回到旧行为，在设置页打开「技术词保留英文」即可，两套规则都在 `prompts/translation.md` 里，可自行修改。

### 3. 界面中英切换

- 新增 `i18n.js`，中英两套界面文案。
- 侧边栏右上角有语言按钮（`EN` / `中`），设置页有语言切换。
- 选择写入同一份设置，**面板和设置页永远一致**，不再各存一份。

### 4. 导出到 Notion / 得到笔记

逐字稿工具条上新增 `Notion` 和 `GetNote` 两个按钮，把当前显示的逐字稿（原文 / 中文 / 双语，取决于你选中的模式）以 Markdown 发到知识库。

- **Notion**：`POST /v1/pages`，填集成 Token + 目标页面 ID（可粘贴整条链接）。超过 100 个块会自动分批追加。
- **得到笔记**：`POST openapi.biji.com/open/api/v1/resource/note/save`，需要 `API Key` + `Client ID`（两者缺一不可），可选笔记本 ID。需要付费会员，每日最多新建 1000 条。
- 401 / 403 / 429 / 超时都会给出人能看懂的提示，不会把原始 JSON 甩给你。
- 密钥只存在本机 `chrome.storage.local`，不随仓库分发。

### 5. Windows / macOS 兼容

- **根因修复**：原版解析提示词的正则只认 `LF`，Windows 上 Git 默认把文件转成 `CRLF`，导致所有翻译报 `Prompt section not found`。现在加载时统一规范化，并且 `.gitattributes` 把文本文件锁成 `LF`。
- **脚本跨平台**：`npm test` / `npm run check` / `npm run package` 全部改为纯 Node（`scripts/check-release.mjs`、`scripts/package-extension.mjs`），不再依赖 `bash`、`zip`、`unzip`、`shasum`。打包用内置的最小 ZIP 写入器，无第三方依赖。

## 开发

```bash
node --test                 # 全部测试（87 个）
node scripts/check-release.mjs
node scripts/package-extension.mjs   # 产出 dist/youtube-digest-v*.zip
```

## 仍需注意

- 这是「已解压」扩展，**不会自动更新**。改完代码要在 `chrome://extensions` 点 **Reload**，再刷新 YouTube 页面。
- 不要把项目文件夹搬走或改名，否则 Chrome 会失去这个扩展。
- 得到笔记的开放接口需要付费会员；Notion 需要把集成添加到目标页面的「连接」里。
