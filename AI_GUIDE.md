# AI 接手指南：日序

更新日期：2026-11-20
適用分支：`main`
專案：<https://github.com/winebowl0516/calendar>

## 接手時先讀

1. 本文件：掌握目前已完成內容、限制與待辦。
2. [`HANDOFF.md`](HANDOFF.md)：部署狀態、環境設定與 API 速查。
3. [`PRD.md`](PRD.md)：產品需求及仍待決定的規則。
4. [`index.html`](index.html)：目前的單頁前端及登入／同步流程。
5. [`sync-client.js`](sync-client.js)：本機與雲端行程資料正規化、合併工具。
6. `cloudflare/worker/src/index.js`、`wrangler.jsonc`、`migrations/0001_initial.sql`：同步 API、部署設定與資料表。

## 專案目前狀態

- 這是手機優先的個人行程管理應用，前端以單頁 HTML/CSS/JavaScript 實作，GitHub Pages 網址為 <https://winebowl0516.github.io/calendar/>。
- Google 登入使用 Firebase Authentication；LINE 登入使用 LINE LIFF。
- 登入後行程資料可透過 Cloudflare Worker 同步至 D1；Worker 為 `daily-sequence-sync`，網址見 `HANDOFF.md`。瀏覽器本機資料用作快取及首次遷移來源。
- 寵物、代幣、家具、食物及照片仍只存於本機，不會跨瀏覽器同步。
- Worker 支援 `GET/PUT /api/data` 與 `POST /api/link`。資料以登入提供者及使用者識別碼隔離；`PUT` 使用 revision 樂觀鎖；跨裝置刪除以 tombstone 合併。
- 前端尚無 Google／LINE 帳號連結介面。Worker 雖有 `/api/link`，不可因此假設使用者已能連結帳號。
- 專案沒有獨立建置或自動測試流程。變更後依適用情境手動驗證，尤其注意登入、資料遷移、離線、衝突和 GitHub Pages 子路徑。

## 尚未完成／需確認

### P0：確認現有同步正式環境

- 手動以 Google 和 LINE 各登入一次，確認首次同步、行程新增／編輯／完成／刪除及另一瀏覽器載入結果。
- 驗證登出後使用者資料不會顯示給下一位使用者；檢查初次遷移只把舊本機資料交給正確帳號。
- 驗證離線與 Worker 失敗時狀態訊息清楚、變更不會靜默遺失；檢查 revision 409 衝突會合併或明確提示。
- 確認 GitHub Pages 與 Worker 的正式部署設定一致。Worker 的 `ALLOWED_ORIGIN` 必須是 `https://winebowl0516.github.io`（Origin 不含 `/calendar/` 路徑）。不得將密碼、私鑰或 API token 寫入版本庫。

### P1：完成帳號連結

- 在前端加入明確的 Google／LINE 帳號連結及解除前置提示流程，呼叫 `POST /api/link`。
- 告知使用者連結會合併兩邊既有行程；處理 API 失敗、已連結身分及合併後前端 revision／本機快取更新。
- 手動測試先 Google 後 LINE、先 LINE 後 Google、兩邊都有資料、重複連結及合併文件超過大小限制。

### P1：寵物與產品規則

- 產品負責人尚未確認寵物飢餓速度（每小時 -2）、歸零狀態文字及復原方式、任務代幣與商店價格。決策前保留可復原行為，不要永久刪除寵物或資料。
- PRD 新增的場景需求包括隨機漫遊、家具拖曳及座標保存、預設／自訂背景；逐項核對 `index.html`，若尚未實作應列入工作，不可把 PRD 當成完成證明。
- 照片與背景使用本機儲存，需留意容量錯誤與圖片隱私；目前不應把寵物資料加入行程同步文件，除非產品需求與資料格式一併更新。

### P2：維護性與安全性

- `index.html` 內仍有過時註解聲稱 Firebase 設定與 Worker URL 是待填佔位值；實際設定已存在。更新時修正註解，避免後續 AI 誤判。
- 檢查同步錯誤、D1 寫入競態及首次帳戶建立併發行為；不要在錯誤時靜默覆蓋雲端或本機資料。
- 規劃資料匯出／刪除及雲端行程保留政策；PRD 目前只有概略隱私描述。
- 改善可及性與 reduced-motion、狹窄手機版互動，並維持 GitHub Pages `/calendar/` 相對資源路徑。

## AI 修改守則

- 優先維持現有單頁架構；大型重構前先說明必要性。
- 行程同步範圍目前只有 `entries` 與其 tombstones。寵物資料 `pet` 欄位雖在 Worker 文件結構中保留，現有前端刻意只同步行程，不應自行擴大同步範圍。
- 保留每筆安排的穩定 `id`、`updatedAt` 與刪除 tombstone；不可用整份覆蓋方式抹除其他裝置資料。
- `409 Revision conflict` 必須依最新雲端版本重新合併並重試，或向使用者清楚報錯；不可丟棄其中一側變更。
- `sync-client.js` 與 Worker 各自有文件正規化／合併邏輯。任何合併規則修改都要保持兩端一致。
- 不要把任何 secret 放在前端、`wrangler.jsonc` 的明文 secret 欄位或文件中。前端 Firebase Web 設定及 LIFF ID 屬公開設定；Worker 驗證與 D1 隔離仍需保持。
- 若需求或實際部署狀態改變，完成後同步更新本指南、`HANDOFF.md` 與 `PRD.md`，區分已實作、已部署、已驗證三種狀態。

## 交付前確認

- 列出實際改動檔案及未完成項目。
- 依工作性質手動檢查登入提供者、同步與手機版；沒有測試流程時如實說明，不要宣稱未執行的驗證已通過。
- 確認文件中的 Worker URL、GitHub Pages URL、Origin、資料同步範圍及部署狀態與程式一致。
