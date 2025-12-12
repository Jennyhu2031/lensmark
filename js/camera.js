// camera.js - Camera page mode switching logic

const modes = ['Photo', 'Video', 'Portrait'];
const modeButtons = Array.from(document.querySelectorAll('.camera-mode-btn'));
const img = document.getElementById('camera-image');
const photoOverlay = document.getElementById('camera-photo-overlay');
const portraitOverlay = document.getElementById('camera-portrait-overlay');
const portraitBottomNav = document.getElementById('portrait-bottomnav');
const cameraControlsBar = document.getElementById('camera-controls-bar');

function setMode(mode) {
  modeButtons.forEach(btn => {
    const isActive = btn.dataset.mode === mode;
    btn.classList.toggle('bg-primary', isActive && mode === 'Photo');
    btn.classList.toggle('text-black', isActive && mode === 'Photo');
    btn.classList.toggle('text-white', isActive && mode !== 'Photo');
    btn.classList.toggle('text-white/80', !isActive && mode !== 'Photo');
    btn.classList.toggle('bg-primary', isActive && mode === 'Portrait');
  });

  if (mode === 'Photo') {
    photoOverlay.style.display = '';
    portraitOverlay.style.display = 'none';
    portraitBottomNav.style.display = 'none';
    cameraControlsBar.style.display = '';
    img.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVzvffsviYmkkq2jWAKZ7OS4lYiSf1tWJRRmeqb0sXSdHvSAS_ybTUKJ9Q31GFtnIOQt-wTsETJigmLg30S4PTF-UJIHZZBgwM_fxTbqb3lUv_jMyLW6nxuNDm61XnTLxHusVA2w9dropQ-9gdaZGZZAW5VR6uWmhvCLk0e4-rOQpwZhHe7tfErv3SpQLV1MscUiJ85yzu6mTagksoQnCsrIUcGWKsFLgUrx_Jq1yWWWOT8RQPsTvH_vcwVFDGyW0jc0vA_nogxuVr';
  } else if (mode === 'Video') {
    photoOverlay.style.display = '';
    portraitOverlay.style.display = 'none';
    portraitBottomNav.style.display = 'none';
    cameraControlsBar.style.display = '';
    img.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVzvffsviYmkkq2jWAKZ7OS4lYiSf1tWJRRmeqb0sXSdHvSAS_ybTUKJ9Q31GFtnIOQt-wTsETJigmLg30S4PTF-UJIHZZBgwM_fxTbqb3lUv_jMyLW6nxuNDm61XnTLxHusVA2w9dropQ-9gdaZGZZAW5VR6uWmhvCLk0e4-rOQpwZhHe7tfErv3SpQLV1MscUiJ85yzu6mTagksoQnCsrIUcGWKsFLgUrx_Jq1yWWWOT8RQPsTvH_vcwVFDGyW0jc0vA_nogxuVr';
  } else if (mode === 'Portrait') {
    photoOverlay.style.display = 'none';
    portraitOverlay.style.display = '';
    portraitBottomNav.style.display = '';
    cameraControlsBar.style.display = 'none';
    img.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVzvffsviYmkkq2jWAKZ7OS4lYiSf1tWJRRmeqb0sXSdHvSAS_ybTUKJ9Q31GFtnIOQt-wTsETJigmLg30S4PTF-UJIHZZBgwM_fxTbqb3lUv_jMyLW6nxuNDm61XnTLxHusVA2w9dropQ-9gdaZGZZAW5VR6uWmhvCLk0e4-rOQpwZhHe7tfErv3SpQLV1MscUiJ85yzu6mTagksoQnCsrIUcGWKsFLgUrx_Jq1yWWWOT8RQPsTvH_vcwVFDGyW0jc0vA_nogxuVr';
  }
}

modeButtons.forEach(btn => {
  btn.addEventListener('click', e => {
    setMode(btn.dataset.mode);
  });
});

setMode('Photo');

