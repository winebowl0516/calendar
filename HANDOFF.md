# 日序專案交接

更新日期：2026-11-20
GitHub：<https://github.com/winebowl0516/calendar>
目前分支：`main`

## 專案目標

「日序」是手機優先的個人行程與任務管理 Web 應用。現有前端提供月曆、每日安排、任務代幣、電子寵物、商店，以及 Google／LINE 登入。產品規格見 [`PRD.md`](PRD.md)。

## 目前狀態

- 前端是根目錄的單頁 [`index.html`](index.html)，由 GitHub Pages 發佈於 `https://winebowl0516.github.io/calendar/`。
- Google 登入由 Firebase Authentication 提供；LINE 登入由 LINE LIFF 提供。
- 登入後，行程新增、編輯、刪除及完成狀態會同步到 Cloudflare D1；本機 `localStorage` 作為離線快取與首次資料遷移來源。寵物、代幣、物品與圖片仍只存在本機。
- Cloudflare Worker `daily-sequence-sync` 已部署於 <https://daily-sequence-sync.matt05161997.workers.dev>，並綁定 D1 資料庫 `daily-sequence-data`（`DB`）。`account_data` 與 `identities` 資料表由 migration 建立。
- 同步 API 以 Firebase Google ID token 或 LINE LIFF access token 驗證；D1 依登入提供者與使用者識別碼隔離資料。前端和 Worker 各自有同步實作，相關檔案：[`sync-client.js`](sync-client.js)、[`cloudflare/worker/src/index.js`](cloudflare/worker/src/index.js)、[`cloudflare/worker/wrangler.jsonc`](cloudflare/worker/wrangler.jsonc)、[`cloudflare/worker/migrations/0001_initial.sql`](cloudflare/worker/migrations/0001_initial.sql)。
- 尚未提供 Google 與 LINE 帳號連結 UI；Worker 有 `POST /api/link`，但前端未呼叫。工作分支為 `main`，遠端為 `origin`。

## 下一步工作（建議依序）

1. **完成前端發佈與手動確認**：推送前端更新到 `main` 後，在 GitHub Pages 使用 Google 與 LINE 登入，確認同步狀態顯示「行事曆已同步」，並確認建立、修改、刪除及完成狀態會在另一個瀏覽器載入。未登入時 API 不可存取資料。
2. **監看同步錯誤與容量**：Worker 單份文件上限約 1.7 MB；目前行程資料通常遠低於此上限。照片與自訂背景未上傳，仍存於本機。
3. **完成帳號連結流程**：`POST /api/link` 可合併 Google 與 LINE 身分，但前端尚未提供流程；上線前需清楚告知合併規則並處理兩邊既有資料。
4. **保持設定檔同步**：Cloudflare Dashboard 已配置 `DB` 綁定和 Worker 變數；部署 Worker 的程式碼維護時，`wrangler.jsonc` 也需保持一致。不要把密碼、API token 或其他私密憑證提交到 Git。

## API 與資料格式速查

- `GET /api/data`：以 Bearer token 及 `X-Auth-Provider: google|line` 驗證；回傳 `{ revision, data }`。
- `PUT /api/data`：送出 `{ revision, data }`；成功時 revision 遞增，版本過期回 `409` 並附最新資料。
- `POST /api/link`：主要身分用一般 Authorization；另一登入方式的 token/provider 放在 `X-Link-Token`、`X-Link-Provider`。
- Worker 資料格式：`{ entries: [], pet: null, entryTombstones: {}, petUpdatedAt: 0 }`。目前只有行程同步；`updatedAt` 與刪除 tombstone 用於衝突合併。
- Worker 限制單份文件約 1.7 MB。寵物照片與自訂背景仍儲存在本機，不會計入 Worker 文件。

## 重要注意事項

- Cloudflare Production 已設定 `FIREBASE_PROJECT_ID=daily-sequence`、`LINE_LOGIN_CHANNEL_ID=2012589296`、`ALLOWED_ORIGIN=https://winebowl0516.github.io`，並將 `DB` 綁定至 `daily-sequence-data`。設定均不是秘密值。
- `index.html` 含 Firebase Web App 設定與 LIFF ID（前端公開設定）；真正的秘密不可放在前端或提交到版本庫。
- PRD 含有待產品負責人確認的寵物飢餓速度、復原呈現及代幣平衡等假設，見第 13 節。
- 專案目前沒有獨立測試／建置流程。改動後至少手動走過登入及核心行程操作，再確認 GitHub Pages 與 Worker 部署結果。
