# B2B-APP 版本管理系統 - 後端 Dockerfile
# 基於 Python 3.11 的輕量化 Alpine Linux 映像

FROM python:3.11-alpine

# 設定工作目錄
WORKDIR /app

# 設定環境變數
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TZ=Asia/Taipei

# 安裝系統依賴
RUN apk add --no-cache \
    gcc \
    musl-dev \
    linux-headers \
    tzdata \
    wget

# 設定時區
RUN cp /usr/share/zoneinfo/Asia/Taipei /etc/localtime && \
    echo "Asia/Taipei" > /etc/timezone

# 複製依賴檔案
COPY requirements.txt .

# 安裝 Python 依賴
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 複製應用程式碼
COPY . .

# 建立資料庫目錄
RUN mkdir -p /app/data

# 設定資料庫檔案權限
RUN touch /app/data/app_versions.db && \
    chmod 666 /app/data/app_versions.db

# 暴露端口
EXPOSE 8321

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8321/ || exit 1

# 啟動命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8321", "--reload"]
