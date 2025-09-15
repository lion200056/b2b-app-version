# 🚀 Git 遠端倉庫設置指南

## 📋 目前狀態

✅ **本地 Git 倉庫已完成設置**
- 已初始化 Git 倉庫
- 完成首次提交（17 個檔案）
- 建立版本標籤 v1.0.0
- 新增專案文檔

## 🌐 推送到遠端倉庫

### 方式一：GitHub（推薦）

1. **在 GitHub 上建立新倉庫**
   ```
   - 倉庫名稱: b2b-app-version-manager
   - 描述: B2B-APP 版本管理系統 - 現代化的應用程式版本追蹤平台
   - 設為 Private（如果是內部使用）
   ```

2. **連接遠端倉庫**
   ```bash
   git remote add origin https://github.com/你的用戶名/b2b-app-version-manager.git
   git branch -M main
   git push -u origin main --tags
   ```

### 方式二：GitLab

1. **在 GitLab 上建立新專案**
   ```
   - 專案名稱: B2B-APP 版本管理系統
   - 專案路徑: b2b-app-version-manager
   - 可見性: Internal 或 Private
   ```

2. **連接遠端倉庫**
   ```bash
   git remote add origin https://gitlab.com/你的用戶名/b2b-app-version-manager.git
   git branch -M main
   git push -u origin main --tags
   ```

### 方式三：Bitbucket

1. **在 Bitbucket 上建立新倉庫**
   ```
   - 倉庫名稱: b2b-app-version-manager
   - 存取層級: Private team
   - 包含 README: 否（我們已經有了）
   ```

2. **連接遠端倉庫**
   ```bash
   git remote add origin https://bitbucket.org/你的團隊/b2b-app-version-manager.git
   git push -u origin main --tags
   ```

## 📊 當前 Git 狀態

```bash
# 查看提交歷史
git log --oneline --decorate
# 輸出:
# d3a876e (HEAD -> main) 📋 新增專案簡介文檔
# b711339 (tag: v1.0.0) 🚀 初始版本：B2B-APP 版本管理系統 v1.0.0

# 查看檔案狀態
git status
# 輸出: working tree clean

# 查看標籤
git tag
# 輸出: v1.0.0
```

## 📁 專案檔案清單

```
總計: 19 個檔案
├── .gitignore           # Git 忽略規則
├── CHANGELOG.md         # 更新日誌
├── GIT_SETUP_GUIDE.md   # Git 設置指南（本檔案）
├── PROJECT_SUMMARY.md   # 專案簡介
├── README.md           # 詳細說明文檔
├── config.env          # 環境設定檔
├── docker-compose.yml  # Docker 編排設定
├── restart.sh          # 重啟腳本
├── start-simple.sh     # 簡化啟動腳本
├── start.sh           # 完整啟動腳本
├── stop.sh            # 停止腳本
├── backend/           # 後端目錄
│   ├── Dockerfile     # 後端容器設定
│   ├── main.py        # FastAPI 主程式
│   └── requirements.txt # Python 依賴
├── frontend/          # 前端目錄
│   ├── Dockerfile     # 前端容器設定
│   ├── app.js         # JavaScript 主程式
│   ├── index.html     # 主頁面
│   └── nginx.conf     # Nginx 設定
└── data/              # 資料目錄
    ├── .gitkeep       # 保持目錄存在
    └── app_versions.db # SQLite 資料庫（自動生成）
```

## 🔧 推送後的後續步驟

### 1. 設置分支保護
```bash
# 在 GitHub/GitLab 上設置 main 分支保護
- 要求 Pull Request 審查
- 要求狀態檢查通過
- 限制推送到 main 分支
```

### 2. 配置 CI/CD（可選）
```yaml
# .github/workflows/ci.yml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Test Application
        run: |
          docker-compose up -d --build
          # 添加測試腳本
```

### 3. 團隊協作設置
```bash
# 團隊成員克隆專案
git clone https://github.com/用戶名/b2b-app-version-manager.git
cd b2b-app-version-manager

# 立即啟動系統
./start-simple.sh
```

## 📝 Git 工作流程建議

### 分支策略
- **main**: 穩定的生產版本
- **develop**: 開發整合分支
- **feature/功能名**: 功能開發分支
- **hotfix/修復名**: 緊急修復分支

### 提交規範
```
🚀 feat: 新增功能
🐛 fix: 修復問題
📝 docs: 文檔更新
🎨 style: 代碼格式調整
♻️ refactor: 代碼重構
⚡️ perf: 效能優化
✅ test: 測試相關
🔧 config: 配置修改
```

### 版本發布
```bash
# 發布新版本
git tag -a v1.1.0 -m "版本 1.1.0 發布說明"
git push origin v1.1.0

# 查看所有版本
git tag -l
```

## 🔗 相關連結

- [Git 基礎教學](https://git-scm.com/docs)
- [GitHub 使用指南](https://docs.github.com)
- [GitLab 文檔](https://docs.gitlab.com)
- [Docker Hub](https://hub.docker.com) - 可以推送 Docker 映像

## ⚠️ 注意事項

1. **敏感資訊**：確保不要提交密碼、API 金鑰等敏感資訊
2. **資料庫檔案**：`.gitignore` 已設置忽略 `.db` 檔案
3. **環境設定**：生產環境請修改 `config.env` 中的密碼
4. **容器資料**：確保 `data/` 目錄在生產環境中有適當的備份策略

---

**🎉 專案已準備好推送到遠端倉庫！**

選擇適合的 Git 平台，按照上述步驟設置遠端倉庫，就可以開始團隊協作了！
