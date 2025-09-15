#!/bin/bash

# B2B-APP 版本管理系統 - 啟動腳本
# 一鍵啟動整個系統的便捷腳本

set -e  # 發生錯誤時停止腳本

echo "🚀 B2B-APP 版本管理系統啟動中..."
echo "======================================="

# 檢查 Docker 是否已安裝
if ! command -v docker &> /dev/null; then
    echo "❌ 錯誤: Docker 未安裝，請先安裝 Docker"
    exit 1
fi

# 檢查 Docker Compose 是否已安裝
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 錯誤: Docker Compose 未安裝，請先安裝 Docker Compose"
    exit 1
fi

# 建立資料目錄
echo "📁 建立資料目錄..."
mkdir -p ./data

# 停止並移除現有容器 (如果存在)
echo "🧹 清理現有容器..."
if docker-compose --version &> /dev/null; then
    docker-compose down --remove-orphans 2>/dev/null || true
else
    docker compose down --remove-orphans 2>/dev/null || true
fi

# 建構並啟動服務
echo "🔨 建構 Docker 映像..."
if docker-compose --version &> /dev/null; then
    docker-compose build --no-cache
    echo "🌟 啟動服務..."
    docker-compose up -d
else
    docker compose build --no-cache
    echo "🌟 啟動服務..."
    docker compose up -d
fi

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 10

# 檢查服務狀態
echo "🔍 檢查服務狀態..."
if docker-compose --version &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi

# 顯示啟動完成訊息
echo ""
echo "✅ 系統啟動完成！"
echo "======================================="
echo "🌐 前端訪問地址: http://localhost:3080"
echo "🔧 後端 API 地址: http://localhost:8321"
echo "📚 API 文件地址: http://localhost:8321/docs"
echo ""
echo "🔑 預設管理密碼: admin123"
echo "⚠️  生產環境請務必修改密碼！"
echo ""
echo "📖 如需停止服務，請執行: ./stop.sh"
echo "🔄 如需重啟服務，請執行: ./restart.sh"
echo "======================================="
