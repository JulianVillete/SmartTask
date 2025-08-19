// Global state
let tasks = [
    { 
        id: 1, 
        title: 'Design new landing page', 
        description: 'Create wireframes and mockups for the new product landing page', 
        status: 'todo', 
        priority: 'high', 
        assignee: 'John Doe', 
        dueDate: '2024-12-15', 
        tags: ['design', 'ui/ux'],
        comments: [
            { id: 1, author: 'John Doe', text: 'Started working on wireframes', timestamp: new Date('2024-08-05T10:30:00') },
            { id: 2, author: 'Jane Smith', text: 'Please include mobile responsive designs', timestamp: new Date('2024-08-05T14:20:00') }
        ],
        attachments: [
            { id: 1, name: 'wireframes_v1.pdf', size: '2.4 MB', type: 'pdf' },
            { id: 2, name: 'design_mockup.fig', size: '5.1 MB', type: 'figma' }
        ],
        timeTracking: { totalTime: 7200, isActive: false, startTime: null }
    },
    { 
        id: 2, 
        title: 'Implement user authentication', 
        description: 'Set up JWT authentication with login and signup forms', 
        status: 'in-progress', 
        priority: 'high', 
        assignee: 'Jane Smith', 
        dueDate: '2024-12-20', 
        tags: ['development', 'security'],
        comments: [
            { id: 1, author: 'Jane Smith', text: 'JWT setup complete, working on frontend forms', timestamp: new Date('2024-08-06T09:15:00') }
        ],
        attachments: [],
        timeTracking: { totalTime: 14400, isActive: true, startTime: new Date() }
    },
    { 
        id: 3, 
        title: 'Write API documentation', 
        description: 'Document all REST API endpoints with examples', 
        status: 'todo', 
        priority: 'medium', 
        assignee: 'Mike Johnson', 
        dueDate: '2024-12-25', 
        tags: ['documentation', 'api'],
        comments: [],
        attachments: [],
        timeTracking: { totalTime: 0, isActive: false, startTime: null }
    },
    { 
        id: 4, 
        title: 'Fix responsive issues', 
        description: 'Address mobile layout problems on the dashboard', 
        status: 'review', 
        priority: 'medium', 
        assignee: 'Sarah Wilson', 
        dueDate: '2024-12-18', 
        tags: ['bugfix', 'mobile'],
        comments: [
            { id: 1, author: 'Sarah Wilson', text: 'Fixed main issues, ready for review', timestamp: new Date('2024-08-06T16:45:00') }
        ],
        attachments: [
            { id: 1, name: 'mobile_screenshots.zip', size: '1.2 MB', type: 'zip' }
        ],
        timeTracking: { totalTime: 10800, isActive: false, startTime: null }
    },
    { 
        id: 5, 
        title: 'Database optimization', 
        description: 'Optimize slow queries and add proper indexing', 
        status: 'done', 
        priority: 'low', 
        assignee: 'Tom Brown', 
        dueDate: '2024-12-10', 
        tags: ['database', 'performance'],
        comments: [
            { id: 1, author: 'Tom Brown', text: 'All queries optimized, performance improved by 40%', timestamp: new Date('2024-08-04T11:30:00') }
        ],
        attachments: [
            { id: 1, name: 'performance_report.xlsx', size: '890 KB', type: 'excel' }
        ],
        timeTracking: { totalTime: 18000, isActive: false, startTime: null }
    }
];

let searchTerm = '';
let filterPriority = 'all';
let selectedTask = null;
let editingTask = null;
let draggedTask = null;
const currentUser = 'Julian Villete';

const statuses = [
    { key: 'todo', label: 'To Do', color: 'status-todo' },
    { key: 'in-progress', label: 'In Progress', color: 'status-in-progress' },
    { key: 'review', label: 'Review', color: 'status-review' },
    { key: 'done', label: 'Done', color: 'status-done' }
];

const priorities = {
    low: { class: 'priority-low', label: 'Low' },
    medium: { class: 'priority-medium', label: 'Medium' },
    high: { class: 'priority-high', label: 'High' }
};

// Utility functions
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getCurrentTime(task) {
    if (!task.timeTracking.isActive) return task.timeTracking.totalTime;
    const elapsed = Math.floor((new Date() - new Date(task.timeTracking.startTime)) / 1000);
    return task.timeTracking.totalTime + elapsed;
}

function getDaysUntilDue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const typeMap = {
        pdf: 'pdf', doc: 'document', docx: 'document', txt: 'document',
        xls: 'excel', xlsx: 'excel', png: 'image', jpg: 'image',
        jpeg: 'image', gif: 'image', fig: 'figma', zip: 'zip', rar: 'zip'
    };
    return typeMap[extension] || 'file';
}

// Time tracking functions
function toggleTimeTracking(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    const timeTracking = { ...task.timeTracking };

    if (timeTracking.isActive) {
        const elapsed = Math.floor((new Date() - new Date(timeTracking.startTime)) / 1000);
        timeTracking.totalTime += elapsed;
        timeTracking.isActive = false;
        timeTracking.startTime = null;
    } else {
        timeTracking.isActive = true;
        timeTracking.startTime = new Date();
    }

    tasks[taskIndex] = { ...task, timeTracking };
    renderBoard();
    
    if (selectedTask && selectedTask.id === taskId) {
        selectedTask = tasks[taskIndex];
        updateTaskDetails();
    }
}

function toggleTaskTimer() {
    if (selectedTask) {
        toggleTimeTracking(selectedTask.id);
    }
}

// Search and filter functions
function handleSearch() {
    searchTerm = document.getElementById('searchInput').value;
    renderBoard();
}

function handleFilter() {
    filterPriority = document.getElementById('priorityFilter').value;
    renderBoard();
}

function getFilteredTasks() {
    return tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
        return matchesSearch && matchesPriority;
    });
}

// Task operations
function createTask(taskData) {
    const newTask = {
        id: Date.now(),
        ...taskData,
        status: 'todo',
        tags: taskData.tags.filter(tag => tag.trim()),
        comments: [],
        attachments: [],
        timeTracking: { totalTime: 0, isActive: false, startTime: null }
    };
    tasks.push(newTask);
    renderBoard();
}

function updateTask(updatedTask) {
    const index = tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
        tasks[index] = updatedTask;
        renderBoard();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    renderBoard();
}

// Modal functions
function openTaskModal(task = null) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');

    if (task) {
        editingTask = { ...task };
        modalTitle.textContent = 'Edit Task';
        submitBtn.textContent = 'Update Task';
        populateTaskForm(task);
    } else {
        editingTask = null;
        modalTitle.textContent = 'Create New Task';
        submitBtn.textContent = 'Create Task';
        clearTaskForm();
    }

    modal.classList.remove('hidden');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.add('hidden');
    editingTask = null;
    clearTaskForm();
}

function populateTaskForm(task) {
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskAssignee').value = task.assignee;
    document.getElementById('taskDueDate').value = task.dueDate;
    renderTaskTags(task.tags);
}

function clearTaskForm() {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskPriority').value = 'medium';
    document.getElementById('taskAssignee').value = '';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskTagsList').innerHTML = '';
    document.getElementById('tagInput').value = '';
}

function handleTaskSubmit() {
    const title = document.getElementById('taskTitle').value.trim();
    if (!title) return;

    const taskData = {
        title,
        description: document.getElementById('taskDescription').value.trim(),
        priority: document.getElementById('taskPriority').value,
        assignee: document.getElementById('taskAssignee').value,
        dueDate: document.getElementById('taskDueDate').value,
        tags: getTaskTags()
    };

    if (editingTask) {
        updateTask({ ...editingTask, ...taskData });
    } else {
        createTask(taskData);
    }

    closeTaskModal();
}

// Tag functions
function handleTagInput(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const tag = input.value.trim();
        if (tag) {
            addTaskTag(tag);
            input.value = '';
        }
    }
}

function addTaskTag(tag) {
    const tags = getTaskTags();
    if (!tags.includes(tag)) {
        tags.push(tag);
        renderTaskTags(tags);
    }
}

function removeTaskTag(index) {
    const tags = getTaskTags();
    tags.splice(index, 1);
    renderTaskTags(tags);
}

function getTaskTags() {
    const tagsList = document.getElementById('taskTagsList');
    return Array.from(tagsList.children).map(tag => tag.textContent.replace('✖', '').trim());
}

function renderTaskTags(tags) {
    const tagsList = document.getElementById('taskTagsList');
    tagsList.innerHTML = tags.map((tag, index) => `
        <span class="tag-removable">
            ${tag}
            <button class="tag-remove" onclick="removeTaskTag(${index})">✖</button>
        </span>
    `).join('');
}

// Task details functions
function openTaskDetails(task) {
    selectedTask = task;
    document.getElementById('taskDetailsModal').classList.remove('hidden');
    updateTaskDetails();
}

function closeTaskDetails() {
    document.getElementById('taskDetailsModal').classList.add('hidden');
    selectedTask = null;
    document.getElementById('commentInput').value = '';
}

function updateTaskDetails() {
    if (!selectedTask) return;

    document.getElementById('detailsTitle').textContent = selectedTask.title;
    document.getElementById('detailsDescription').textContent = selectedTask.description;
    document.getElementById('detailsAssignee').textContent = selectedTask.assignee;
    document.getElementById('detailsDueDate').textContent = new Date(selectedTask.dueDate).toLocaleDateString();
    document.getElementById('detailsStatus').value = selectedTask.status;

    const priorityBadge = document.getElementById('detailsPriority');
    priorityBadge.className = `priority-badge ${priorities[selectedTask.priority].class}`;
    priorityBadge.textContent = priorities[selectedTask.priority].label;

    const tagsContainer = document.getElementById('detailsTags');
    tagsContainer.innerHTML = selectedTask.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');

    updateTimeDisplay();
    renderComments();
    renderAttachments();
    updateActivityStats();
}

function updateTimeDisplay() {
    if (!selectedTask) return;

    const currentTime = getCurrentTime(selectedTask);
    const timeValue = document.getElementById('detailsTimeValue');
    const timeStatus = document.getElementById('detailsTimeStatus');
    const timeToggle = document.getElementById('detailsTimeToggle');
    const timeToggleIcon = document.getElementById('timeToggleIcon');
    const timeToggleText = document.getElementById('timeToggleText');
    const baseTimeDiv = document.getElementById('detailsBaseTime');

    timeValue.textContent = formatTime(currentTime);

    if (selectedTask.timeTracking.isActive) {
        timeStatus.style.display = 'flex';
        timeToggleIcon.textContent = '⏸️';
        timeToggleText.textContent = 'Stop';
        timeToggle.className = 'btn btn-danger';
    } else {
        timeStatus.style.display = 'none';
        timeToggleIcon.textContent = '▶️';
        timeToggleText.textContent = 'Start';
        timeToggle.className = 'btn btn-primary';
    }

    if (selectedTask.timeTracking.totalTime > 0) {
        baseTimeDiv.textContent = `Base time: ${formatTime(selectedTask.timeTracking.totalTime)}`;
        baseTimeDiv.style.display = 'block';
    } else {
        baseTimeDiv.style.display = 'none';
    }
}

function updateTaskStatus() {
    const newStatus = document.getElementById('detailsStatus').value;
    if (selectedTask) {
        selectedTask.status = newStatus;
        updateTask(selectedTask);
    }
}

function editCurrentTask() {
    closeTaskDetails();
    openTaskModal(selectedTask);
}

function deleteCurrentTask() {
    if (selectedTask && confirm('Are you sure you want to delete this task?')) {
        deleteTask(selectedTask.id);
        closeTaskDetails();
    }
}

// Comments functions
function renderComments() {
    const commentsList = document.getElementById('commentsList');
    
    if (selectedTask.comments.length === 0) {
        commentsList.innerHTML = '<p style="color: #9ca3af; font-size: 0.875rem;">No comments yet</p>';
        return;
    }

    commentsList.innerHTML = selectedTask.comments.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <div class="comment-avatar">👤</div>
                <span class="comment-author">${comment.author}</span>
                <span class="comment-time">
                    ${new Date(comment.timestamp).toLocaleDateString()} 
                    ${new Date(comment.timestamp).toLocaleTimeString()}
                </span>
            </div>
            <p class="comment-text">${comment.text}</p>
        </div>
    `).join('');
}

function handleCommentSubmit(event) {
    if (event.key === 'Enter') {
        addComment();
    }
}

function addComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    
    if (text && selectedTask) {
        const newComment = {
            id: Date.now(),
            author: currentUser,
            text: text,
            timestamp: new Date()
        };
        
        selectedTask.comments.push(newComment);
        updateTask(selectedTask);
        renderComments();
        updateActivityStats();
        input.value = '';
    }
}

// Attachments functions
function renderAttachments() {
    const attachmentsList = document.getElementById('attachmentsList');
    
    if (selectedTask.attachments.length === 0) {
        attachmentsList.innerHTML = '<p style="color: #9ca3af; font-size: 0.875rem;">No attachments yet</p>';
        return;
    }

    attachmentsList.innerHTML = selectedTask.attachments.map(attachment => `
        <div class="attachment-item">
            <div class="attachment-info">
                <div class="attachment-icon">📎</div>
                <div class="attachment-details">
                    <h4>${attachment.name}</h4>
                    <p>${attachment.size}</p>
                </div>
            </div>
            <button class="close-btn" onclick="removeAttachment(${attachment.id})">✖</button>
        </div>
    `).join('');
}

function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: formatFileSize(file.size),
        type: getFileType(file.name)
    }));
    
    if (selectedTask) {
        selectedTask.attachments.push(...newAttachments);
        updateTask(selectedTask);
        renderAttachments();
        updateActivityStats();
    }
}

function removeAttachment(attachmentId) {
    if (selectedTask) {
        selectedTask.attachments = selectedTask.attachments.filter(att => att.id !== attachmentId);
        updateTask(selectedTask);
        renderAttachments();
        updateActivityStats();
    }
}

function updateActivityStats() {
    if (!selectedTask) return;

    document.getElementById('statsComments').textContent = selectedTask.comments.length;
    document.getElementById('statsAttachments').textContent = selectedTask.attachments.length;
    document.getElementById('statsTimeLogged').textContent = formatTime(selectedTask.timeTracking.totalTime);

    const currentSessionDiv = document.getElementById('statsCurrentSession');
    if (selectedTask.timeTracking.isActive) {
        const currentTime = getCurrentTime(selectedTask);
        const sessionTime = currentTime - selectedTask.timeTracking.totalTime;
        document.getElementById('statsCurrentTime').textContent = formatTime(sessionTime);
        currentSessionDiv.style.display = 'flex';
    } else {
        currentSessionDiv.style.display = 'none';
    }
}

// Drag and drop functions
function handleDragStart(event, task) {
    draggedTask = task;
    event.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

function handleDrop(event, newStatus) {
    event.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
        draggedTask.status = newStatus;
        updateTask(draggedTask);
    }
    draggedTask = null;
    
    // Remove drag over styling
    event.currentTarget.classList.remove('drag-over');
}

function handleDragEnter(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
}

// Render functions
function renderTaskCard(task) {
    const daysUntilDue = getDaysUntilDue(task.dueDate);
    const currentTime = getCurrentTime(task);
    
    let statusWarning = '';
    if (daysUntilDue < 0) {
        statusWarning = '<span class="status-overdue">⚠️ Overdue</span>';
    } else if (daysUntilDue >= 0 && daysUntilDue <= 2) {
        statusWarning = '<span class="status-warning">🕐 Due soon</span>';
    }

    return `
        <div class="task-card" 
             draggable="true" 
             ondragstart="handleDragStart(event, ${JSON.stringify(task).replace(/"/g, '&quot;')})"
             onclick="openTaskDetails(${JSON.stringify(task).replace(/"/g, '&quot;')})">
            <div class="task-header">
                <h3 class="task-title">${task.title}</h3>
                <div class="task-actions">
                    <button class="task-action-btn" onclick="event.stopPropagation(); openTaskModal(${JSON.stringify(task).replace(/"/g, '&quot;')})">✏️</button>
                    <button class="task-action-btn delete" onclick="event.stopPropagation(); deleteTask(${task.id})">🗑️</button>
                </div>
            </div>
            
            <p class="task-description">${task.description}</p>
            
            <div class="task-meta">
                <span class="priority-badge ${priorities[task.priority].class}">
                    ${priorities[task.priority].label}
                </span>
                ${statusWarning}
            </div>
            
            <div class="time-tracking">
                <div class="time-display">
                    <span>⏱️</span>
                    <span class="${task.timeTracking.isActive ? 'time-active' : 'time-inactive'}">
                        ${formatTime(currentTime)}
                    </span>
                    ${task.timeTracking.isActive ? '<div class="pulse-dot"></div>' : ''}
                </div>
                <button class="time-toggle ${task.timeTracking.isActive ? 'active' : 'inactive'}" 
                        onclick="event.stopPropagation(); toggleTimeTracking(${task.id})">
                    ${task.timeTracking.isActive ? '⏸️' : '▶️'}
                </button>
            </div>
            
            <div class="tags-container">
                ${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            
            <div class="task-stats">
                ${task.comments.length > 0 ? `<div class="stat-item"><span>💬</span><span>${task.comments.length}</span></div>` : ''}
                ${task.attachments.length > 0 ? `<div class="stat-item"><span>📎</span><span>${task.attachments.length}</span></div>` : ''}
            </div>
            
            <div class="task-footer">
                <div class="assignee">
                    <span>👤</span>
                    ${task.assignee}
                </div>
                <div class="due-date">
                    <span>📅</span>
                    ${new Date(task.dueDate).toLocaleDateString()}
                </div>
            </div>
        </div>
    `;
}

function renderBoard() {
    const filteredTasks = getFilteredTasks();
    const kanbanBoard = document.getElementById('kanbanBoard');
    
    kanbanBoard.innerHTML = statuses.map(status => {
        const statusTasks = filteredTasks.filter(task => task.status === status.key);
        
        return `
            <div class="column" 
                 ondragover="handleDragOver(event)" 
                 ondrop="handleDrop(event, '${status.key}')"
                 ondragenter="handleDragEnter(event)"
                 ondragleave="handleDragLeave(event)">
                <div class="column-header">
                    <div class="column-title">
                        <div class="status-indicator ${status.color}"></div>
                        <h2 style="font-size: 1.125rem; font-weight: 600;">${status.label}</h2>
                    </div>
                    <span class="column-count">${statusTasks.length}</span>
                </div>
                
                <div class="tasks-container">
                    ${statusTasks.length > 0 ? 
                        statusTasks.map(task => renderTaskCard(task)).join('') :
                        `<div class="empty-state">
                            <div class="empty-emoji">📝</div>
                            <p>No tasks here</p>
                        </div>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Initialize the app
function init() {
    renderBoard();
    
    // Update time displays every second
    setInterval(() => {
        const hasActiveTimers = tasks.some(task => task.timeTracking.isActive);
        if (hasActiveTimers) {
            renderBoard();
            if (selectedTask && selectedTask.timeTracking.isActive) {
                updateTimeDisplay();
                updateActivityStats();
            }
        }
    }, 1000);
}

// Start the application
init();