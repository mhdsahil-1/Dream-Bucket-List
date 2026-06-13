// State Management
let goals = [];
let currentFilter = 'all';
let searchQuery = '';
let currentSort = 'newest';
let editingGoalId = null;
// Storage mode detection
const isLocalFile = window.location.protocol === 'file:';
// Default Goals for local storage fallback mode
const defaultGoals = [
    {
        id: 'default-1',
        title: 'Sleep under the Northern Lights in a glass igloo in Finland',
        category: 'travel',
        priority: 'high',
        targetDate: '2027-12-15',
        completed: false,
        createdAt: Date.now() - 300000
    },
    {
        id: 'default-2',
        title: 'Complete a full marathon',
        category: 'health',
        priority: 'medium',
        targetDate: '',
        completed: false,
        createdAt: Date.now() - 200000
    },
    {
        id: 'default-3',
        title: 'Learn to play the piano and perform a song',
        category: 'creative',
        priority: 'medium',
        targetDate: '2026-10-01',
        completed: true,
        createdAt: Date.now() - 100000
    }
];
// Select DOM Elements
const goalForm = document.getElementById('goal-form');
const goalTitleInput = document.getElementById('goal-title');
const goalCategorySelect = document.getElementById('goal-category');
const goalPrioritySelect = document.getElementById('goal-priority');
const goalDateInput = document.getElementById('goal-date');
const goalsList = document.getElementById('goals-list');
const emptyState = document.getElementById('empty-state');
const statTotal = document.getElementById('stat-total');
const statCompleted = document.getElementById('stat-completed');
const statPercent = document.getElementById('stat-percent');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const sortSelect = document.getElementById('sort-select');
const tabAll = document.getElementById('tab-all');
const tabActive = document.getElementById('tab-active');
const tabCompleted = document.getElementById('tab-completed');
// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    updateStorageBanner();
    await loadGoals();
});
// Setup Event Listeners
function setupEventListeners() {
    // Add goal submit
    goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addGoal();
    });
    // Search input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        render();
    });
    // Clear search
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.style.display = 'none';
        render();
    });
    // Sort select
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        render();
    });
    // Filters tab clicks
    const tabs = [
        { btn: tabAll, filter: 'all' },
        { btn: tabActive, filter: 'active' },
        { btn: tabCompleted, filter: 'completed' }
    ];
    tabs.forEach(({ btn, filter }) => {
        btn.addEventListener('click', () => {
            tabs.forEach(t => t.btn.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = filter;
            render();
        });
    });
}
// Update Storage Mode Banner
function updateStorageBanner() {
    const banner = document.getElementById('storage-status-banner');
    const icon = document.getElementById('status-icon');
    const text = document.getElementById('status-text');
    if (!banner) return;
    banner.style.display = 'flex';
    if (isLocalFile) {
        banner.className = 'status-banner local-mode';
        icon.setAttribute('data-lucide', 'info');
        text.innerHTML = '<strong>Running in Offline Mode:</strong> Dreams are saved locally in your browser storage. To use the shared Node.js database, run <code>npm start</code> and open <a href="http://localhost:3000" target="_blank">http://localhost:3000</a>.';
    } else {
        banner.className = 'status-banner server-mode';
        icon.setAttribute('data-lucide', 'database');
        text.innerHTML = '<strong>Connected to Node.js Backend:</strong> Dreams are synchronized and saved to <code>goals.json</code> on your computer.';
    }
    if (window.lucide) {
        lucide.createIcons();
    }
}
// State Operations: Load goals from local storage or backend Express REST API
async function loadGoals() {
    if (isLocalFile) {
        try {
            const storedGoals = localStorage.getItem('dream_bucket_list_goals');
            if (storedGoals) {
                goals = JSON.parse(storedGoals);
            } else {
                goals = [...defaultGoals];
                localStorage.setItem('dream_bucket_list_goals', JSON.stringify(goals));
            }
        } catch (e) {
            console.error('Failed to load goals from localStorage:', e);
            goals = [...defaultGoals];
        }
        render();
        return;
    }
    try {
        const response = await fetch('/api/goals');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        goals = await response.json();
    } catch (e) {
        console.error('Failed to load goals from backend database:', e);
        goals = [];
    }
    render();
}
// Add Goal to local storage or backend Express REST API
async function addGoal() {
    const title = goalTitleInput.value.trim();
    const category = goalCategorySelect.value;
    const priority = goalPrioritySelect.value;
    const targetDate = goalDateInput.value;
    if (!title) return;
    if (isLocalFile) {
        const newGoal = {
            id: 'goal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            title,
            category,
            priority,
            targetDate,
            completed: false,
            createdAt: Date.now()
        };
        goals.unshift(newGoal);
        try {
            localStorage.setItem('dream_bucket_list_goals', JSON.stringify(goals));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
        resetForm();
        render();
        return;
    }
    const payload = {
        title,
        category,
        priority,
        targetDate
    };
    try {
        const response = await fetch('/api/goals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newGoal = await response.json();
        goals.unshift(newGoal);
        resetForm();
        render();
    } catch (e) {
        console.error('Failed to add goal to server:', e);
        alert('Could not save goal to database server.');
    }
}
// Reset Form Fields
function resetForm() {
    goalTitleInput.value = '';
    goalCategorySelect.value = 'adventure';
    goalPrioritySelect.value = 'medium';
    goalDateInput.value = '';
}
// Toggle Complete via local storage or backend Express REST API
async function toggleGoalComplete(id) {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const updatedCompleted = !goal.completed;
    if (isLocalFile) {
        goal.completed = updatedCompleted;
        try {
            localStorage.setItem('dream_bucket_list_goals', JSON.stringify(goals));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
        if (goal.completed) {
            triggerCelebration();
        }
        render();
        return;
    }
    try {
        const response = await fetch(`/api/goals/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: updatedCompleted })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updatedGoal = await response.json();
        goal.completed = updatedGoal.completed;
        if (goal.completed) {
            triggerCelebration();
        }
        render();
    } catch (e) {
        console.error('Failed to update completion on server:', e);
        alert('Could not update status on server.');
    }
}
// Trigger Confetti Celebration
function triggerCelebration() {
    const duration = 1.5 * 1000;
    const end = Date.now() + duration;
    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#a78bfa', '#ec4899', '#3b82f6']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#a78bfa', '#ec4899', '#3b82f6']
        });
        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}
// Start Edit Mode
function startEditGoal(id) {
    editingGoalId = id;
    render();
}
// Cancel Edit Mode
function cancelEditGoal() {
    editingGoalId = null;
    render();
}
// Save Edited Goal details via local storage or Express REST API
async function saveEditGoal(id) {
    const editTitle = document.getElementById(`edit-title-${id}`).value.trim();
    const editCategory = document.getElementById(`edit-category-${id}`).value;
    const editPriority = document.getElementById(`edit-priority-${id}`).value;
    const editDate = document.getElementById(`edit-date-${id}`).value;
    if (!editTitle) return;
    if (isLocalFile) {
        const goalIndex = goals.findIndex(g => g.id === id);
        if (goalIndex !== -1) {
            goals[goalIndex].title = editTitle;
            goals[goalIndex].category = editCategory;
            goals[goalIndex].priority = editPriority;
            goals[goalIndex].targetDate = editDate;
            try {
                localStorage.setItem('dream_bucket_list_goals', JSON.stringify(goals));
            } catch (e) {
                console.error('Failed to save to localStorage:', e);
            }
        }
        editingGoalId = null;
        render();
        return;
    }
    const payload = {
        title: editTitle,
        category: editCategory,
        priority: editPriority,
        targetDate: editDate
    };
    try {
        const response = await fetch(`/api/goals/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updatedGoal = await response.json();
        
        const goalIndex = goals.findIndex(g => g.id === id);
        if (goalIndex !== -1) {
            goals[goalIndex] = updatedGoal;
        }
        editingGoalId = null;
        render();
    } catch (e) {
        console.error('Failed to update goal details on server:', e);
        alert('Could not save changes on server.');
    }
}
// Delete Goal via local storage or backend Express REST API
async function deleteGoal(id) {
    const element = document.getElementById(`item-${id}`);
    if (!element) return;
    element.classList.add('fall-out');
    // Wait for animation transition to complete
    element.addEventListener('animationend', async () => {
        if (isLocalFile) {
            goals = goals.filter(g => g.id !== id);
            try {
                localStorage.setItem('dream_bucket_list_goals', JSON.stringify(goals));
            } catch (e) {
                console.error('Failed to save to localStorage:', e);
            }
            render();
            return;
        }
        try {
            const response = await fetch(`/api/goals/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            goals = goals.filter(g => g.id !== id);
            render();
        } catch (e) {
            console.error('Failed to delete goal from server:', e);
            alert('Could not delete goal from server.');
            render();
        }
    }, { once: true });
}
// Formatting utilities
function formatCategoryName(category) {
    const mapping = {
        'adventure': 'Adventure',
        'travel': 'Travel',
        'career': 'Career',
        'health': 'Health & Fitness',
        'creative': 'Creative & Skills',
        'personal': 'Personal'
    };
    return mapping[category] || category;
}
// Format date into human readable form
function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const [year, month, day] = dateStr.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', options);
    } catch (e) {
        return dateStr;
    }
}
// Helper: check if target date is in the past
function isOverdue(dateStr, isCompleted) {
    if (!dateStr || isCompleted) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = dateStr.split('-');
    const target = new Date(year, month - 1, day);
    target.setHours(0, 0, 0, 0);
    return target < today;
}
// Render Logic
function render() {
    // 1. Calculate & Render Stats/Progress
    updateStats();
    // 2. Filter & Sort Goals Array
    let filteredGoals = goals.filter(goal => {
        // Tab filtering
        if (currentFilter === 'active' && goal.completed) return false;
        if (currentFilter === 'completed' && !goal.completed) return false;
        // Search filtering
        if (searchQuery) {
            const matchesTitle = goal.title.toLowerCase().includes(searchQuery);
            const matchesCategory = formatCategoryName(goal.category).toLowerCase().includes(searchQuery);
            return matchesTitle || matchesCategory;
        }
        return true;
    });
    // Sorting
    filteredGoals.sort((a, b) => {
        if (currentSort === 'newest') {
            return b.createdAt - a.createdAt;
        }
        if (currentSort === 'oldest') {
            return a.createdAt - b.createdAt;
        }
        if (currentSort === 'priority') {
            const priorityWeight = { 'high': 3, 'medium': 2, 'low': 1 };
            const diff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
            return diff !== 0 ? diff : b.createdAt - a.createdAt;
        }
        if (currentSort === 'date') {
            if (!a.targetDate && !b.targetDate) return b.createdAt - a.createdAt;
            if (!a.targetDate) return 1;
            if (!b.targetDate) return -1;
            return new Date(a.targetDate) - new Date(b.targetDate);
        }
        return 0;
    });
    // 3. Render List DOM
    goalsList.innerHTML = '';
    if (filteredGoals.length === 0) {
        emptyState.style.display = 'flex';
        goalsList.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        goalsList.style.display = 'flex';
        filteredGoals.forEach(goal => {
            const isEditing = goal.id === editingGoalId;
            const li = document.createElement('li');
            li.id = `item-${goal.id}`;
            li.className = `goal-item ${goal.completed ? 'completed' : ''}`;
            if (isEditing) {
                // Editing state markup
                li.innerHTML = `
                    <div class="goal-edit-form">
                        <input type="text" id="edit-title-${goal.id}" class="goal-edit-input" value="${escapeHtml(goal.title)}" placeholder="Edit your dream..." required max="100">
                        <div class="edit-meta-row">
                            <select id="edit-category-${goal.id}">
                                <option value="adventure" ${goal.category === 'adventure' ? 'selected' : ''}>Adventure</option>
                                <option value="travel" ${goal.category === 'travel' ? 'selected' : ''}>Travel</option>
                                <option value="career" ${goal.category === 'career' ? 'selected' : ''}>Career & Personal Growth</option>
                                <option value="health" ${goal.category === 'health' ? 'selected' : ''}>Health & Fitness</option>
                                <option value="creative" ${goal.category === 'creative' ? 'selected' : ''}>Creative & Skills</option>
                                <option value="personal" ${goal.category === 'personal' ? 'selected' : ''}>Personal Goals</option>
                            </select>
                            <select id="edit-priority-${goal.id}">
                                <option value="low" ${goal.priority === 'low' ? 'selected' : ''}>Low Priority</option>
                                <option value="medium" ${goal.priority === 'medium' ? 'selected' : ''}>Medium Priority</option>
                                <option value="high" ${goal.priority === 'high' ? 'selected' : ''}>High Priority</option>
                            </select>
                            <input type="date" id="edit-date-${goal.id}" value="${goal.targetDate || ''}">
                        </div>
                        <div class="edit-actions">
                            <button onclick="cancelEditGoal()" class="btn-sm btn-cancel">Cancel</button>
                            <button onclick="saveEditGoal('${goal.id}')" class="btn-sm btn-save">Save Changes</button>
                        </div>
                    </div>
                `;
            } else {
                // Normal view state markup
                const isGoalOverdue = isOverdue(goal.targetDate, goal.completed);
                const formattedDate = formatDate(goal.targetDate);
                
                li.innerHTML = `
                    <div class="goal-card-main">
                        <label class="checkbox-container" aria-label="Mark goal complete">
                            <input type="checkbox" ${goal.completed ? 'checked' : ''} onchange="toggleGoalComplete('${goal.id}')">
                            <span class="checkmark"></span>
                        </label>
                        <div class="goal-details">
                            <span class="goal-title-text">${escapeHtml(goal.title)}</span>
                            <div class="goal-meta">
                                <span class="badge badge-category ${goal.category}">
                                    <i data-lucide="tag"></i> ${formatCategoryName(goal.category)}
                                </span>
                                <span class="badge badge-priority ${goal.priority}">
                                    ${goal.priority}
                                </span>
                                ${formattedDate ? `
                                    <span class="date-tag ${isGoalOverdue ? 'overdue' : ''}">
                                        <i data-lucide="${isGoalOverdue ? 'alert-triangle' : 'calendar'}"></i>
                                        ${formattedDate} ${isGoalOverdue ? '(Overdue)' : ''}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                        <div class="action-buttons">
                            <button onclick="startEditGoal('${goal.id}')" class="btn-icon edit-btn" title="Edit goal" aria-label="Edit goal">
                                <i data-lucide="edit-3"></i>
                            </button>
                            <button onclick="deleteGoal('${goal.id}')" class="btn-icon delete-btn" title="Delete goal" aria-label="Delete goal">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                `;
            }
            goalsList.appendChild(li);
        });
    }
    // Bind Lucide Icons to draw SVGs for elements added dynamically
    lucide.createIcons();
}
// Helper to escape HTML tags to prevent XSS issues
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
// Calculate and Update Stats Panel
function updateStats() {
    const total = goals.length;
    const completed = goals.filter(g => g.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    statTotal.textContent = total;
    statCompleted.textContent = completed;
    statPercent.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
    // Dynamic Motivational Text based on percentage
    if (total === 0) {
        progressText.textContent = "Start writing your dreams down!";
    } else if (percent === 0) {
        progressText.textContent = "Time to make the first move!";
    } else if (percent > 0 && percent <= 30) {
        progressText.textContent = "Off to a wonderful start! Keep dreaming.";
    } else if (percent > 30 && percent <= 65) {
        progressText.textContent = "Fantastic! You are actively matching your goals.";
    } else if (percent > 65 && percent < 100) {
        progressText.textContent = "You're doing amazing! Almost there!";
    } else if (percent === 100) {
        progressText.textContent = "Unreal! You checked off every dream on this list! 🎉";
    }
}
