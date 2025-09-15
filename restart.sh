#!/bin/bash

# B2B-APP 版本管理系統 - 重啟腳本
# 重啟所有服務的便捷腳本

set -e

echo "🔄 正在重啟 B2B-APP 版本管理系統..."
echo "======================================="

# 停止服務
echo "🛑 停止現有服務..."
if docker-compose --version &> /dev/null; then
    docker-compose down --remove-orphans
else
    docker compose down --remove-orphans
fi

# 重新啟動服務
echo "🌟 重新啟動服務..."
if docker-compose --version &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 5

# 檢查服務狀態
echo "🔍 檢查服務狀態..."
if docker-compose --version &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi

echo ""
echo "✅ 系統重啟完成！"
echo "🌐 前端訪問地址: http://localhost"
echo "======================================="
