// frontend/src/js/tasks.js
async function fetchTasks(filter = '', forCalendar = false) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      if (forCalendar) return [];
      document.getElementById('taskList').innerHTML = '<li>Vui lòng đăng nhập để xem công việc</li>';
      return [];
    }

    let url;
    if (filter === 'completed') {
      url = 'http://localhost:3000/tasks?filter=completed';
    } else if (filter === 'history') {
      url = 'http://localhost:3000/tasks?history=true';
    } else {
      url = filter ? `http://localhost:3000/tasks?filter=${filter}` : 'http://localhost:3000/tasks';
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      document.getElementById('loginBtn').style.display = 'block';
      document.getElementById('logoutBtn').style.display = 'none';
      showLoginForm();
      if (forCalendar) return [];
      document.getElementById('taskList').innerHTML = '<li>Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.</li>';
      return [];
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể tải công việc');
    }
    const tasks = await response.json() || [];
    if (forCalendar) return tasks;

    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (tasks.length === 0) {
      taskList.innerHTML = '<li>Không có công việc nào</li>';
      taskList.style.display = 'block';
      return tasks;
    }

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
    console.error('Lỗi khi tải công việc:', error);
    if (forCalendar) return [];
    document.getElementById('taskList').innerHTML = '<li>Không thể tải danh sách công việc!</li>';
    return [];
  }
}

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
    const token = localStorage.getItem('token');
    if (!token) {
      showLoginForm();
      alert('Vui lòng đăng nhập để thêm công việc');
      return;
    }

    let response;
    if (id) {
      response = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text, dueDate, color: noteColor, isToday, important })
      });
    } else {
      response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text, dueDate, color: noteColor, isToday, important })
      });
    }

    if (response.status === 401) {
      localStorage.removeItem('token');
      document.getElementById('loginBtn').style.display = 'block';
      document.getElementById('logoutBtn').style.display = 'none';
      showLoginForm();
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || (id ? 'Không thể cập nhật công việc' : 'Không thể thêm công việc'));
    }

    disappearSection3();
    await fetchTasks();
    if (calendar) {
      calendar.refetchEvents();
    }
  } catch (error) {
    console.error('Lỗi khi xử lý công việc:', error);
    alert(`Không thể ${id ? 'cập nhật' : 'thêm'} công việc: ${error.message}`);
  }
}

async function deleteTask(id) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showLoginForm();
      alert('Vui lòng đăng nhập để xóa công việc');
      return;
    }

    const response = await fetch(`http://localhost:3000/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      document.getElementById('loginBtn').style.display = 'block';
      document.getElementById('logoutBtn').style.display = 'none';
      showLoginForm();
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể xóa công việc');
    }

    const li = document.querySelector(`#taskList li:has(button[onclick="deleteTask('${id}')"])`);
    if (li) {
      li.classList.add('removed');
      setTimeout(async () => {
        await fetchTasks();
        if (calendar) {
          calendar.refetchEvents();
        }
      }, 300);
    }
  } catch (error) {
    console.error('Lỗi khi xóa công việc:', error);
    alert('Không thể xóa công việc: ' + error.message);
  }
}

async function toggleTask(id, completed) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showLoginForm();
      alert('Vui lòng đăng nhập để cập nhật công việc');
      return;
    }

    const response = await fetch(`http://localhost:3000/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ completed })
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      document.getElementById('loginBtn').style.display = 'block';
      document.getElementById('logoutBtn').style.display = 'none';
      showLoginForm();
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể cập nhật công việc');
    }

    await fetchTasks();
    if (calendar) {
      calendar.refetchEvents();
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật công việc:', error);
    alert('Không thể cập nhật công việc: ' + error.message);
  }
}

function filterTasks(type) {
  document.getElementById('sec2').style.display = 'block';
  document.getElementById('calendar').style.display = 'none';
  document.getElementById('taskList').style.display = 'block';
  document.getElementById('sec2Title').textContent = type === 'today' ? 'Ngày của tôi' : type === 'important' ? 'Quan trọng' : type === 'completed' ? 'Đã hoàn thành' : 'Tác vụ';
  fetchTasks(type);
  if (window.innerWidth <= 768) {
    document.getElementById('sec1').style.display = 'none';
    document.getElementById('bt2').style.display = 'block';
  }
}

function showCompleted() {
  filterTasks('completed');
}

function checkDeadlines() {
  setInterval(async () => {
    const tasks = await fetchTasks(null, true) || [];
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

function editTask(id, text, dueDate, color, isToday, important) {
  showSection3({ id, text, dueDate, color, isToday, important });
}