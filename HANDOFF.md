# 日序專案交接

更新日期：2026-11-20
GitHub Pages：<https://winebowl0516.github.io/calendar/>
Firebase 專案：`daily-sequence`

## 目前需求

網站只提供以下功能：

1. 空白行事曆，可新增、修改、刪除及完成行程；首次使用不建立示範行程。
2. Google 登入，使用 Firebase Authentication。
3. 使用 Firebase Firestore 儲存各 Google 帳號的行事曆資料。
4. Gemini 行事曆助理，可依自然語句提出行程操作；每個新增、修改或刪除建議都由使用者確認後才會儲存。

## 實作與部署狀態

- 前端是根目錄的單頁 [`index.html`](index.html)，使用 GitHub Pages 發佈。
- Firebase Authentication 與 Firestore 使用公開 Web App 設定；Firestore 文件位於 `accounts/{Firebase Auth UID}`。
- Firestore 文件沿用 `schemaVersion`、JSON `payload` 與 `updatedAt` 格式。行程以 `entries` 與 `entryTombstones` 儲存；讀取舊文件時保留既有其他欄位。
- 安全規則位於 [`firestore.rules`](firestore.rules)，限制帳號只能讀寫自己的文件。
- Cloudflare Worker 位於 [`cloudflare/worker/src/index.js`](cloudflare/worker/src/index.js)，舊 `/api/data` 僅用於首次匯入既有 D1 行程；新行程直接同步至 Firestore。
- Gemini 由瀏覽器的 Firebase AI Logic SDK 呼叫 Gemini Developer API，模型為 `gemini-3.8-flash`，不使用 Worker API key。
- 前端先初始化 Firebase App Check（reCAPTCHA Enterprise、limited-use tokens），再初始化 Auth、Firestore 與 Firebase AI Logic。`index.html` 已填入公開 site key。
- Firebase AI Logic Gemini Developer API 已在 Console 啟用（Spark）；AI Monitoring 已關閉。Google Cloud reCAPTCHA Enterprise API 已啟用，並建立只允許 `winebowl0516.github.io` 的網站金鑰。App Check 已註冊至程式使用的 Web App；Google Cloud Billing 未啟用。

## 完成 Gemini 助理設定

1. 已完成：Firebase AI Logic 使用 Gemini Developer API。
2. 已完成：建立 GitHub Pages 網域專用的 reCAPTCHA Enterprise site key，並填入 `index.html`。
3. 已完成：App Check 已將金鑰註冊至程式使用的「日序網站新 Web App」，其餘較舊 Web App 未註冊。
4. 此版本已送交 `main`；GitHub Pages 部署完成後，仍需手動驗證登入、Firestore 同步與 Gemini 呼叫。

## 資料與 API

- Firestore payload 維持 `{ entries: [], pet: null, entryTombstones: {}, petUpdatedAt: 0 }` 的同步格式，以便保留既有文件相容性；目前網站只操作行程欄位。
- `GET /api/data` 僅供 Google 帳號尚無 Firestore 文件時匯入舊 D1 資料。
- Firebase Web App 設定與 reCAPTCHA Enterprise site key 是公開用戶端設定；不得將服務帳戶私鑰放入前端。

## 注意事項

- Worker CORS 的 `ALLOWED_ORIGIN` 目前設為 `https://winebowl0516.github.io`。
- Firebase Firestore 位於 `asia-east1`，資料庫 ID 為 `daily-sequence-data`。
- 專案沒有獨立建置或自動測試流程。交付時應如實說明是否完成登入、同步及 Gemini 的實際環境驗證。
