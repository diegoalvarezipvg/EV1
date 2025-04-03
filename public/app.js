let token = localStorage.getItem('token');

const API_URL = 'http://localhost:3300';
const loginSection = document.getElementById('loginSection');
const remindersSection = document.getElementById('remindersSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const addReminderForm = document.getElementById('addReminderForm');
const remindersList = document.getElementById('remindersList');

// Check if user is already logged in
if (token) {
    showRemindersSection();
    loadReminders();
}

// Login form handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        token = data.token;
        localStorage.setItem('token', token);
        showRemindersSection();
        loadReminders();
    } catch (error) {
        alert('Login failed. Please check your credentials.');
    }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
    token = null;
    localStorage.removeItem('token');
    showLoginSection();
});

// Add reminder handler
addReminderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('reminderContent').value;
    const important = document.getElementById('important').checked;

    try {
        const response = await fetch(`${API_URL}/api/reminders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-authorization': token
            },
            body: JSON.stringify({ content, important })
        });

        if (!response.ok) {
            throw new Error('Failed to add reminder');
        }

        document.getElementById('reminderContent').value = '';
        document.getElementById('important').checked = false;
        loadReminders();
    } catch (error) {
        alert('Failed to add reminder');
    }
});

// Load reminders
async function loadReminders() {
    try {
        const response = await fetch(`${API_URL}/api/reminders`, {
            headers: {
                'x-authorization': token
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load reminders');
        }

        const reminders = await response.json();
        displayReminders(reminders);
    } catch (error) {
        alert('Failed to load reminders');
    }
}

// Display reminders
function displayReminders(reminders) {
    remindersList.innerHTML = '';
    reminders.forEach(reminder => {
        const reminderElement = document.createElement('div');
        reminderElement.className = `reminder-item ${reminder.important ? 'important' : ''}`;
        reminderElement.innerHTML = `
            <div class="reminder-content">${reminder.content}</div>
            <div class="reminder-actions">
                <button class="edit-btn" onclick="editReminder('${reminder.id}', '${reminder.content.replace(/'/g, "\\'")}', ${reminder.important})">Edit</button>
                <button class="delete-btn" onclick="deleteReminder('${reminder.id}')">Delete</button>
            </div>
        `;
        remindersList.appendChild(reminderElement);
    });
}

// Edit reminder
async function editReminder(id, currentContent, currentImportant) {
    const newContent = prompt('Edit reminder:', currentContent);
    if (!newContent) return;

    const newImportant = confirm('Is this reminder important?');

    try {
        const response = await fetch(`${API_URL}/api/reminders/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-authorization': token
            },
            body: JSON.stringify({
                content: newContent,
                important: newImportant
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update reminder');
        }

        loadReminders();
    } catch (error) {
        alert('Failed to update reminder');
    }
}

// Delete reminder
async function deleteReminder(id) {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
        const response = await fetch(`${API_URL}/api/reminders/${id}`, {
            method: 'DELETE',
            headers: {
                'x-authorization': token
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete reminder');
        }

        loadReminders();
    } catch (error) {
        alert('Failed to delete reminder');
    }
}

// Show/hide sections
function showRemindersSection() {
    loginSection.style.display = 'none';
    remindersSection.style.display = 'block';
}

function showLoginSection() {
    loginSection.style.display = 'block';
    remindersSection.style.display = 'none';
} 