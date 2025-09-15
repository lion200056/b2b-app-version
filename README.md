# 🚀 B2B-APP 版本管理系統

一個現代化、美觀且功能完整的 App 版本追蹤與狀態顯示平台，專為內部團隊協作設計。

## 📋 功能特色

### 🎯 核心功能
- **版本管理**: 新增、編輯、刪除版本記錄
- **狀態追蹤**: 即時顯示每個版本的開發進度
- **智能篩選**: 支援按作業系統（iOS/Android/雙系統）篩選
- **美觀展示**: 現代化設計，直觀的使用者介面
- **權限管理**: 密碼保護的編輯模式
- **報表匯出**: 一鍵匯出 CSV 格式報表

### 🏷️ 版本狀態
- **確認要釋出的項目中** (藍色)
- **開發中** (橘色)
- **User測試中** (紫色)
- **送審中** (紅色系)
- **完成上線** (綠色系)

### 📱 支援類型
- **Bug修復**
- **新增功能**
- **新增功能&功能修復**

## 🛠️ 技術架構

### 後端
- **FastAPI**: 高效能 Python Web 框架
- **SQLite**: 輕量級資料庫，易於部署和備份
- **Pydantic**: 資料驗證與序列化
- **Uvicorn**: ASGI 伺服器

### 前端
- **HTML5/CSS3/JavaScript**: 原生前端技術
- **Tailwind CSS**: 現代化 CSS 框架
- **響應式設計**: 支援桌面與行動裝置

### 部署
- **Docker**: 容器化部署
- **Docker Compose**: 一鍵啟動完整系統
- **Nginx**: 高效能 Web 伺服器

## 🚀 快速開始

### 環境需求
- Docker 20.0+ 
- Docker Compose 2.0+
- 8GB+ 記憶體推薦

### 一鍵部署

1. **下載專案**
```bash
git clone <repository-url>
cd app
```

2. **啟動系統**
```bash
chmod +x start.sh
./start.sh
```

3. **訪問系統**
- 前端介面: http://localhost:3080
- 後端 API: http://localhost:8321
- API 文件: http://localhost:8321/docs

### 手動部署

如果你偏好手動控制部署過程：

```bash
# 建立資料目錄
mkdir -p ./data

# 建構並啟動服務
docker-compose up -d --build

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f
```

## 📖 使用說明

### 基本操作

1. **瀏覽版本**
   - 開啟瀏覽器訪問 http://localhost
   - 版本列表按版號降序排列
   - 最新版本預設展開顯示

2. **篩選版本**
   - 點擊「全部」「iOS」「Android」按鈕
   - 系統會自動篩選符合條件的版本

3. **查看詳情**
   - 點擊版本標題可展開/收合詳細資訊
   - 包含功能描述、時間軸、送審文案等

### 管理操作

1. **進入編輯模式**
   - 點擊右上角「🔒 編輯模式」
   - 輸入管理密碼（預設：admin123）
   - 成功後會顯示編輯控制台

2. **新增版本**
   - 在編輯模式下點擊「➕ 新增版本」
   - 填寫版本資訊並儲存

3. **編輯版本**
   - 在編輯模式下點擊版本卡片上的「✏️」圖示
   - 修改資訊後儲存

4. **刪除版本**
   - 在編輯模式下點擊「🗑️」圖示
   - 確認後刪除

5. **匯出報表**
   - 在編輯模式下點擊「📊 產出報表」
   - 系統會自動下載 CSV 檔案

## 🔧 系統管理

### 服務控制

```bash
# 啟動服務
./start.sh

# 停止服務
./stop.sh

# 重啟服務
./restart.sh

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f [service_name]
```

### 資料備份

系統資料儲存在 SQLite 檔案中，備份非常簡單：

```bash
# 備份資料庫
cp ./data/app_versions.db ./backup/app_versions_$(date +%Y%m%d_%H%M%S).db

# 還原資料庫
cp ./backup/app_versions_20240101_120000.db ./data/app_versions.db
```

### 密碼修改

為了安全起見，生產環境請務必修改預設密碼：

1. 修改 `backend/main.py` 中的 `ADMIN_PASSWORD` 變數
2. 重新建構並部署系統

```python
ADMIN_PASSWORD = "your_secure_password_here"
```

## 🌟 系統特色

### 🎨 美觀設計
- 現代化的漸層配色方案
- 直觀的狀態顏色編碼
- 響應式設計，支援各種螢幕尺寸
- 流暢的動畫效果

### ⚡ 高效能
- FastAPI 提供極速 API 響應
- SQLite 確保資料操作效率
- Docker 容器化保證一致性環境
- Nginx 提供高效能檔案服務

### 🛡️ 安全性
- 密碼保護的管理功能
- CORS 安全配置
- SQL 注入防護
- XSS 攻擊防護

### 📊 實用功能
- CSV 報表匯出
- 時間軸可視化
- 智能篩選系統
- 進度追蹤顯示

## 🔍 API 文件

系統啟動後，你可以通過以下地址查看完整的 API 文件：

- **Swagger UI**: http://localhost:8321/docs
- **ReDoc**: http://localhost:8321/redoc

### 主要 API 端點

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/api/versions` | 取得版本列表 |
| POST | `/api/versions` | 新增版本 |
| PUT | `/api/versions/{id}` | 更新版本 |
| DELETE | `/api/versions/{id}` | 刪除版本 |
| POST | `/api/auth` | 管理員認證 |
| GET | `/api/export` | 匯出資料 |

## 🐛 故障排除

### 常見問題

1. **端口被佔用**
```bash
# 檢查端口使用情況
lsof -i :3080
lsof -i :8321

# 修改 docker-compose.yml 中的端口配置
```

2. **權限問題**
```bash
# 確保腳本有執行權限
chmod +x start.sh stop.sh restart.sh

# 檢查資料目錄權限
ls -la ./data/
```

3. **服務無法啟動**
```bash
# 查看詳細日誌
docker-compose logs backend
docker-compose logs frontend

# 重新建構映像
docker-compose build --no-cache
```

### 日誌查看

```bash
# 查看所有服務日誌
docker-compose logs -f

# 查看特定服務日誌
docker-compose logs -f backend
docker-compose logs -f frontend

# 查看最近日誌
docker-compose logs --tail=100 backend
```

## 📞 技術支援

如果你在使用過程中遇到問題，請：

1. 檢查系統日誌
2. 參考故障排除章節
3. 確認 Docker 環境正常運作
4. 檢查防火牆設定

## 📄 授權條款

本專案為內部使用系統，請遵守相關使用規範。

---

### 🎉 享受使用 B2B-APP 版本管理系統！

感謝使用我們的版本管理平台。這個系統設計來提升團隊協作效率，讓版本管理變得簡單且直觀。如果你有任何建議或意見回饋，歡迎與我們聯繫！
