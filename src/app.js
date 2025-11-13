// 任务数据存储
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// DOM元素
const taskForm = document.getElementById('taskForm');
const taskNameInput = document.getElementById('taskName');
const taskTypeInput = document.getElementById('taskType');
const dueDateInput = document.getElementById('dueDate');
const tasksContainer = document.getElementById('tasksContainer');
const emptyState = document.getElementById('emptyState');
const totalTasksEl = document.getElementById('totalTasks');
const activeTasksEl = document.getElementById('activeTasks');
const completedTasksEl = document.getElementById('completedTasks');
const expiredTasksEl = document.getElementById('expiredTasks');

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    renderTasks();
    updateCountdowns();
    updateStats();

    // 设置默认时间为当前时间之后的一小时
    const now = new Date();
    now.setHours(now.getHours() + 1);
    dueDateInput.value = formatDateTimeLocal(now);

    // 每秒更新一次倒计时
    setInterval(updateCountdowns, 1000);
});

// 添加任务
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const taskName = taskNameInput.value.trim();
    const taskType = taskTypeInput.value;
    const dueDate = new Date(dueDateInput.value);

    if (!taskName || !taskType || !dueDateInput.value) {
        alert('请填写所有字段');
        return;
    }

    if (dueDate <= new Date()) {
        alert('到期时间必须是将来的时间');
        return;
    }

    const task = {
        id: Date.now(),
        name: taskName,
        type: taskType,
        dueDate: dueDate.toISOString(),
        completed: false
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    updateStats();

    // 重置表单
    taskForm.reset();

    // 重新设置默认时间
    const now = new Date();
    now.setHours(now.getHours() + 1);
    dueDateInput.value = formatDateTimeLocal(now);

    // 设置任务类型为之前选择的值
    taskTypeInput.value = taskType;
});

// 渲染任务列表
function renderTasks() {
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<div class="empty-state" id="emptyState"><i class="fas fa-clipboard-list"></i><p>暂无任务，请添加您的第一个任务</p></div>';
        return;
    }

    emptyState.style.display = 'none';

    tasksContainer.innerHTML = '';

    // 按到期时间排序
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.dataset.id = task.id;

    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const timeDiff = dueDate - now;

    let countdownText = '';
    let isExpired = false;

    if (timeDiff <= 0) {
        countdownText = '已过期';
        isExpired = true;
        taskElement.classList.add('expired');
    } else {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        countdownText = `${days}天 ${hours}小时 ${minutes}分 ${seconds}秒`;

        // 如果剩余时间少于1天，添加紧急样式
        if (days === 0 && hours < 24) {
            taskElement.classList.add('urgent');
        }
    }

    if (task.completed) {
        taskElement.classList.add('completed');
    }

    const typeClass = task.type === 'daily' ? 'daily' :
        task.type === 'weekly' ? 'weekly' : 'monthly';

    const typeText = task.type === 'daily' ? '每日任务' :
        task.type === 'weekly' ? '每周任务' : '每月任务';

    taskElement.innerHTML = `
                    <div class="task-header">
                        <div class="task-name">${task.name}</div>
                        <div class="task-type ${typeClass}">${typeText}</div>
                    </div>
                    <div class="task-due"><i class="far fa-clock"></i> 到期时间: ${formatDate(dueDate)}</div>
                    <div class="countdown">${countdownText}</div>
                    <div class="task-actions">
                        <button class="complete-btn" onclick="toggleComplete(${task.id})">
                            <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i> ${task.completed ? '标记未完成' : '标记完成'}
                        </button>
                        <button class="delete-btn" onclick="deleteTask(${task.id})">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                `;

    tasksContainer.appendChild(taskElement);
});
}

// 更新倒计时
function updateCountdowns() {
    const taskElements = document.querySelectorAll('.task-item');

    taskElements.forEach(taskElement => {
        const taskId = parseInt(taskElement.dataset.id);
    const task = tasks.find(t => t.id === taskId);

    if (!task || task.completed) return;

    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const timeDiff = dueDate - now;

    const countdownElement = taskElement.querySelector('.countdown');

    if (timeDiff <= 0) {
        countdownElement.textContent = '已过期';
        countdownElement.style.color = '#888';
        taskElement.classList.add('expired');
        taskElement.classList.remove('urgent');
    } else {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        countdownElement.textContent = `${days}天 ${hours}小时 ${minutes}分 ${seconds}秒`;

        // 如果剩余时间少于1天，改变颜色为警告色
        if (days === 0) {
            countdownElement.style.color = '#ff9800';
        } else {
            countdownElement.style.color = '#6a11cb';
        }

        // 更新紧急状态
        if (days === 0 && hours < 24) {
            taskElement.classList.add('urgent');
        } else {
            taskElement.classList.remove('urgent');
        }

        taskElement.classList.remove('expired');
    }
});

    updateStats();
}

// 更新统计信息
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const expiredTasks = tasks.filter(t => {
        if (t.completed) return false;
    const dueDate = new Date(t.dueDate);
    const now = new Date();
    return dueDate - now <= 0;
}).length;
    const activeTasks = totalTasks - completedTasks - expiredTasks;

    totalTasksEl.textContent = totalTasks;
    activeTasksEl.textContent = activeTasks;
    completedTasksEl.textContent = completedTasks;
    expiredTasksEl.textContent = expiredTasks;
}

// 标记任务完成/未完成
function toggleComplete(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// 删除任务
function deleteTask(taskId) {
    if (confirm('确定要删除这个任务吗？')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// 保存任务到本地存储
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 日期时间格式化辅助函数
function formatDate(date) {
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}