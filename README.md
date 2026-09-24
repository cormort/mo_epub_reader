# 墨閱 EPUB 閱讀器 PWA

完全離線、手機優先、具全文搜尋、繁簡轉換、書籤、閱讀進度及系統朗讀功能。

## 部署

1. 建立 GitHub repository，將本資料夾所有內容放在 repository 根目錄。
2. 預設分支使用 `main`。
3. 到 Settings → Pages → Build and deployment，將 Source 改為 **GitHub Actions**。
4. Push 到 `main`，等待 `Deploy PWA to GitHub Pages` 完成。
5. 用手機開啟 Pages 網址，加入主畫面或安裝應用程式。

## 更新機制

每次 push 時，GitHub Actions 會把 commit SHA 寫入 `sw.js`，使瀏覽器辨識為新 Service Worker。應用程式會在啟動、回到前景、恢復連線及每 30 分鐘檢查更新。新版本下載完成後顯示「立即更新」，由使用者決定何時重新載入，避免閱讀中突然刷新。

## 本機測試

Service Worker 必須透過 HTTPS 或 localhost 執行，不能直接雙擊 `index.html` 測試 PWA。

```bash
python3 -m http.server 8080
```

開啟 `http://localhost:8080/`。

## 版本更新日誌

- `changelog.html`：手機友善的更新日誌頁面。
- `changelog.json`：結構化版本資料，新增版本時優先修改此檔。
- `version.json`：部署時由 GitHub Actions 自動產生，包含 commit SHA、應用版本與建置時間。

## 快取策略

- 導覽與版本資料：Network First，離線時回退快取。
- HTML、Script、Style、Manifest：Stale While Revalidate。
- 圖示：Cache First。
- 每次部署以 commit SHA 建立新的 App Shell 與 Runtime Cache；啟用時清除舊版墨閱快取。
- EPUB 檔案由使用者從本機選取，不寫入 Service Worker Cache。
