# AI 接手指南：日序

更新日期：2026-11-20

## 本專案目前範圍

目前只維護四項功能：空白行事曆、Google 登入、Firebase Firestore 帳號資料，以及 Gemini 行事曆助理。新使用者不可收到預填行程。不要加入 LINE 登入、寵物、代幣、商店或任務遊戲化功能，除非使用者之後重新提出。

## 主要檔案

- `index.html`：日曆介面、Google Firebase Authentication、Firestore 同步、行程 CRUD 及 Gemini 助理介面。
- `sync-client.js`：行程文件正規化、跨裝置合併及刪除 tombstone。
- `firestore.rules`：Firestore 帳號文件存取限制。
- `cloudflare/worker/src/index.js`：舊 D1 資料匯入 API；Gemini 改由 Firebase AI Logic 呼叫。
- `cloudflare/worker/wrangler.jsonc`：Worker 名稱、公開設定及 D1 綁定。

## 實作守則

- 新使用者的行程清單初始為空；不得加入示範資料或登入時自動產生的行程。
- 使用 Firebase UID 作為 `accounts/{uid}` 文件 ID，僅在 Firestore 保存已驗證帳號的資料。
- 行程保留穩定 `id`、`updatedAt` 與刪除 tombstone；以 `mergeSyncDocuments` 合併多裝置資料，不要整份覆蓋遠端文件。
- 舊 Firestore payload 可能包含額外欄位。只改行程時需保留其他欄位，以免舊資料遭到無意刪除。
- Gemini 使用 Firebase AI Logic Gemini Developer API 與 `gemini-3.8-flash`；前端須設定 Firebase App Check reCAPTCHA Enterprise site key。
- Firebase AI Logic 僅允許通過 App Check 的 Firebase app 呼叫；模型輸出需在前端驗證並限制為允許的行事曆操作。
- Gemini 提出的新增、修改、刪除都須由使用者在前端逐項確認，再由前端寫入 Firestore。自然語言不能直接觸發資料異動。
- 不要在助理端點接受任意模型、任意 URL 或任意網站工具呼叫。
- 新資料直接同步到 Firestore；舊 `/api/data` 僅可用於首次遷移既有 D1 資料。
- 保留 GitHub Pages `/calendar/` 子路徑相容性及既有 Firebase 設定。

## 交付時

- 說明 Firebase AI Logic 已啟用、App Check Web app 已註冊；區分程式碼、服務設定與網站發佈狀態。
- 區分程式碼已加入、服務已部署及實際登入驗證三種狀態。
- 專案目前沒有自動測試或建置流程；不得宣稱未執行的驗證已通過。
