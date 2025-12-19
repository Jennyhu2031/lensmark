const API_BASE = 'http://localhost:8001';

// Auth elements
const authSection = document.getElementById('auth-section');
const profileSection = document.getElementById('profile-section');
const authForm = document.getElementById('auth-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const authMsg = document.getElementById('auth-message');

// Profile elements
const displayUsername = document.getElementById('display-username');
const displayGender = document.getElementById('display-gender');
const setGenderBtn = document.getElementById('set-gender-btn');
const logoutBtn = document.getElementById('logout-btn');

// Check login status on load
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    showProfile(user);
  }
});

function showProfile(user) {
  authSection.classList.add('hidden');
  profileSection.classList.remove('hidden');
  displayUsername.textContent = user.username;
  displayGender.textContent = user.gender || 'Not set';
}

function showAuth() {
  authSection.classList.remove('hidden');
  profileSection.classList.add('hidden');
  localStorage.removeItem('user');
}

async function handleAuth(type) {
  authMsg.textContent = '';
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    authMsg.textContent = 'Please enter username and password.';
    authMsg.className = 'text-sm text-red-500 text-center min-h-[1.25rem]';
    return;
  }

  const endpoint = type === 'login' ? '/api/login' : '/api/register';

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      if (type === 'register') {
        // Auto login after register
        await handleAuth('login');
      } else {
        localStorage.setItem('user', JSON.stringify(data));
        showProfile(data);
      }
    } else {
      authMsg.textContent = data?.detail || `${type === 'login' ? 'Login' : 'Signup'} failed.`;
      authMsg.className = 'text-sm text-red-500 text-center min-h-[1.25rem]';
    }
  } catch (err) {
    authMsg.textContent = 'Network error. Is the server running?';
    authMsg.className = 'text-sm text-red-500 text-center min-h-[1.25rem]';
  }
}

loginBtn.addEventListener('click', () => handleAuth('login'));
signupBtn.addEventListener('click', () => handleAuth('signup'));

logoutBtn.addEventListener('click', showAuth);

setGenderBtn.addEventListener('click', async () => {
  const currentGender = displayGender.textContent;
  const newGender = prompt('Enter gender (Male/Female/Other):', currentGender === 'Not set' ? '' : currentGender);
  
  if (newGender !== null && newGender.trim() !== '') {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      const res = await fetch(`${API_BASE}/api/user/update_gender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, gender: newGender.trim() }),
      });
      
      const data = await res.json();
      if (res.ok) {
        user.gender = data.gender;
        localStorage.setItem('user', JSON.stringify(user));
        displayGender.textContent = data.gender;
      } else {
        alert(data.detail || 'Failed to update gender.');
      }
    } catch (err) {
      alert('Network error.');
    }
  }
});
