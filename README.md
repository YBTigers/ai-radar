# AI 雷达（现有网页原型）

这是从现有 ChatGPT 网页原型整理出的静态网站文件，没有重新开发。

## 文件
- `index.html`：网站页面与交互。

## 第二阶段：官方新闻来源
- `api/news.js`：在 Vercel 服务端读取 OpenAI News 与 Google AI 官方 RSS；不需要 API 密钥。
- `live-news.js`：把官方动态与常青学习示例分开展示，显示来源、原文链接和发布时间。
- RSS 暂不可用时显示空状态，不用演示内容填充；当前未接入公开模型评测数据，因此不展示排行榜分数或名次。
- 接入的官方来源：`https://openai.com/news/rss.xml`、`https://blog.google/innovation-and-ai/technology/ai/rss/`。

## 部署到 Vercel
1. 将 `index.html` 上传到 GitHub 新仓库的根目录。
2. 在 Vercel 中选择 Add New / Project，导入该 GitHub 仓库。
3. Framework Preset 选择 Other（若自动识别为静态页面也可保持默认）。
4. Build Command 留空，Output Directory 留空或使用默认值，然后 Deploy。

注意：页面目前明确标记为原型，新闻与排行榜是演示数据，尚未接入实时源。
