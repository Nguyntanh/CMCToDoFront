const form = document.getElementById('todoForm');
const todoList = document.getElementById('todoList');
const message = document.getElementById('message');

// Sử dụng URL backend local (thay đổi khi deploy)
const apiUrl = 'https://cmctodo.onrender.com/'; // Thay bằng https://cmctodo.onrender.com/ khi deploy

async function showMessage(text, isError = false) {
    message.textContent = text;
    message.className = isError ? 'error' : '';
    setTimeout(() => (message.textContent = ''), 3000);
}

async function loadTasks() {
    try {
        todoList.innerHTML = '<li>Loading...</li>';
        const response = await fetch(`${apiUrl}tasks`); // Sửa: Gọi đúng endpoint /tasks
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const tasks = await response.json();
        todoList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `${task.text} <button class="deleteBtn" data-id="${task._id}">Delete</button>`;
            todoList.appendChild(li);
            li.querySelector('.deleteBtn').addEventListener('click', async () => {
                try {
                    const res = await fetch(`${apiUrl}tasks/${task._id}`, { method: 'DELETE' }); // Sửa: Đúng định dạng /tasks/:id
                    if (!res.ok) throw new Error('Failed to delete task');
                    li.remove();
                    showMessage('Task deleted successfully!');
                } catch (error) {
                    showMessage('Error deleting task: ' + error.message, true);
                }
            });
        });
    } catch (error) {
        showMessage('Error loading tasks: ' + error.message, true);
    }
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const task = document.getElementById('todoInput').value.trim();
    if (!task) {
        showMessage('Task cannot be empty', true);
        return;
    }
    try {
        const response = await fetch(`${apiUrl}tasks`, { // Sửa: Gọi đúng endpoint /tasks
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: task })
        });
        if (!response.ok) throw new Error('Failed to add task');
        form.reset();
        showMessage('Task added successfully!');
        loadTasks();
    } catch (error) {
        showMessage('Error adding task: ' + error.message, true);
    }
});

loadTasks();