// Load tasks on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchTasks();
  document.getElementById('taskForm').addEventListener('submit', addTask);
});

// Toggle sections
function showSection2() {
  document.getElementById('sec1').style.display = 'none';
  document.getElementById('sec2').style.display = 'block';
  document.getElementById('bt2').style.display = 'block';
}

function showSection1() {
  document.getElementById('sec1').style.display = 'block';
  document.getElementById('sec2').style.display = 'block';
  document.getElementById('bt2').style.display = 'none';
}

function showSection3() {
  document.getElementById('sec3').style.display = 'block';
}

function disappearSection3() {
  document.getElementById('sec3').style.display = 'none';
  document.getElementById('taskInput').value = '';
  document.getElementById('isToday').checked = false;
  document.getElementById('important').checked = false;
}

// Fetch and display tasks
async function fetchTasks(filter = '') {
  try {
    const url = filter ? `https://cmctodo.onrender.com/tasks?filter=${filter}` : 'https://cmctodo.onrender.com/tasks';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const tasks = await response.json();
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
        <div>
          <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task._id}', this.checked)">
          <button onclick="deleteTask('${task._id}')">Xóa</button>
        </div>
      `;
      taskList.appendChild(li);
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    alert('Không thể tải danh sách công việc!');
  }
}

// Add task
async function addTask(event) {
  event.preventDefault();
  const taskInput = document.getElementById('taskInput');
  const isToday = document.getElementById('isToday').checked;
  const important = document.getElementById('important').checked;
  const text = taskInput.value.trim();
  if (!text) return;

  try {
    const response = await fetch('https://cmctodo.onrender.com/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, isToday, important })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add task');
    }
    taskInput.value = '';
    document.getElementById('isToday').checked = false;
    document.getElementById('important').checked = false;
    disappearSection3();
    fetchTasks();
  } catch (error) {
    console.error('Error adding task:', error);
    alert('Không thể thêm công việc: ' + error.message);
  }
}

// Delete task
async function deleteTask(id) {
  try {
    const response = await fetch(`https://cmctodo.onrender.com/tasks/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete task');
    }
    fetchTasks();
  } catch (error) {
    console.error('Error deleting task:', error);
    alert('Không thể xóa công việc: ' + error.message);
  }
}

// Toggle task completion
async function toggleTask(id, completed) {
  try {
    const response = await fetch(`https://cmctodo.onrender.com/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update task');
    }
    fetchTasks();
  } catch (error) {
    console.error('Error toggling task:', error);
    alert('Không thể cập nhật công việc: ' + error.message);
  }
}

// Filter tasks
function filterTasks(type) {
  fetchTasks(type);
}