# B2B-APP 版本管理系統 - 前端 Dockerfile
# 基於 Nginx Alpine 的輕量化映像

FROM nginx:alpine

# 設定時區並安裝 wget
RUN apk add --no-cache tzdata wget && \
    cp /usr/share/zoneinfo/Asia/Taipei /etc/localtime && \
    echo "Asia/Taipei" > /etc/timezone

# 移除預設的 nginx 設定
RUN rm /etc/nginx/conf.d/default.conf

# 複製前端檔案到 nginx 服務目錄
COPY . /usr/share/nginx/html/

# 複製 nginx 設定檔
COPY nginx.conf /etc/nginx/conf.d/

# 設定檔案權限
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]
