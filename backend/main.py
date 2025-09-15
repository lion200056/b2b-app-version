#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
B2B-APP 版本追蹤與狀態顯示平台 - FastAPI 後端
基於需求規格書設計的 API 服務
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional
import sqlite3
import os
from datetime import datetime
import logging

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 創建 FastAPI 應用實例
app = FastAPI(
    title="B2B-APP 版本管理系統",
    description="內部使用的版本追蹤與狀態顯示平台",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS 設置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生產環境請改為具體域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 資料庫路徑
DATABASE_PATH = os.getenv("DATABASE_PATH", "/app/data/app_versions.db")
ADMIN_PASSWORD = "admin123"  # 生產環境請使用環境變數

# Pydantic 模型定義
class VersionBase(BaseModel):
    version: str = Field(..., description="版號，例如 'v1.2.3'")
    os_type: str = Field(..., description="作業系統: iOS, Android, 雙系統")
    release_type: str = Field(..., description="類型: Bug修復, 新增功能, 新增功能&功能修復")
    status: str = Field(..., description="狀態: 確認要釋出的項目中, 開發中, User測試中, 送審中, 完成上線")
    description: Optional[str] = Field(None, description="更新功能描述")
    progress_summary: Optional[str] = Field(None, description="現在進度說明")
    qa_date: Optional[str] = Field(None, description="測試時間")
    submission_date: Optional[str] = Field(None, description="送審時間")
    live_date: Optional[str] = Field(None, description="上線時間")
    release_notes: Optional[str] = Field(None, description="送審文案")
    remarks: Optional[str] = Field(None, description="其他備註")

class VersionCreate(VersionBase):
    pass

class VersionUpdate(VersionBase):
    pass

class Version(VersionBase):
    id: int = Field(..., description="版本ID")
    created_at: str = Field(..., description="建立時間")
    updated_at: str = Field(..., description="最後更新時間")

class AuthRequest(BaseModel):
    password: str = Field(..., description="管理密碼")

class AuthResponse(BaseModel):
    success: bool = Field(..., description="認證結果")
    message: str = Field(..., description="訊息")

# 資料庫初始化
def init_database():
    """初始化資料庫並建立資料表"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # 建立 app_versions 資料表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS app_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version TEXT NOT NULL,
            os_type TEXT NOT NULL,
            release_type TEXT NOT NULL,
            status TEXT NOT NULL,
            description TEXT,
            progress_summary TEXT,
            qa_date TEXT,
            submission_date TEXT,
            live_date TEXT,
            release_notes TEXT,
            remarks TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')
    
    # 檢查是否已有資料，如果沒有則插入範例資料
    cursor.execute('SELECT COUNT(*) FROM app_versions')
    count = cursor.fetchone()[0]
    
    if count == 0:
        sample_data = [
            ('v2.2.0', '雙系統', '新增功能&功能修復', '確認要釋出的項目中', 
             '新增AI推薦功能、修復支付流程bug、優化介面設計', '正在進行需求確認，預計本週完成功能規格書',
             '', '', '', '', '預計下個月開始開發'),
            ('v2.1.0', '雙系統', '新增功能', '開發中', 
             '新增會員等級系統、優化購物車流程、修復登入問題', '會員系統已完成80%，購物車優化進行中',
             '2024-01-15', '2024-01-20', '2024-01-25', '本次更新包含重要功能優化，提升用戶體驗', '需要特別注意會員資料遷移'),
            ('v2.0.5', 'iOS', 'Bug修復', '完成上線', 
             '修復iOS 17兼容性問題、解決閃退問題', '已完成上線，監控中',
             '2024-01-05', '2024-01-08', '2024-01-10', '緊急修復版本，解決iOS 17兼容性問題', '已完成上線，用戶反饋良好')
        ]
        
        current_time = datetime.now().isoformat()
        for data in sample_data:
            cursor.execute('''
                INSERT INTO app_versions 
                (version, os_type, release_type, status, description, progress_summary,
                 qa_date, submission_date, live_date, release_notes, remarks, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', data + (current_time, current_time))
    
    conn.commit()
    conn.close()
    logger.info("資料庫初始化完成")

# 資料庫連接輔助函數
def get_db_connection():
    """取得資料庫連接"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# 認證檢查
def verify_password(password: str) -> bool:
    """驗證管理密碼"""
    return password == ADMIN_PASSWORD

# API 路由

@app.get("/")
async def read_root():
    """根路徑，返回 API 資訊"""
    return {
        "message": "B2B-APP 版本管理系統 API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }

@app.post("/api/auth", response_model=AuthResponse)
async def authenticate(auth_request: AuthRequest):
    """管理員密碼認證"""
    try:
        if verify_password(auth_request.password):
            return AuthResponse(success=True, message="認證成功")
        else:
            return AuthResponse(success=False, message="密碼錯誤")
    except Exception as e:
        logger.error(f"認證錯誤: {e}")
        raise HTTPException(status_code=500, detail="認證過程發生錯誤")

@app.get("/api/versions", response_model=List[Version])
async def get_versions(os_filter: Optional[str] = None):
    """
    取得所有版本資料
    
    Args:
        os_filter: 作業系統篩選 ("ios", "android", "all" 或 None)
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 建構 SQL 查詢
        base_query = '''
            SELECT id, version, os_type, release_type, status, description, 
                   progress_summary, qa_date, submission_date, live_date, 
                   release_notes, remarks, created_at, updated_at
            FROM app_versions
        '''
        
        params = []
        if os_filter and os_filter != "all":
            if os_filter == "ios":
                base_query += " WHERE os_type IN ('iOS', '雙系統')"
            elif os_filter == "android":
                base_query += " WHERE os_type IN ('Android', '雙系統')"
        
        base_query += " ORDER BY version DESC"
        
        cursor.execute(base_query, params)
        rows = cursor.fetchall()
        conn.close()
        
        # 轉換為 Version 模型
        versions = []
        for row in rows:
            version_data = dict(row)
            versions.append(Version(**version_data))
        
        return versions
        
    except Exception as e:
        logger.error(f"取得版本資料錯誤: {e}")
        raise HTTPException(status_code=500, detail="取得版本資料失敗")

@app.post("/api/versions", response_model=Version)
async def create_version(version: VersionCreate):
    """新增版本記錄"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        current_time = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT INTO app_versions 
            (version, os_type, release_type, status, description, progress_summary,
             qa_date, submission_date, live_date, release_notes, remarks, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            version.version, version.os_type, version.release_type, version.status,
            version.description, version.progress_summary, version.qa_date,
            version.submission_date, version.live_date, version.release_notes,
            version.remarks, current_time, current_time
        ))
        
        version_id = cursor.lastrowid
        conn.commit()
        
        # 取得新建的版本資料
        cursor.execute('SELECT * FROM app_versions WHERE id = ?', (version_id,))
        row = cursor.fetchone()
        conn.close()
        
        return Version(**dict(row))
        
    except Exception as e:
        logger.error(f"新增版本錯誤: {e}")
        raise HTTPException(status_code=500, detail="新增版本失敗")

@app.put("/api/versions/{version_id}", response_model=Version)
async def update_version(version_id: int, version: VersionUpdate):
    """更新版本記錄"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 檢查版本是否存在
        cursor.execute('SELECT id FROM app_versions WHERE id = ?', (version_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="版本不存在")
        
        current_time = datetime.now().isoformat()
        
        cursor.execute('''
            UPDATE app_versions SET
                version = ?, os_type = ?, release_type = ?, status = ?,
                description = ?, progress_summary = ?, qa_date = ?,
                submission_date = ?, live_date = ?, release_notes = ?,
                remarks = ?, updated_at = ?
            WHERE id = ?
        ''', (
            version.version, version.os_type, version.release_type, version.status,
            version.description, version.progress_summary, version.qa_date,
            version.submission_date, version.live_date, version.release_notes,
            version.remarks, current_time, version_id
        ))
        
        conn.commit()
        
        # 取得更新後的版本資料
        cursor.execute('SELECT * FROM app_versions WHERE id = ?', (version_id,))
        row = cursor.fetchone()
        conn.close()
        
        return Version(**dict(row))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新版本錯誤: {e}")
        raise HTTPException(status_code=500, detail="更新版本失敗")

@app.delete("/api/versions/{version_id}")
async def delete_version(version_id: int):
    """刪除版本記錄"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 檢查版本是否存在
        cursor.execute('SELECT id FROM app_versions WHERE id = ?', (version_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="版本不存在")
        
        cursor.execute('DELETE FROM app_versions WHERE id = ?', (version_id,))
        conn.commit()
        conn.close()
        
        return {"message": "版本已成功刪除"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"刪除版本錯誤: {e}")
        raise HTTPException(status_code=500, detail="刪除版本失敗")

@app.get("/api/export")
async def export_versions():
    """匯出版本資料為 CSV 格式"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT version, release_type, status, os_type, description,
                   qa_date, submission_date, live_date, release_notes,
                   progress_summary, remarks
            FROM app_versions
            ORDER BY version DESC
        ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        # 轉換為適合匯出的格式
        export_data = []
        headers = ['版號', '類型', '狀態', '作業系統', '更新功能描述', 
                  '測試時間', '送審時間', '完成上線時間', '送審文案', 
                  '現在進度說明', '其他備註']
        
        export_data.append(headers)
        
        for row in rows:
            export_data.append([
                row[0] or '', row[1] or '', row[2] or '', row[3] or '',
                row[4] or '', row[5] or '', row[6] or '', row[7] or '',
                row[8] or '', row[9] or '', row[10] or ''
            ])
        
        return {"data": export_data}
        
    except Exception as e:
        logger.error(f"匯出資料錯誤: {e}")
        raise HTTPException(status_code=500, detail="匯出資料失敗")

# 靜態檔案服務（用於提供前端檔案）
if os.path.exists("../frontend"):
    app.mount("/", StaticFiles(directory="../frontend", html=True), name="static")

# 啟動時初始化資料庫
@app.on_event("startup")
async def startup_event():
    """應用啟動時的初始化作業"""
    init_database()
    logger.info("FastAPI 應用已啟動")

@app.on_event("shutdown")
async def shutdown_event():
    """應用關閉時的清理作業"""
    logger.info("FastAPI 應用已關閉")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8321,
        reload=True,
        log_level="info"
    )
