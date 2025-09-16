// B2B-APP 版本管理系統 - 前端 JavaScript
// 整合 FastAPI 後端的完整版本管理功能

class VersionManager {
    constructor() {
        // 使用相對路徑，讓應用程式能彈性部署在不同環境
        this.apiURL = '/api';
        this.versions = [];
        this.isEditMode = false;
        this.editingId = null;
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadVersions();
    }

    initEventListeners() {
        // DOM 元素
        const exportBtn = document.getElementById('exportBtn');
        const editModeBtn = document.getElementById('editModeBtn');
        const exitEditBtn = document.getElementById('exitEditBtn');
        const addVersionBtn = document.getElementById('addVersionBtn');
        const confirmPassword = document.getElementById('confirmPassword');
        const cancelPassword = document.getElementById('cancelPassword');
        const versionForm = document.getElementById('versionForm');
        const cancelForm = document.getElementById('cancelForm');
        const filterAll = document.getElementById('filterAll');
        const filterIOS = document.getElementById('filterIOS');
        const filterAndroid = document.getElementById('filterAndroid');
        const passwordInput = document.getElementById('passwordInput');

        // 事件監聽
        exportBtn?.addEventListener('click', () => this.exportToExcel());
        editModeBtn?.addEventListener('click', () => this.toggleEditMode());
        exitEditBtn?.addEventListener('click', () => this.exitEditMode());
        addVersionBtn?.addEventListener('click', () => this.openVersionModal());
        confirmPassword?.addEventListener('click', () => this.checkPassword());
        cancelPassword?.addEventListener('click', () => this.closePasswordModal());
        cancelForm?.addEventListener('click', () => this.closeVersionModal());
        versionForm?.addEventListener('submit', (e) => this.saveVersion(e));
        filterAll?.addEventListener('click', () => this.setFilter('all'));
        filterIOS?.addEventListener('click', () => this.setFilter('ios'));
        filterAndroid?.addEventListener('click', () => this.setFilter('android'));

        // 密碼輸入框回車事件
        passwordInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkPassword();
        });

        // 狀態選擇變化事件
        const statusSelect = document.getElementById('status');
        statusSelect?.addEventListener('change', () => this.updatePlannedFeaturesLabel());

        // 文案生成器相關事件
        const generateNotice = document.getElementById('generateNotice');
        const copyNotice = document.getElementById('copyNotice');
        const clearNotice = document.getElementById('clearNotice');
        
        generateNotice?.addEventListener('click', () => this.generateReleaseNotice());
        copyNotice?.addEventListener('click', () => this.copyNoticeToClipboard());
        clearNotice?.addEventListener('click', () => this.clearGeneratedNotice());
    }

    showLoading() {
        document.getElementById('loadingOverlay')?.classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay')?.classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full`;
        
        const bgClass = type === 'success' ? 'bg-green-500' : 
                       type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        notification.classList.add(bgClass);
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.remove('translate-x-full'), 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    async makeRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async loadVersions() {
        try {
            this.showLoading();
            const url = `${this.apiURL}/versions${this.currentFilter !== 'all' ? `?os_filter=${this.currentFilter}` : ''}`;
            this.versions = await this.makeRequest(url);
            this.renderVersions();
        } catch (error) {
            this.showNotification('載入版本資料失敗：' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    toggleEditMode() {
        document.getElementById('passwordModal')?.classList.remove('hidden');
        document.getElementById('passwordInput')?.focus();
    }

    exitEditMode() {
        this.isEditMode = false;
        this.updateEditModeUI();
    }

    async checkPassword() {
        const passwordInput = document.getElementById('passwordInput');
        const password = passwordInput?.value;

        if (!password) {
            this.showNotification('請輸入密碼', 'error');
            return;
        }

        try {
            this.showLoading();
            const result = await this.makeRequest(`${this.apiURL}/auth`, {
                method: 'POST',
                body: JSON.stringify({ password })
            });

            if (result.success) {
                this.isEditMode = true;
                this.closePasswordModal();
                this.updateEditModeUI();
                this.renderVersions();
                this.showNotification('登入成功！', 'success');
            } else {
                this.showNotification('密碼錯誤！', 'error');
                passwordInput.value = '';
            }
        } catch (error) {
            this.showNotification('認證失敗：' + error.message, 'error');
            passwordInput.value = '';
        } finally {
            this.hideLoading();
        }
    }

    closePasswordModal() {
        document.getElementById('passwordModal')?.classList.add('hidden');
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) passwordInput.value = '';
    }

    updateEditModeUI() {
        const editControls = document.getElementById('editControls');
        if (this.isEditMode) {
            editControls?.classList.remove('hidden');
        } else {
            editControls?.classList.add('hidden');
        }
    }

    openVersionModal(version = null) {
        this.editingId = version ? version.id : null;
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = version ? '編輯版本' : '新增版本';
        }

        if (version) {
            this.fillFormData(version);
        } else {
            document.getElementById('versionForm')?.reset();
            // 新增時也需要更新標籤
            setTimeout(() => this.updatePlannedFeaturesLabel(), 100);
        }

        document.getElementById('versionModal')?.classList.remove('hidden');
    }

    fillFormData(version) {
        const fields = {
            'version': version.version.replace('v', ''),
            'type': version.release_type,
            'status': version.status,
            'os': version.os_type,
            'plannedFeatures': version.planned_features || '',
            'testDate': version.qa_date || '',
            'reviewDate': version.submission_date || '',
            'reviewText': version.release_notes || '',
            'releaseDate': version.live_date || '',
            'progressNote': version.progress_summary || '',
            'notes': version.remarks || ''
        };

        Object.entries(fields).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field) field.value = value;
        });
        
        // 更新標籤顯示
        this.updatePlannedFeaturesLabel();
    }

    updatePlannedFeaturesLabel() {
        const statusSelect = document.getElementById('status');
        const plannedFeaturesLabel = document.querySelector('label[for="plannedFeatures"]');
        
        if (statusSelect && plannedFeaturesLabel) {
            const isCompleted = statusSelect.value === '完成上線';
            plannedFeaturesLabel.textContent = isCompleted ? '釋出功能' : '預計釋出功能';
        }
    }

    generateReleaseNotice() {
        // 取得表單資料
        const versionInput = document.getElementById('version')?.value || '';
        const osType = document.getElementById('os')?.value || '雙系統';
        const plannedFeatures = document.getElementById('plannedFeatures')?.value || '';
        const releaseDate = document.getElementById('releaseDate')?.value || '';
        const notes = document.getElementById('notes')?.value || '';
        
        if (!versionInput || !plannedFeatures) {
            this.showNotification('請先填寫版號和預計釋出功能', 'error');
            return;
        }

        // 處理版號格式
        const version = versionInput.startsWith('v') ? versionInput : `v${versionInput}`;
        
        // 處理系統類型
        let osDisplay = '';
        switch(osType) {
            case 'iOS': osDisplay = 'iOS'; break;
            case 'Android': osDisplay = 'Android'; break;
            case '雙系統': osDisplay = 'iOS & Android'; break;
            default: osDisplay = osType;
        }
        
        // 處理上線時間
        let releaseDateDisplay = '';
        if (releaseDate) {
            const date = new Date(releaseDate);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            releaseDateDisplay = `已於今早 ${month}/${day} ${hours}:${minutes} 上架完成囉`;
        } else {
            releaseDateDisplay = '即將上架';
        }
        
        // 處理功能描述 - 自動加上編號
        const featuresArray = plannedFeatures.split('\n').filter(item => item.trim());
        const numberedFeatures = featuresArray.map((item, index) => {
            const trimmedItem = item.trim();
            // 如果已經有編號就不再加
            if (/^\d+[\.\、]/.test(trimmedItem)) {
                return trimmedItem;
            }
            return `${index + 1}、${trimmedItem}`;
        }).join('\n');
        
        // 生成文案
        let notice = `🎉【B2B App 更版通知】\n\n`;
        notice += `${osDisplay} ${version} 版\n`;
        notice += `${releaseDateDisplay}\n\n`;
        notice += `● 更版說明\n`;
        
        if (osType === 'Android') {
            notice += `此版針對安卓系統\n`;
        } else if (osType === 'iOS') {
            notice += `此版針對蘋果系統\n`;
        } else {
            notice += `此版針對雙系統\n`;
        }
        
        notice += `${numberedFeatures}\n\n`;
        
        if (notes.trim()) {
            notice += `● 備註\n${notes.trim()}\n`;
        }
        
        // 顯示生成的文案
        const generatedNoticeElement = document.getElementById('generatedNotice');
        if (generatedNoticeElement) {
            generatedNoticeElement.value = notice;
            
            // 啟用複製和清除按鈕
            document.getElementById('copyNotice').disabled = false;
            document.getElementById('clearNotice').disabled = false;
        }
        
        this.showNotification('🎉 更版通知文案已生成！', 'success');
    }

    async copyNoticeToClipboard() {
        const generatedNoticeElement = document.getElementById('generatedNotice');
        if (!generatedNoticeElement || !generatedNoticeElement.value) {
            this.showNotification('沒有可複製的文案', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(generatedNoticeElement.value);
            this.showNotification('📋 文案已複製到剪貼簿！', 'success');
        } catch (err) {
            // 備用方案：使用舊的方法
            generatedNoticeElement.select();
            document.execCommand('copy');
            this.showNotification('📋 文案已複製到剪貼簿！', 'success');
        }
    }

    clearGeneratedNotice() {
        const generatedNoticeElement = document.getElementById('generatedNotice');
        if (generatedNoticeElement) {
            generatedNoticeElement.value = '';
            
            // 禁用複製和清除按鈕
            document.getElementById('copyNotice').disabled = true;
            document.getElementById('clearNotice').disabled = true;
        }
    }

    closeVersionModal() {
        document.getElementById('versionModal')?.classList.add('hidden');
        this.editingId = null;
    }

    async saveVersion(e) {
        e.preventDefault();

        const formData = this.getFormData();
        if (!formData) return;

        try {
            this.showLoading();
            
            const url = this.editingId 
                ? `${this.apiURL}/versions/${this.editingId}`
                : `${this.apiURL}/versions`;
            
            const method = this.editingId ? 'PUT' : 'POST';

            await this.makeRequest(url, {
                method,
                body: JSON.stringify(formData)
            });

            this.closeVersionModal();
            await this.loadVersions();
            this.showNotification(
                this.editingId ? '版本更新成功！' : '版本新增成功！', 
                'success'
            );
        } catch (error) {
            this.showNotification('儲存失敗：' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    getFormData() {
        const version = document.getElementById('version')?.value;
        if (!version) {
            this.showNotification('請輸入版號', 'error');
            return null;
        }

        return {
            version: 'v' + version,
            os_type: document.getElementById('os')?.value || '雙系統',
            release_type: document.getElementById('type')?.value || 'Bug修復',
            status: document.getElementById('status')?.value || '確認要釋出的項目中',
            planned_features: document.getElementById('plannedFeatures')?.value || '',
            progress_summary: document.getElementById('progressNote')?.value || '',
            qa_date: document.getElementById('testDate')?.value || '',
            submission_date: document.getElementById('reviewDate')?.value || '',
            live_date: document.getElementById('releaseDate')?.value || '',
            release_notes: document.getElementById('reviewText')?.value || '',
            remarks: document.getElementById('notes')?.value || ''
        };
    }

    async deleteVersion(id) {
        if (!confirm('確定要刪除此版本嗎？')) return;

        try {
            this.showLoading();
            await this.makeRequest(`${this.apiURL}/versions/${id}`, {
                method: 'DELETE'
            });
            await this.loadVersions();
            this.showNotification('版本已成功刪除', 'success');
        } catch (error) {
            this.showNotification('刪除失敗：' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    toggleVersion(id) {
        const version = this.versions.find(v => v.id === id);
        if (version) {
            version.expanded = !version.expanded;
            this.renderVersions();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.updateFilterButtons();
        this.loadVersions();
    }

    updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-blue-500', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
        });

        const activeBtn = this.currentFilter === 'all' ? document.getElementById('filterAll') :
                         this.currentFilter === 'ios' ? document.getElementById('filterIOS') :
                         document.getElementById('filterAndroid');
        
        if (activeBtn) {
            activeBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
            activeBtn.classList.add('active', 'bg-blue-500', 'text-white');
        }
    }

    async exportToExcel() {
        try {
            this.showLoading();
            const result = await this.makeRequest(`${this.apiURL}/export`);
            
            const csvContent = result.data.map(row => 
                row.map(cell => {
                    const cellStr = String(cell);
                    if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
                        return '"' + cellStr.replace(/"/g, '""') + '"';
                    }
                    return cellStr;
                }).join(',')
            ).join('\n');

            const BOM = '\uFEFF';
            const csvWithBOM = BOM + csvContent;
            const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
            
            const now = new Date();
            const dateStr = now.getFullYear() + 
                String(now.getMonth() + 1).padStart(2, '0') + 
                String(now.getDate()).padStart(2, '0');
            const fileName = `APP版號管理報表_${dateStr}.csv`;
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            
            this.showNotification(`📊 報表已成功匯出！檔案名稱：${fileName}`, 'success');
        } catch (error) {
            this.showNotification('匯出失敗：' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderVersions() {
        const versionsList = document.getElementById('versionsList');
        if (!versionsList) return;

        if (!this.versions || this.versions.length === 0) {
            versionsList.innerHTML = `
                <div class="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
                    <div class="text-gray-400 text-6xl mb-4">📦</div>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">暫無版本資料</h3>
                    <p class="text-gray-500">請新增版本記錄開始管理</p>
                </div>
            `;
            return;
        }

        // 設定展開狀態 - 最新版本預設展開
        this.versions.forEach((version, index) => {
            if (version.expanded === undefined) {
                version.expanded = index === 0;
            }
        });

        versionsList.innerHTML = this.versions.map(version => `
            <div class="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                <!-- Header -->
                <div class="bg-gradient-to-r ${this.getStatusGradient(version.status)} p-4 cursor-pointer" onclick="versionManager.toggleVersion(${version.id})">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <span class="text-white text-xl transform transition-transform ${version.expanded ? 'rotate-90' : ''}">▶</span>
                            <div class="bg-white bg-opacity-95 px-4 py-2 rounded-full shadow-lg border-2 border-white">
                                <span class="text-sm font-bold ${this.getStatusTextClass(version.status)}">
                                    ${this.getStatusIcon(version.status)} ${version.status}
                                </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-2xl">${version.expanded ? '📂' : '📁'}</span>
                                <h3 class="text-xl font-bold text-white">${version.version}</h3>
                            </div>
                            <div class="flex gap-2">
                                <span class="px-3 py-1 rounded-full text-xs font-semibold ${this.getTypeClass(version.release_type)} bg-white bg-opacity-90">${version.release_type}</span>
                                <span class="px-3 py-1 rounded-full text-xs font-semibold ${this.getOsClass(version.os_type)} bg-white bg-opacity-90">${version.os_type}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            ${this.isEditMode ? `
                                <div class="flex gap-1" onclick="event.stopPropagation()">
                                    <button onclick="versionManager.openVersionModal(${JSON.stringify(version).replace(/"/g, '&quot;')})" class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all">
                                        ✏️
                                    </button>
                                    <button onclick="versionManager.deleteVersion(${version.id})" class="bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white p-2 rounded-lg transition-all">
                                        🗑️
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="transition-all duration-300 ${version.expanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}">
                    <div class="p-6 space-y-6">
                        <!-- 現在進度說明 - 突出顯示，但完成上線狀態不顯示 -->
                        ${version.progress_summary && version.status !== '完成上線' ? `
                            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-lg">🚀</span>
                                    <h4 class="font-semibold text-blue-800">現在進度說明</h4>
                                </div>
                                <div class="text-blue-700 font-medium whitespace-pre-wrap">${version.progress_summary}</div>
                            </div>
                        ` : ''}
                        
                        <!-- 預計釋出功能/釋出功能 - 根據狀態顯示不同標題 -->
                        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 class="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <span>${version.status === '完成上線' ? '🚀' : '🎯'}</span> ${version.status === '完成上線' ? '釋出功能' : '預計釋出功能'}
                            </h4>
                            <div class="text-blue-700 leading-relaxed whitespace-pre-wrap">${version.planned_features || '-'}</div>
                        </div>
                        
                        <!-- 時間軸 -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-green-600">🧪</span>
                                    <span class="text-sm font-semibold text-green-800">測試時間</span>
                                </div>
                                <p class="text-green-700 font-medium">${this.formatDate(version.qa_date)}</p>
                            </div>
                            <div class="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-orange-600">📝</span>
                                    <span class="text-sm font-semibold text-orange-800">送審時間</span>
                                </div>
                                <p class="text-orange-700 font-medium">${this.formatDate(version.submission_date)}</p>
                            </div>
                            <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-purple-600">🚀</span>
                                    <span class="text-sm font-semibold text-purple-800">上線時間</span>
                                </div>
                                <p class="text-purple-700 font-medium">${this.formatDate(version.live_date)}</p>
                            </div>
                        </div>
                        
                        <!-- 送審文案 -->
                        ${version.release_notes ? `
                            <div class="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                                <h4 class="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                                    <span>📄</span> 送審文案
                                </h4>
                                <div class="text-indigo-700 whitespace-pre-wrap">${version.release_notes}</div>
                            </div>
                        ` : ''}
                        
                        <!-- 其他備註 -->
                        ${version.remarks ? `
                            <div class="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                                <h4 class="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <span>📝</span> 其他備註
                                </h4>
                                <div class="text-gray-700 whitespace-pre-wrap">${version.remarks}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getStatusGradient(status) {
        const gradientMap = {
            '確認要釋出的項目中': 'from-blue-500 to-blue-600',
            '開發中': 'from-yellow-500 to-orange-500',
            'User測試中': 'from-purple-500 to-purple-600',
            '送審中': 'from-orange-500 to-red-500',
            '完成上線': 'from-green-500 to-emerald-600'
        };
        return gradientMap[status] || 'from-blue-500 to-blue-600';
    }

    getStatusTextClass(status) {
        const textClassMap = {
            '確認要釋出的項目中': 'text-blue-700',
            '開發中': 'text-orange-700',
            'User測試中': 'text-purple-700',
            '送審中': 'text-red-700',
            '完成上線': 'text-green-700'
        };
        return textClassMap[status] || 'text-blue-700';
    }

    getStatusIcon(status) {
        const iconMap = {
            '確認要釋出的項目中': '📋',
            '開發中': '⚡',
            'User測試中': '🧪',
            '送審中': '📝',
            '完成上線': '✅'
        };
        return iconMap[status] || '📋';
    }

    getTypeClass(type) {
        const typeMap = {
            '新增功能': 'type-feature',
            'Bug修復': 'type-bugfix',
            '新增功能&功能修復': 'type-both'
        };
        return typeMap[type] || 'type-feature';
    }

    getOsClass(os) {
        const osMap = {
            '雙系統': 'os-both',
            'iOS': 'os-ios',
            'Android': 'os-android'
        };
        return osMap[os] || 'os-both';
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('zh-TW');
        } catch {
            return dateString;
        }
    }
}

// 輔助函數
function setToday(fieldId) {
    const today = new Date().toISOString().split('T')[0];
    const field = document.getElementById(fieldId);
    if (field) field.value = today;
}

// 初始化應用程式
let versionManager;

document.addEventListener('DOMContentLoaded', () => {
    versionManager = new VersionManager();
});
