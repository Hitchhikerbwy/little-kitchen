# 小鍋練習室：AI 開發規則

## 目的與邊界
把結構化食譜轉成繁體中文 2D 互動練習。新食譜應只新增資料，不複製頁面或改寫引擎。這是步驟學習網站，模擬秒數不是實際烹調時間，不判斷食品熟度。

## 結構與執行
- `dist/index.html`：首頁、食譜選擇、共用互動廚房。
- `dist/style.css`：奶油白、番茄紅、鼠尾草綠；紙張質感、圓角、2D 平面鍋具；不使用外部付費素材。
- `dist/app.js`：狀態機、點擊與鍵盤操作、模擬計時；不放特定食譜步驟。
- `dist/data/recipes.json`：所有食譜資料；UTF-8、兩格縮排，slug 使用小寫英文連字號。
- `scripts/validate.mjs`：資料驗證；執行 `node scripts/validate.mjs`。
- 預覽：在專案根目錄執行 `python3 -m http.server 8000 --directory dist`。
- 部署內容為 dist；禁止寫入 API 金鑰，無後端、無套件依賴。

## 資料契約
根物件為食譜陣列。每份必須有唯一 id、title、subtitle、emoji、minutes（正整數）、servings、tags（字串陣列）、ingredients（陣列）、steps（陣列）、source（文字）。
食材：id、name、amount、emoji；id 不重複。
步驟：title、instruction、action、label、visual（emoji 字串）、tip；action 僅 `add`、`mix`、`wait`、`serve`。
- add：另外提供 ingredientId，必須指向現有食材。引擎顯示食材按鈕，點擊加入；不強迫拖曳。
- mix：另外提供 repetitions（1–12 整數），每次點擊攪拌，滿足次數才完成。
- wait：另外提供 seconds（1–30 整數），顯示「模擬」倒數；保留略過功能。
- serve：點擊盛盤，進入完成畫面。
最後一步必須是 serve；禁止未定義動作；實際料理時間寫在 instruction 或 tip。

## 固定轉換流程
1. 讀原始食譜，整理份量、材料、工具與順序。缺漏資料先詢問；教學自編版本要明示，不冒稱已驗證配方。
2. 用自己的話摘要來源，不直接大量複製；source 記錄來源網址與取用日期，或標示 AI 自編教學示例。不得捏造來源。
3. 把每個操作拆成單一動作：加入→add，拌勻→mix，等待→wait，盛盤→serve。刀切以文字呈現，不設計危險操作遊戲。
4. 複製 docs/recipe-template.json 的單一食譜物件，替換欄位後加入 recipes.json。
5. 不更動共用 HTML/JS 即應自動出現在首頁、搜尋、分類與獨立網址 `?recipe=<id>`。
6. 執行驗證；瀏覽新食譜，完成全部步驟、略過倒數、重玩、返回列表、手機寬度與鍵盤操作。
7. 更新 docs/extension-log.md，記錄素材→資料→呈現及驗證結果。

## 互動與可及性
一次只啟用當前動作；切換食譜、重玩、返回時清除計時器。使用原生 button，保持可見焦點、至少 44px 點擊區；狀態使用 aria-live。支援 reduced-motion。使用 textContent 顯示資料，不把外部食譜當 HTML 插入。

## 完成條件
驗證通過、無失效連結、桌面與手機無水平溢出、全部步驟可完成。公開發布與 GitHub 上傳須遵照使用者授權；不要聲稱未完成的上傳成功。
