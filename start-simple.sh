#!/bin/bash

# B2B-APP 版本管理系統 - 簡化啟動腳本
# 繞過健康檢查依賴問題的啟動方式

set -e

echo "🚀 B2B-APP 版本管理系統啟動中..."
echo "======================================="

# 建立資料目錄
echo "📁 建立資料目錄..."
mkdir -p ./data

# 停止現有容器
echo "🧹 清理現有容器..."
docker-compose down --remove-orphans 2>/dev/null || true

# 建構映像
echo "🔨 建構 Docker 映像..."
docker-compose build --no-cache

# 啟動後端
echo "🌟 啟動後端服務..."
docker-compose up -d backend --no-deps

# 等待後端啟動
echo "⏳ 等待後端服務啟動..."
sleep 10

# 測試後端API
echo "🔍 測試後端 API..."
if curl -s http://localhost:8321/ > /dev/null; then
    echo "✅ 後端 API 運行正常"
else
    echo "❌ 後端 API 啟動失敗"
    exit 1
fi

# 啟動前端
echo "🌟 啟動前端服務..."
docker-compose up -d frontend --no-deps

# 等待前端啟動
echo "⏳ 等待前端服務啟動..."
sleep 5

# 測試前端
echo "🔍 測試前端服務..."
if curl -s http://localhost/ > /dev/null; then
    echo "✅ 前端服務運行正常"
else
    echo "❌ 前端服務啟動失敗"
    exit 1
fi

# 顯示服務狀態
echo "📊 服務狀態:"
docker-compose ps

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
echo "======================================="
