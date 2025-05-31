// Load tasks and initialize calendar on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchTasks();
  initCalendar();
  document.getElementById('taskForm').addEventListener('submit', addOrUpdateTask);
  checkDeadlines();
  // Đảm bảo menu ẩn mặc định trên di động
  if (window.innerWidth <= 768) {
    document.getElementById('sec1').style.display = 'none';
    document.getElementById('bt2').style.display = 'block';
  } else {
    document.getElementById('sec1').style.display = 'block';
    document.getElementById('bt2').style.display = 'none';
  }
});

// Toggle sections
function showSection2() {
  const sec1 = document.getElementById('sec1');
  const bt2 = document.getElementById('bt2');
  if (window.innerWidth <= 768) {
    // Trên di động: Toggle menu
    sec1.style.display = sec1.style.display === 'block' ? 'none' : 'block';
    bt2.style.display = 'block'; // Luôn hiển thị nút menu trên di động
    if (sec1.style.display === 'none') {
      document.getElementById('calendar').style.display = 'none';
      document.getElementById('taskList').style.display = 'block';
      document.getElementById('sec2Title').textContent = 'Tác vụ';
    }
  } else {
    // Trên web: Toggle menu
    sec1.style.display = sec1.style.display === 'block' ? 'none' : 'block';
    bt2.style.display = sec1.style.display === 'block' ? 'none' : 'block';
    document.getElementById('calendar').style.display = 'none';
    document.getElementById('taskList').style.display = 'block';
    document.getElementById('sec2Title').textContent = 'Tác vụ';
  }
}

function showSection1() {
  const sec1 = document.getElementById('sec1');
  const bt2 = document.getElementById('bt2');
  if (window.innerWidth <= 768) {
    // Trên di động: menu
    sec1.style.display = 'block';
    bt2.style.display = 'block';
  } else {
    // Trên web: Hiển thị menu
    sec1.style.display = 'block';
    bt2.style.display = 'none';
  }
}

function showSection3(options = {}) {
  document.getElementById('sec3').style.display = 'block';
  const formTitle = document.getElementById('formTitle');
  const submitButton = document.getElementById('submitButton');
  const taskInput = document.getElementById('taskInput');
  const dueDate = document.getElementById('dueDate');
  const noteColor = document.getElementById('noteColor');
  const isToday = document.getElementById('isToday');
  const important = document.getElementById('important');

  if (options.id) {
    formTitle.textContent = 'Chỉnh sửa';
    submitButton.textContent = 'Cập nhật';
    taskInput.value = options.text || '';
    dueDate.value = options.dueDate ? new Date(options.dueDate).toISOString().split('T')[0] : '';
    noteColor.value = options.color || '';
    isToday.checked = options.isToday || false;
    important.checked = options.important || false;
    submitButton.setAttribute('data-id', options.id);
  } else {
    formTitle.textContent = 'Tạo mới';
    submitButton.textContent = 'Thêm';
    taskInput.value = '';
    dueDate.value = options.date || '';
    noteColor.value = '';
    isToday.checked = options.isToday || false;
    important.checked = options.important || false;
    submitButton.removeAttribute('data-id');
  }
}

function disappearSection3() {
  document.getElementById('sec3').style.display = 'none';
  document.getElementById('taskInput').value = '';
  document.getElementById('dueDate').value = '';
  document.getElementById('noteColor').value = '';
  document.getElementById('isToday').checked = false;
  document.getElementById('important').checked = false;
  document.getElementById('formTitle').textContent = 'Tạo mới';
  document.getElementById('submitButton').textContent = 'Thêm';
  document.getElementById('submitButton').removeAttribute('data-id');
}

// Initialize FullCalendar
let calendar; // Biến toàn cục để lưu đối tượng FullCalendar
function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: async (info, successCallback) => {
      const tasks = await fetchTasks(null, true);
      const events = tasks
        .filter(task => !task.deleted && task.dueDate) // Chỉ hiển thị công việc chưa xóa và có dueDate
        .map(task => ({
          id: task._id,
          title: task.text,
          start: task.dueDate,
          color: task.color || '#87CEFF',
          extendedProps: { isToday: task.isToday, important: task.important }
        }));
      successCallback(events);
    },
    dateClick: function (info) {
      showSection3({ date: info.dateStr });
    },
    eventClick: function (info) {
      showSection3({
        id: info.event.id,
        text: info.event.title,
        dueDate: info.event.start,
        color: info.event.backgroundColor,
        isToday: info.event.extendedProps.isToday,
        important: info.event.extendedProps.important
      });
    },
    height: 'auto', // Tự động điều chỉnh chiều cao
    contentHeight: 'auto',
    aspectRatio: 1.5 // Tỷ lệ chiều rộng/chiều cao
  });
  calendar.render();
}

function showCalendar() {
  document.getElementById('sec2').style.display = 'block';
  document.getElementById('calendar').style.display = 'block';
  document.getElementById('taskList').style.display = 'none';
  document.getElementById('sec2Title').textContent = 'Lịch';
  if (window.innerWidth <= 768) {
    document.getElementById('sec1').style.display = 'none';
    document.getElementById('bt2').style.display = 'block';
  }
  if (calendar) {
    calendar.refetchEvents(); // Cập nhật sự kiện khi mở tab Lịch
  }
}

// Show completed tasks
function showCompleted() {
  document.getElementById('sec2').style.display = 'block';
  document.getElementById('calendar').style.display = 'none';
  document.getElementById('taskList').style.display = 'block';
  document.getElementById('sec2Title').textContent = 'Đã hoàn thành';
  fetchTasks('completed');
  if (window.innerWidth <= 768) {
    document.getElementById('sec1').style.display = 'none';
    document.getElementById('bt2').style.display = 'block';
  }
}

// Fetch and display tasks
async function fetchTasks(filter = '', forCalendar = false) {
  try {
    let url;
    if (filter === 'completed') {
      url = 'https://cmctodo.onrender.com/tasks?filter=completed';
    } else if (filter === 'history') {
      url = 'https://cmctodo.onrender.com/tasks?history=true';
    } else {
      url = filter ? `https://cmctodo.onrender.com/tasks?filter=${filter}` : 'https://cmctodo.onrender.com/tasks';
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const tasks = await response.json();
    if (forCalendar) return tasks;
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.setAttribute('data-color', task.color || '#87CEEB');
      li.innerHTML = `
        <div class="task-content" onclick="editTask('${task._id}', '${task.text}', '${task.dueDate || ''}', '${task.color || ''}', ${task.isToday}, ${task.important})">
          <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
        </div>
        <div class="task-details">
          <span>Đã tạo: ${new Date(task.createdAt).toLocaleString('vi-VN')}</span>
          ${task.dueDate ? `<span> | Hạn: ${new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>` : ''}
          ${task.completedAt ? `<span> | Hoàn thành: ${new Date(task.completedAt).toLocaleString('vi-VN')}</span>` : ''}
          ${task.isToday ? '<span> | Ngày của tôi</span>' : ''}
          ${task.important ? '<span> | Quan trọng</span>' : ''}
          ${task.deleted ? '<span> | Đã xóa</span>' : ''}
          ${!task.deleted ? `
            <div>
              <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task._id}', this.checked)">
              <button onclick="deleteTask('${task._id}')">Xóa</button>
            </div>
          ` : ''}
        </div>
      `;
      li.classList.add('added');
      taskList.appendChild(li);
    });
    taskList.style.display = 'block';
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    alert('Không thể tải danh sách công việc!');
  }
}

// Edit task
function editTask(id, text, dueDate, color, isToday, important) {
  showSection3({ id, text, dueDate, color, isToday, important });
}

// Add or update task
async function addOrUpdateTask(event) {
  event.preventDefault();
  const taskInput = document.getElementById('taskInput');
  const dueDate = document.getElementById('dueDate').value;
  const noteColor = document.getElementById('noteColor').value;
  const isToday = document.getElementById('isToday').checked;
  const important = document.getElementById('important').checked;
  const submitButton = document.getElementById('submitButton');
  const text = taskInput.value.trim();
  const id = submitButton.getAttribute('data-id');
  if (!text) return;

  try {
    let response;
    if (id) {
      response = await fetch(`https://cmctodo.onrender.com/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, dueDate, color: noteColor, isToday, important })
      });
    } else {
      response = await fetch('https://cmctodo.onrender.com/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, dueDate, color: noteColor, isToday, important })
      });
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || (id ? 'Failed to update task' : 'Failed to add task'));
    }
    disappearSection3();
    fetchTasks();
    if (calendar) {
      calendar.refetchEvents(); // Cập nhật lịch sau khi thêm/sửa
    }
  } catch (error) {
    console.error('Error processing task:', error);
    alert(`Không thể ${id ? 'cập nhật' : 'thêm'} công việc: ${error.message}`);
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
    const li = document.querySelector(`#taskList li:has(button[onclick="deleteTask('${id}')"])`);
    li.classList.add('removed');
    setTimeout(() => {
      fetchTasks();
      if (calendar) {
        calendar.refetchEvents(); // Cập nhật lịch sau khi xóa
      }
    }, 300);
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
    if (calendar) {
      calendar.refetchEvents(); // Cập nhật lịch sau khi toggle
    }
  } catch (error) {
    console.error('Error toggling task:', error);
    alert('Không thể cập nhật công việc: ' + error.message);
  }
}

// Filter tasks
function filterTasks(type) {
  document.getElementById('sec2').style.display = 'block';
  document.getElementById('calendar').style.display = 'none';
  document.getElementById('taskList').style.display = 'block';
  document.getElementById('sec2Title').textContent = type === 'today' ? 'Ngày của tôi' : type === 'important' ? 'Quan trọng' : 'Tác vụ';
  fetchTasks(type);
  if (window.innerWidth <= 768) {
    document.getElementById('sec1').style.display = 'none';
    document.getElementById('bt2').style.display = 'block';
  }
}

// Check deadlines and show notifications
function checkDeadlines() {
  setInterval(async () => {
    const tasks = await fetchTasks(null, true);
    const now = new Date();
    tasks.forEach(task => {
      if (task.dueDate && !task.completed && !task.deleted) {
        const due = new Date(task.dueDate);
        if (due.toDateString() === now.toDateString()) {
          alert(`Nhắc nhở: Công việc "${task.text}" đã đến hạn!`);
        }
      }
    });
  }, 60000);
}