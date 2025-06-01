function showLoginForm() {
  const sec3 = document.getElementById('sec3');
  const formTitle = document.getElementById('formTitle');
  const taskForm = document.getElementById('taskForm');

  sec3.style.display = 'block';
  formTitle.textContent = 'Đăng nhập';
  taskForm.innerHTML = `
    <input type="email" id="emailInput" placeholder="Email" required>
    <input type="password" id="passwordInput" placeholder="Mật khẩu" required>
    <button type="submit" id="submitButton">Đăng nhập</button>
    <button type="button" id="registerLink">Đăng ký</button>
    <button type="button" id="cancelButton">Hủy</button>
  `;
  taskForm.onsubmit = handleAuth;
  document.getElementById('registerLink').onclick = showRegisterForm;
  document.getElementById('cancelButton').onclick = disappearSection3;
}

function showRegisterForm() {
  const sec3 = document.getElementById('sec3');
  const formTitle = document.getElementById('formTitle');
  const taskForm = document.getElementById('taskForm');

  sec3.style.display = 'block';
  formTitle.textContent = 'Đăng ký';
  taskForm.innerHTML = `
    <input type="text" id="usernameInput" placeholder="Tên người dùng" required>
    <input type="email" id="emailInput" placeholder="Email" required>
    <input type="password" id="passwordInput" placeholder="Mật khẩu" required>
    <button type="submit" id="submitButton">Đăng ký</button>
    <button type="button" id="loginLink">Đăng nhập</button>
    <button type="button" id="cancelButton">Hủy</button>
  `;
  taskForm.onsubmit = handleAuth;
  document.getElementById('loginLink').onclick = showLoginForm;
  document.getElementById('cancelButton').onclick = disappearSection3;
}

function showChangeAvatarForm() {
  const sec3 = document.getElementById('sec3');
  const formTitle = document.getElementById('formTitle');
  const taskForm = document.getElementById('taskForm');
  const currentAvatar = localStorage.getItem('avatarUrl') || 'assets/img/default-avatar.jpg';

  // Danh sách ảnh đại diện có sẵn
  const avatars = [
    { url: 'assets/img/avatar1.jpg', label: 'Avatar 1' },
    { url: 'assets/img/avatar2.jpg', label: 'Avatar 2' },
    { url: 'assets/img/avatar3.jpg', label: 'Avatar 3' },
    { url: 'assets/img/avatar4.jpg', label: 'Avatar 4' }
  ];

  sec3.style.display = 'block';
  formTitle.textContent = 'Đổi ảnh đại diện';
  taskForm.innerHTML = `
    <div class="avatar-options">
      ${avatars.map(avatar => `
        <label class="avatar-option">
          <input type="radio" name="avatar" value="${avatar.url}" ${currentAvatar === avatar.url ? 'checked' : ''}>
          <img src="${avatar.url}" alt="${avatar.label}">
        </label>
      `).join('')}
    </div>
    <button type="submit" id="submitButton">Cập nhật</button>
    <button type="button" id="cancelButton">Hủy</button>
  `;
  taskForm.onsubmit = handleAvatarChange;
  document.getElementById('cancelButton').onclick = disappearSection3;
  document.getElementById('dropdownMenu').classList.remove('show');
}

async function handleAvatarChange(event) {
  event.preventDefault();
  const selectedAvatar = document.querySelector('input[name="avatar"]:checked');
  if (!selectedAvatar) {
    alert('Vui lòng chọn một ảnh đại diện!');
    return;
  }
  const avatarUrl = selectedAvatar.value;

  try {
    const response = await fetch('https://cmctodo.onrender.com/auth/update-avatar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ avatarUrl })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Cập nhật ảnh đại diện thất bại');
    }

    const data = await response.json();
    localStorage.setItem('avatarUrl', data.avatarUrl);
    document.getElementById('avatarImg').src = data.avatarUrl;
    alert('Cập nhật ảnh đại diện thành công!');
    disappearSection3();
  } catch (error) {
    console.error('Lỗi cập nhật ảnh đại diện:', error);
    alert(`Cập nhật ảnh đại diện thất bại: ${error.message}`);
  }
}

async function handleAuth(event) {
  event.preventDefault();
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  const username = document.getElementById('usernameInput')?.value;
  const formTitle = document.getElementById('formTitle').textContent;

  try {
    let response;
    if (formTitle === 'Đăng ký') {
      response = await fetch('https://cmctodo.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đăng ký thất bại');
      }
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      showLoginForm();
    } else {
      response = await fetch('https://cmctodo.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đăng nhập thất bại');
      }
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username || email);
      localStorage.setItem('avatarUrl', data.avatarUrl || 'assets/img/default-avatar.jpg');
      updateAuthButtons(data.username || email);
      disappearSection3();
      await fetchTasks();
      initCalendar();
      alert('Đăng nhập thành công!');
    }
  } catch (error) {
    console.error(`Lỗi ${formTitle.toLowerCase()}:`, error);
    alert(`${formTitle} thất bại: ${error.message}`);
  }
}

function updateAuthButtons(username) {
  document.getElementById('loginBtn').style.display = 'none';
  document.getElementById('userMenu').style.display = 'block';
  document.getElementById('usernameDisplay').textContent = username;
  const avatarUrl = localStorage.getItem('avatarUrl') || 'assets/img/default-avatar.jpg';
  document.getElementById('avatarImg').src = avatarUrl;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('avatarUrl');
  document.getElementById('loginBtn').style.display = 'block';
  document.getElementById('userMenu').style.display = 'none';
  document.getElementById('dropdownMenu').classList.remove('show');
  document.getElementById('taskList').innerHTML = '<li>Vui lòng đăng nhập để xem công việc</li>';
  document.getElementById('calendar').style.display = 'none';
  document.getElementById('taskList').style.display = 'block';
  document.getElementById('sec2Title').textContent = 'Tác vụ';
  alert('Đã đăng xuất!');
  showLoginForm();
}

document.addEventListener('DOMContentLoaded', () => {
  const avatarBtn = document.getElementById('avatarBtn');
  const dropdownMenu = document.getElementById('dropdownMenu');
  
  avatarBtn?.addEventListener('click', () => {
    dropdownMenu.classList.toggle('show');
  });

  document.addEventListener('click', (event) => {
    if (!avatarBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.remove('show');
    }
  });

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  if (token && username) {
    updateAuthButtons(username);
    fetchTasks().catch(error => {
      console.error('Lỗi tải công việc ban đầu:', error);
      document.getElementById('taskList').innerHTML = '<li>Không thể tải công việc</li>';
    });
    initCalendar();
    document.getElementById('taskForm').addEventListener('submit', addOrUpdateTask);
  } else {
    document.getElementById('taskList').innerHTML = '<li>Vui lòng đăng nhập để xem công việc</li>';
    showLoginForm();
  }
});