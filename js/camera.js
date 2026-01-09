// camera.js - Camera page mode switching logic

const modes = ['Photo', 'Video', 'Portrait'];
const modeButtons = Array.from(document.querySelectorAll('.camera-mode-btn'));
const img = document.getElementById('camera-image');
const photoOverlay = document.getElementById('camera-photo-overlay');
const portraitOverlay = document.getElementById('camera-portrait-overlay');
const portraitBottomNav = document.getElementById('portrait-bottomnav');
const cameraControlsBar = document.getElementById('camera-controls-bar');
const maskCanvas = document.getElementById('mask-canvas');

async function loadAndDrawMask() {
  try {
    // 这里的路径取决于部署环境，如果是在 pages/camera.html 引用，通常是 ../mask.json
    const response = await fetch('../mask.json');
    if (!response.ok) throw new Error('Failed to load mask.json');
    const data = await response.json();
    
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');

    const width = data.width;
    const height = data.height;
    const mask = data.mask;

    // 设置画布内部分辨率与 mask 一致
    maskCanvas.width = width;
    maskCanvas.height = height;

    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        if (mask[y] && mask[y][x] === 1) {
          pixels[index] = 0;     // R
          pixels[index + 1] = 0; // G
          pixels[index + 2] = 255; // B (蓝色)
          pixels[index + 3] = 128; // A (半透明)
        } else {
          pixels[index + 3] = 0; // A (透明)
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  } catch (error) {
    console.error('Error loading or drawing mask:', error);
  }
}

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

// 初始化加载 mask 并设置默认模式
loadAndDrawMask();
setMode('Photo');

