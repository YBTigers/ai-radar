# AI 雷达（现有网页原型）

这是从现有 ChatGPT 网页原型整理出的静态网站文件，没有重新开发。

## 文件
- `index.html`：网站页面与交互。

## 部署到 Vercel
1. 将 `index.html` 上传到 GitHub 新仓库的根目录。
2. 在 Vercel 中选择 Add New / Project，导入该 GitHub 仓库。
3. Framework Preset 选择 Other（若自动识别为静态页面也可保持默认）。
4. Build Command 留空，Output Directory 留空或使用默认值，然后 Deploy。

注意：页面目前明确标记为原型，新闻与排行榜是演示数据，尚未接入实时源。
