// frontend/src/js/auth.js
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

async function handleAuth(event) {
  event.preventDefault();
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  const username = document.getElementById('usernameInput')?.value;
  const formTitle = document.getElementById('formTitle').textContent;

  try {
    let response;
    if (formTitle === 'Đăng ký') {
      response = await fetch('https://cmctodo.onrender.com//auth/register', {
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
      response = await fetch('https://cmctodo.onrender.com//auth/login', {
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
      document.getElementById('loginBtn').style.display = 'none';
      document.getElementById('logoutBtn').style.display = 'block';
      disappearSection3();
      await fetchTasks(); // Tải công việc sau khi đăng nhập
      initCalendar(); // Khởi tạo lịch
      alert('Đăng nhập thành công!');
    }
  } catch (error) {
    console.error(`Lỗi ${formTitle.toLowerCase()}:`, error);
    alert(`${formTitle} thất bại: ${error.message}`);
  }
}

function logout() {
  localStorage.removeItem('token');
  document.getElementById('loginBtn').style.display = 'block';
  document.getElementById('logoutBtn').style.display = 'none';
  document.getElementById('taskList').innerHTML = '<li>Vui lòng đăng nhập để xem công việc</li>';
  document.getElementById('calendar').style.display = 'none';
  document.getElementById('taskList').style.display = 'block';
  document.getElementById('sec2Title').textContent = 'Tác vụ';
  alert('Đã đăng xuất!');
  showLoginForm();
}