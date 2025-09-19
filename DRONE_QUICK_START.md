# Drone CI 自動化部署指南

## 🚀 快速設置自動化部署

本項目已配置 `.drone.yml` 文件，可直接用於自動化部署。

## 🔧 設置 Drone CI 服務器

在您的服務器上運行以下命令：

```bash
# 1. 創建數據目錄
sudo mkdir -p /var/lib/drone

# 2. 啟動 Drone CI 服務器
docker run -d \
  --name=drone \
  --publish=3000:80 \
  --volume=/var/lib/drone:/data \
  --env=DRONE_GITHUB_CLIENT_ID=您的_GitHub_客戶端ID \
  --env=DRONE_GITHUB_CLIENT_SECRET=您的_GitHub_客戶端密鑰 \
  --env=DRONE_RPC_SECRET=您自己設定的密鑰 \
  --env=DRONE_SERVER_HOST=您的服務器IP:3000 \
  --env=DRONE_SERVER_PROTO=http \
  --restart=always \
  drone/drone:2

# 3. 啟動 Drone Runner（在部署目標機器上）
docker run -d \
  --name=drone-runner \
  --volume=/var/run/docker.sock:/var/run/docker.sock \
  --env=DRONE_RPC_PROTO=http \
  --env=DRONE_RPC_HOST=您的Drone服務器IP:3000 \
  --env=DRONE_RPC_SECRET=與上面相同的密鑰 \
  --env=DRONE_RUNNER_CAPACITY=1 \
  --env=DRONE_RUNNER_NAME=deploy-runner \
  --restart=always \
  drone/drone-runner-docker:1
```

## 📱 GitHub 設置

1. **創建 GitHub OAuth App**：
   - 訪問：Settings > Developer settings > OAuth Apps
   - Application name: `Drone CI`
   - Homepage URL: `http://您的IP:3000`
   - Authorization callback URL: `http://您的IP:3000/login`

2. **激活倉庫**：
   - 訪問 `http://您的IP:3000`
   - 使用 GitHub 帳號登錄
   - 激活您的 `b2b-app-version` 倉庫

## ✅ 測試部署

```bash
# 提交並推送代碼來觸發部署
git add .
git commit -m "設置 Drone CI 自動化部署"
git push origin main
```

## 🔧 本地測試

在設置 Drone CI 之前，您可以手動測試部署流程：

```bash
# 手動執行部署命令
git fetch --all
git pull origin main
sudo docker compose down --remove-orphans
sudo docker compose up -d --build
```

## 📋 部署流程

每次 push 到 main 分支時，會自動執行：

```bash
# 拉取代碼
git fetch --all
git pull origin main

# 停止服務
docker compose down --remove-orphans

# 重新構建並啟動
docker compose up -d --build
```

## 🔍 監控和故障排除

### 查看 Drone CI 日誌
```bash
# Drone 服務器日誌
docker logs drone

# Drone Runner 日誌
docker logs drone-runner
```

### 查看應用日誌
```bash
# 檢查服務狀態
docker compose ps

# 查看服務日誌
docker compose logs
```

### 手動部署（緊急情況）
```bash
# 如果自動部署失敗，可手動執行
git fetch --all && git pull origin main
sudo docker compose down --remove-orphans
sudo docker compose up -d --build
```

## ⚙️ 環境配置

### 部署路徑設置

`.drone.yml` 預設使用 `/opt/b2b-app-version` 作為部署路徑。如果您的環境不同，有兩種方式設置：

**方法 1: 在 Drone CI 中設置環境變數**
```bash
# 在 Drone CI 的 Repository Settings 中設置 Secret:
DEPLOY_PATH=/your/custom/path/b2b-app-version
```

**方法 2: 修改 .drone.yml 中的預設路徑**
```yaml
environment:
  DEPLOY_PATH: ${DEPLOY_PATH=/your/custom/path/b2b-app-version}
```

### 前置要求

1. **目標機器需要**：
   - Docker 和 Docker Compose 已安裝
   - Git 已安裝並配置
   - 項目代碼已克隆到指定路徑

2. **一次性設置**：
   ```bash
   # 設置 Docker 權限
   sudo usermod -aG docker $USER
   
   # 克隆項目（替換為您的倉庫 URL）
   git clone YOUR_REPO_URL /opt/b2b-app-version
   ```

## 📞 支援

如果遇到問題：

1. 檢查 `deploy.sh` 是否能手動成功執行
2. 查看 Drone CI 和 Docker 日誌
3. 確認端口 3080 和 8321 沒有衝突
4. 驗證 Docker 權限設置正確

## 🔄 完整工作流程

```
開發者 push 代碼
     ↓
GitHub Webhook 觸發
     ↓
Drone CI 接收事件
     ↓
Drone Runner 執行部署
     ↓
應用自動更新完成
```

---

**開始使用**: 複製上述命令，替換相應的配置值，即可開始自動化部署！
