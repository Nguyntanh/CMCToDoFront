// frontend/src/js/home.js
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'block';
    fetchTasks().catch(error => {
      console.error('Lỗi tải công việc ban đầu:', error);
      document.getElementById('taskList').innerHTML = '<li>Không thể tải công việc</li>';
    });
    initCalendar();
    document.getElementById('taskForm').addEventListener('submit', addOrUpdateTask);
    checkDeadlines();
  } else {
    document.getElementById('taskList').innerHTML = '<li>Vui lòng đăng nhập để xem công việc</li>';
    showLoginForm();
  }

  if (window.innerWidth <= 768) {
    document.getElementById('sec1').style.display = 'none';
    document.getElementById('bt2').style.display = 'block';
  } else {
    document.getElementById('sec1').style.display = 'block';
    document.getElementById('bt2').style.display = 'none';
  }
});

function showSection2() {
  const sec1 = document.getElementById('sec1');
  const bt2 = document.getElementById('bt2');
  const calendar = document.getElementById('calendar');
  const taskList = document.getElementById('taskList');
  const sec2Title = document.getElementById('sec2Title');

  if (window.innerWidth <= 768) {
    sec1.style.display = sec1.style.display === 'block' ? 'none' : 'block';
    bt2.style.display = 'block';
    if (sec1.style.display === 'none') {
      if (calendar.style.display === 'block') {
        sec2Title.textContent = 'Lịch';
      } else if (taskList.style.display === 'block') {
        sec2Title.textContent = sec2Title.textContent || 'Tác vụ';
      }
    }
  } else {
    sec1.style.display = sec1.style.display === 'block' ? 'none' : 'block';
    bt2.style.display = sec1.style.display === 'block' ? 'none' : 'block';
    if (calendar.style.display === 'block') {
      sec2Title.textContent = 'Lịch';
    } else if (taskList.style.display === 'block') {
      sec2Title.textContent = sec2Title.textContent || 'Tác vụ';
    }
  }
  if (calendar.style.display !== 'block') {
    taskList.style.display = 'block';
  }
}

function showSection1() {
  const sec1 = document.getElementById('sec1');
  const bt2 = document.getElementById('bt2');
  if (window.innerWidth <= 768) {
    sec1.style.display = 'block';
    bt2.style.display = 'block';
  } else {
    sec1.style.display = 'block';
    bt2.style.display = 'none';
  }
}

function showSection3(options = {}) {
  const sec3 = document.getElementById('sec3');
  const formTitle = document.getElementById('formTitle');
  const taskForm = document.getElementById('taskForm');

  sec3.style.display = 'block';
  formTitle.textContent = options.id ? 'Chỉnh sửa' : 'Tạo mới';
  taskForm.innerHTML = `
    <input type="text" id="taskInput" placeholder="Nhập công việc..." required value="${options.text || ''}">
    <input type="date" id="dueDate" placeholder="Ngày hết hạn" value="${options.dueDate ? new Date(options.dueDate).toISOString().split('T')[0] : options.date || ''}">
    <select id="noteColor">
      <option value="">Chọn màu</option>
      <option value="#1E90FF" ${options.color === '#1E90FF' ? 'selected' : ''}>Xanh đậm</option>
      <option value="#4682B4" ${options.color === '#4682B4' ? 'selected' : ''}>Xanh thép</option>
      <option value="#B0C4DE" ${options.color === '#B0C4DE' ? 'selected' : ''}>Xanh nhạt</option>
      <option value="#5F9EA0" ${options.color === '#5F9EA0' ? 'selected' : ''}>Xanh lam</option>
    </select>
    <label><input type="checkbox" id="isToday" ${options.isToday ? 'checked' : ''}> Ngày của tôi</label>
    <label><input type="checkbox" id="important" ${options.important ? 'checked' : ''}> Quan trọng</label>
    <button type="submit" id="submitButton" data-id="${options.id || ''}">${options.id ? 'Cập nhật' : 'Thêm'}</button>
    <button type="button" id="cancelButton">Hủy</button>
  `;
  taskForm.onsubmit = addOrUpdateTask;
  document.getElementById('cancelButton').onclick = disappearSection3;
}

function disappearSection3() {
  const sec3 = document.getElementById('sec3');
  const taskForm = document.getElementById('taskForm');
  sec3.style.display = 'none';
  taskForm.innerHTML = ''; // Reset form để tránh xung đột
  taskForm.onsubmit = null; // Xóa sự kiện submit
}

document.getElementById('searchInput').addEventListener('input', async (e) => {
  const query = e.target.value.toLowerCase();
  const tasks = await fetchTasks(null, true) || [];
  const filteredTasks = tasks.filter(task => task.text.toLowerCase().includes(query)) || [];
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  if (filteredTasks.length === 0) {
    taskList.innerHTML = '<li>Không tìm thấy công việc nào</li>';
    taskList.style.display = 'block';
    return;
  }

  filteredTasks.forEach(task => {
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
});