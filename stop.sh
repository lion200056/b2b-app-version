#!/bin/bash

# B2B-APP 版本管理系統 - 停止腳本
# 停止所有服務的便捷腳本

set -e

echo "🛑 正在停止 B2B-APP 版本管理系統..."
echo "======================================="

# 停止並移除容器
if docker-compose --version &> /dev/null; then
    docker-compose down --remove-orphans
else
    docker compose down --remove-orphans
fi

echo "✅ 系統已停止"
echo "======================================="
