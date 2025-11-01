// 全局变量
const API_BASE_URL = '/api';
let currentPage = 1;
let devices = [];
let filteredDevices = [];
let categories = [];
let currentDeviceMac = null; // 用于保存当前编辑设备的原始MAC地址

// DOM元素
const deviceTableBody = document.getElementById('deviceTableBody');
const deviceModal = document.getElementById('deviceModal');
const deviceForm = document.getElementById('deviceForm');
const modalTitle = document.getElementById('modalTitle');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const pageInfo = document.getElementById('pageInfo');

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 绑定事件监听器
    bindEventListeners();

    // 加载设备数据
    loadDevices();

    // 加载统计信息
    loadStats();

    // 加载类别数据
    loadCategories();
});

// 绑定事件监听器
function bindEventListeners() {
    // 添加设备按钮
    document.getElementById('addDeviceBtn').addEventListener('click', showAddDeviceModal);

    // 模态框关闭按钮
    document.querySelector('.close').addEventListener('click', closeDeviceModal);
    document.getElementById('cancelBtn').addEventListener('click', closeDeviceModal);

    // 表单提交
    deviceForm.addEventListener('submit', handleFormSubmit);

    // 搜索输入
    searchInput.addEventListener('input', filterDevices);
    filterCategory.addEventListener('change', filterDevices);

    // 分页按钮
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));

    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === deviceModal) {
            closeDeviceModal();
        }
    });

    // 图标URL输入变化时预览
    document.getElementById('iconUrl').addEventListener('input', previewIcon);

    // 图标文件上传
    document.getElementById('iconFile').addEventListener('change', handleIconUpload);

    // 图标选择按钮
    bindIconSelectorEvents();
}

// 加载设备数据
async function loadDevices() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/devices`);
        devices = await response.json();
        filteredDevices = [...devices];
        renderDeviceTable();
        updatePagination();
        showLoading(false);
    } catch (error) {
        console.error('加载设备数据失败:', error);
        showError('加载设备数据失败');
        showLoading(false);
    }
}

// 加载类别数据
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        categories = await response.json();
        updateCategorySelects();
    } catch (error) {
        console.error('加载类别数据失败:', error);
    }
}

// 更新类别选择框
function updateCategorySelects() {
    // 更新过滤器中的类别选择框
    const filterCategorySelect = document.getElementById('filterCategory');
    const originalValue = filterCategorySelect.value;

    // 清空现有选项（保留第一个选项）
    while (filterCategorySelect.options.length > 1) {
        filterCategorySelect.remove(1);
    }

    // 添加所有类别选项
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterCategorySelect.appendChild(option);
    });

    // 恢复原来的值
    filterCategorySelect.value = originalValue;

    // 更新设备表单中的类别选择框
    const deviceCategorySelect = document.getElementById('category');
    const originalDeviceValue = deviceCategorySelect.value;

    // 保存第一个选项（"请选择类别"）
    const firstOption = deviceCategorySelect.options[0];

    // 清空现有选项
    deviceCategorySelect.innerHTML = '';
    deviceCategorySelect.appendChild(firstOption);

    // 添加所有类别选项
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        deviceCategorySelect.appendChild(option);
    });

    // 恢复原来的值
    deviceCategorySelect.value = originalDeviceValue;
}

// 添加新类别
async function addNewCategory() {
    const newCategory = prompt('请输入新类别名称:');
    if (!newCategory) return;

    try {
        const response = await fetch(`${API_BASE_URL}/categories/${encodeURIComponent(newCategory)}`, {
            method: 'POST'
        });

        if (response.ok) {
            await loadCategories();
            showSuccess('类别添加成功');
        } else {
            const error = await response.json();
            showError(error.detail || '添加类别失败');
        }
    } catch (error) {
        console.error('添加类别失败:', error);
        showError('添加类别失败');
    }
}

// 渲染设备表格
function renderDeviceTable() {
    if (filteredDevices.length === 0) {
        deviceTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>暂无设备数据</p>
                </td>
            </tr>
        `;
        return;
    }

    // 分页处理
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageDevices = filteredDevices.slice(startIndex, endIndex);

    deviceTableBody.innerHTML = pageDevices.map(device => `
        <tr>
            <td>
                <div class="device-icon">
                    ${getDeviceIcon(device)}
                </div>
            </td>
            <td>${device.mac}</td>
            <td>${device.note || '-'}</td>
            <td>${device.brand || '-'}</td>
            <td>${device.category || '-'}</td>
            <td>${device.description || '-'}</td>
            <td>${formatDate(device.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editDevice('${device.mac}')">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteDevice('${device.mac}')">
                    <i class="fas fa-trash"></i> 删除
                </button>
            </td>
        </tr>
    `).join('');
}

// 获取设备图标
function getDeviceIcon(device) {
    if (device.icon_url) {
        // 如果是URL，显示图片
        if (device.icon_url.startsWith('http') || device.icon_url.startsWith('/')) {
            return `<img src="${device.icon_url}" alt="设备图标">`;
        }
        // 如果是图标类名，显示图标
        else {
            return `<i class="${device.icon_url}"></i>`;
        }
    }

    // 根据类别显示默认图标
    const categoryIcons = {
        '手机': 'fas fa-mobile-alt',
        '电脑': 'fas fa-laptop',
        '平板': 'fas fa-tablet-alt',
        '智能家居': 'fas fa-home',
        '网络设备': 'fas fa-network-wired',
        '娱乐设备': 'fas fa-tv'
    };

    const iconClass = categoryIcons[device.category] || 'fas fa-question-circle';
    return `<i class="${iconClass}"></i>`;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 显示添加设备模态框
function showAddDeviceModal() {
    modalTitle.textContent = '添加设备';
    deviceForm.reset();
    document.getElementById('deviceId').value = '';
    document.getElementById('iconPreview').innerHTML = '';

    // 清除当前设备MAC地址
    currentDeviceMac = null;

    // 清除图标选择器的选中状态
    const iconButtons = document.querySelectorAll('.icon-btn');
    iconButtons.forEach(btn => btn.classList.remove('selected'));

    deviceModal.style.display = 'block';
}

// 显示编辑设备模态框
async function editDevice(mac) {
    try {
        const response = await fetch(`${API_BASE_URL}/devices/${mac}`);
        const device = await response.json();

        // 保存设备的原始MAC地址
        currentDeviceMac = device.mac;

        modalTitle.textContent = '编辑设备';
        document.getElementById('deviceId').value = device.id;
        document.getElementById('macAddress').value = device.mac;
        document.getElementById('note').value = device.note || '';
        document.getElementById('brand').value = device.brand || '';
        document.getElementById('category').value = device.category || '';
        document.getElementById('iconUrl').value = device.icon_url || '';
        document.getElementById('description').value = device.description || '';

        // 设置图标选择器的选中状态
        const iconButtons = document.querySelectorAll('.icon-btn');
        iconButtons.forEach(btn => btn.classList.remove('selected'));

        if (device.icon_url) {
            const selectedButton = document.querySelector(`.icon-btn[data-icon="${device.icon_url}"]`);
            if (selectedButton) {
                selectedButton.classList.add('selected');
            }
        }

        previewIcon();
        deviceModal.style.display = 'block';
    } catch (error) {
        console.error('加载设备数据失败:', error);
        showError('加载设备数据失败');
    }
}

// 关闭模态框
function closeDeviceModal() {
    deviceModal.style.display = 'none';
    // 清除当前设备MAC地址
    currentDeviceMac = null;
}

// 处理表单提交
async function handleFormSubmit(event) {
    event.preventDefault();

    // 直接从DOM元素获取值，而不是使用FormData
    const mac = document.getElementById('macAddress').value;
    const note = document.getElementById('note').value;
    const brand = document.getElementById('brand').value;
    const category = document.getElementById('category').value;
    const iconUrl = document.getElementById('iconUrl').value;
    const description = document.getElementById('description').value;
    const deviceId = document.getElementById('deviceId').value;

    const deviceData = {};

    // 只添加非空字段到deviceData对象中
    if (mac !== null && mac !== '') {
        deviceData.mac = mac;
    }
    if (note !== null && note !== '') {
        deviceData.note = note;
    }
    if (brand !== null && brand !== '') {
        deviceData.brand = brand;
    }
    if (category !== null && category !== '') {
        deviceData.category = category;
    }
    if (iconUrl !== null && iconUrl !== '') {
        deviceData.icon_url = iconUrl;
    }
    if (description !== null && description !== '') {
        deviceData.description = description;
    }

    const isUpdate = deviceId !== '';

    try {
        showLoading(true);

        let response;
        if (isUpdate) {
            // 更新设备，使用保存的原始MAC地址
            response = await fetch(`${API_BASE_URL}/devices/${currentDeviceMac}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deviceData)
            });
        } else {
            // 创建设备，确保包含必需的MAC地址
            if (!deviceData.mac) {
                showError('MAC地址是必需的');
                showLoading(false);
                return;
            }

            response = await fetch(`${API_BASE_URL}/devices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deviceData)
            });
        }

        if (response.ok) {
            closeDeviceModal();
            await loadDevices();
            await loadStats();
            await loadCategories(); // 重新加载类别以包含可能的新类别
            showSuccess(isUpdate ? '设备更新成功' : '设备添加成功');
        } else {
            const error = await response.json();
            showError(error.detail || '操作失败');
        }

        showLoading(false);
    } catch (error) {
        console.error('操作失败:', error);
        showError('操作失败');
        showLoading(false);
    }
}

// 删除设备
async function deleteDevice(mac) {
    if (!confirm('确定要删除这个设备吗？')) {
        return;
    }

    try {
        showLoading(true);

        const response = await fetch(`${API_BASE_URL}/devices/${mac}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadDevices();
            await loadStats();
            showSuccess('设备删除成功');
        } else {
            const error = await response.json();
            showError(error.detail || '删除失败');
        }

        showLoading(false);
    } catch (error) {
        console.error('删除失败:', error);
        showError('删除失败');
        showLoading(false);
    }
}

// 过滤设备
function filterDevices() {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryFilter = filterCategory.value;

    filteredDevices = devices.filter(device => {
        const matchesSearch = !searchTerm ||
            device.mac.toLowerCase().includes(searchTerm) ||
            (device.note && device.note.toLowerCase().includes(searchTerm)) ||
            (device.brand && device.brand.toLowerCase().includes(searchTerm));

        const matchesCategory = !categoryFilter || device.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    currentPage = 1;
    renderDeviceTable();
    updatePagination();
}

// 分页处理
function changePage(direction) {
    const totalPages = Math.ceil(filteredDevices.length / 10);
    const newPage = currentPage + direction;

    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderDeviceTable();
        updatePagination();
    }
}

// 更新分页信息
function updatePagination() {
    const totalPages = Math.ceil(filteredDevices.length / 10);
    pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages || 1} 页`;

    document.getElementById('prevPage').disabled = currentPage <= 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

// 预览图标
function previewIcon() {
    const iconUrl = document.getElementById('iconUrl').value;
    const iconPreview = document.getElementById('iconPreview');

    if (!iconUrl) {
        iconPreview.innerHTML = '';
        return;
    }

    if (iconUrl.startsWith('http') || iconUrl.startsWith('/')) {
        // 图片URL
        iconPreview.innerHTML = `<img src="${iconUrl}" alt="预览图标">`;
    } else {
        // 图标类名
        iconPreview.innerHTML = `<i class="${iconUrl}"></i>`;
    }
}

// 加载统计信息
async function loadStats() {
    try {
        // 这里可以调用专门的统计API，现在我们从设备数据中计算
        const totalDevices = devices.length;
        const mobileDevices = devices.filter(d => d.category === '手机').length;
        const smartHomeDevices = devices.filter(d => d.category === '智能家居').length;
        const computerDevices = devices.filter(d => d.category === '电脑').length;

        document.getElementById('totalDevices').textContent = totalDevices;
        document.getElementById('mobileDevices').textContent = mobileDevices;
        document.getElementById('smartHomeDevices').textContent = smartHomeDevices;
        document.getElementById('computerDevices').textContent = computerDevices;
    } catch (error) {
        console.error('加载统计信息失败:', error);
    }
}

// 显示加载状态
function showLoading(show) {
    // 这里可以实现全局加载状态显示
    if (show) {
        document.body.style.cursor = 'wait';
    } else {
        document.body.style.cursor = 'default';
    }
}

// 显示成功消息
function showSuccess(message) {
    // 简单的alert，实际项目中可以使用更好的通知组件
    alert('成功: ' + message);
}

// 显示错误消息
function showError(message) {
    // 简单的alert，实际项目中可以使用更好的通知组件
    alert('错误: ' + message);
}

// 绑定图标选择器事件
function bindIconSelectorEvents() {
    const iconButtons = document.querySelectorAll('.icon-btn');
    iconButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的选中状态
            iconButtons.forEach(btn => btn.classList.remove('selected'));

            // 添加当前按钮的选中状态
            this.classList.add('selected');

            // 设置图标URL值
            const iconClass = this.getAttribute('data-icon');
            document.getElementById('iconUrl').value = iconClass;

            // 预览图标
            previewIcon();
        });
    });
}

// 处理图标上传
async function handleIconUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload-icon', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            document.getElementById('iconUrl').value = result.url;
            previewIcon();
            showSuccess('图标上传成功');
        } else {
            const error = await response.json();
            showError(error.detail || '上传失败');
        }
    } catch (error) {
        console.error('上传失败:', error);
        showError('上传失败');
    }
}

// 导出函数供全局使用
window.editDevice = editDevice;
window.deleteDevice = deleteDevice;