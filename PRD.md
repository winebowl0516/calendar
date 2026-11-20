# 日序產品需求

更新日期：2026-11-20

## 產品範圍

日序是個人行事曆網站，目前只包含行事曆、Google 登入、Firebase 使用者資料儲存，以及 Gemini 行事曆助理。

## 1. 行事曆

- 提供月曆瀏覽、選擇日期，以及新增、修改、刪除和標示完成。
- 新帳號初次開啟時沒有預填行程；使用者自行建立第一筆紀錄。
- 行程欄位包含標題、類型、日期、起訖時間、備註及完成狀態。
- 使用者可手動操作行程，也可確認 Gemini 助理提供的操作建議。

## 2. Google 登入

- 使用 Firebase Authentication 的 Google provider 登入及登出。
- 未登入時不可讀寫使用者的 Firestore 行事曆。

## 3. Firebase 資料庫

- 以 Firebase UID 作為 Firestore `accounts/{uid}` 文件路徑。
- 行程資料同步儲存於 Firestore，並以穩定 ID、更新時間與刪除 tombstone 合併多裝置異動。
- Firestore 安全規則只允許帳號讀寫自己的文件。
- 若帳號尚無 Firestore 文件，可從舊 D1 同步服務匯入既有行程。

## 4. Gemini 行事曆助理

- 使用者可輸入自然語句，請助理查詢行程、導覽日期或提出新增、修改、刪除行程建議。
- 助理透過 Firebase AI Logic 呼叫 Gemini Developer API，並使用 Firebase App Check 保護請求。
- 前端驗證模型回覆並限制為允許的行事曆操作。
- 操作以建議呈現。使用者逐項確認後，前端才儲存至 Firestore。
- 日期或目標行程資訊不清楚時，助理應先詢問，不得推測後直接提出異動。

## 範圍外

LINE 登入、寵物、代幣、商店、遊戲化獎勵及與行事曆無關的功能不屬於目前產品需求。

## 部署設定

- 網站：GitHub Pages `https://winebowl0516.github.io/calendar/`
- Firebase 專案：`daily-sequence`
- Firestore 資料庫：`daily-sequence-data`，區域 `asia-east1`
- Firebase AI Logic model：`gemini-3.8-flash`
- Firebase App Check Web app：reCAPTCHA Enterprise site key 設於 `index.html` 的 `APP_CHECK_SITE_KEY`
