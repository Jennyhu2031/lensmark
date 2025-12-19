const API_BASE = 'http://localhost:8001';

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginMsg = document.getElementById('login-message');
const registerMsg = document.getElementById('register-message');

tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('border-b-primary');
  tabRegister.classList.remove('border-b-primary');
  loginForm.style.display = '';
  registerForm.style.display = 'none';
});

tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('border-b-primary');
  tabLogin.classList.remove('border-b-primary');
  registerForm.style.display = '';
  loginForm.style.display = 'none';
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginMsg.textContent = '';
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  if (!username || !password) {
    loginMsg.textContent = 'Please enter username and password.';
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      loginMsg.textContent = 'Logged in successfully.';
      loginMsg.classList.remove('text-stone-600', 'dark:text-stone-300');
      loginMsg.classList.add('text-primary');
    } else {
      loginMsg.textContent = data?.detail || 'Login failed.';
    }
  } catch (err) {
    loginMsg.textContent = 'Network error. Is the server running on 8001?';
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerMsg.textContent = '';
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value;
  if (!username || !password) {
    registerMsg.textContent = 'Please enter username and password.';
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      registerMsg.textContent = 'Account created. You can log in now.';
      registerMsg.classList.remove('text-stone-600', 'dark:text-stone-300');
      registerMsg.classList.add('text-primary');
    } else {
      registerMsg.textContent = data?.detail || 'Registration failed.';
    }
  } catch (err) {
    registerMsg.textContent = 'Network error. Is the server running on 8001?';
  }
});

