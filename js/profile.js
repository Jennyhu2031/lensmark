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
const displayGenderText = document.getElementById('display-gender-text');
const logoutBtn = document.getElementById('logout-btn');
const profileImg = document.getElementById('profile-img');
const profileAvatarIcon = document.getElementById('profile-avatar-icon');
const editAvatarBtn = document.getElementById('edit-avatar-btn');
const avatarInput = document.getElementById('avatar-input');
const genderButtons = document.querySelectorAll('.gender-radio');

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
  displayGenderText.textContent = user.gender || 'Not set';
  
  // Update gender buttons state
  updateGenderButtonsUI(user.gender);
  
  // Update avatar
  if (user.avatar) {
    profileImg.src = user.avatar;
    profileImg.classList.remove('hidden');
    profileAvatarIcon.classList.add('hidden');
  } else {
    profileImg.classList.add('hidden');
    profileAvatarIcon.classList.remove('hidden');
  }
}

function updateGenderButtonsUI(gender) {
  console.log("Updating gender UI for:", gender);
  genderButtons.forEach(btn => {
    const isSelected = btn.dataset.gender === gender;
    if (isSelected) {
      btn.classList.add('bg-primary', 'text-[#111816]', 'border-primary');
      btn.classList.remove('bg-white/50', 'dark:bg-black/20', 'border-stone-200', 'dark:border-stone-800');
    } else {
      btn.classList.remove('bg-primary', 'text-[#111816]', 'border-primary');
      btn.classList.add('bg-white/50', 'dark:bg-black/20', 'border-stone-200', 'dark:border-stone-800');
    }
  });
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
      if (type === 'signup') {
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

// Gender Radio Buttons logic
genderButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    const newGender = btn.dataset.gender;
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
      const res = await fetch(`${API_BASE}/api/user/update_gender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, gender: newGender }),
      });
      
      const data = await res.json();
      if (res.ok) {
        user.gender = data.gender;
        localStorage.setItem('user', JSON.stringify(user));
        displayGenderText.textContent = data.gender;
        updateGenderButtonsUI(data.gender);
      }
    } catch (err) {
      console.error('Failed to update gender:', err);
    }
  });
});

// Avatar setting logic
editAvatarBtn.addEventListener('click', () => avatarInput.click());

avatarInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // In a real app, you'd upload this to a server/S3. 
  // For this local demo, we'll use a Base64 string to simulate a URL.
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64String = reader.result;
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
      const res = await fetch(`${API_BASE}/api/user/update_avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, avatar_url: base64String }),
      });
      
      if (res.ok) {
        user.avatar = base64String;
        localStorage.setItem('user', JSON.stringify(user));
        profileImg.src = base64String;
        profileImg.classList.remove('hidden');
        profileAvatarIcon.classList.add('hidden');
      }
    } catch (err) {
      console.error('Failed to update avatar:', err);
    }
  };
  reader.readAsDataURL(file);
});
