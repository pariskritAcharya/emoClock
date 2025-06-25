let eyeOpen = false;
let isAnimating = false;
let closeTimeout;
let blinkInterval;
let positionTimeout;





// Random helper
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random blinking when eye is open
function startBlinking() {
  stopBlinking();
  blinkInterval = setInterval(() => {
    anime({
      targets: '.eye',
      height: [
        { value: '50px', duration: 150, easing: 'easeInOutQuad' },
        { value: '150px', duration: 150, easing: 'easeInOutQuad' }
      ],
      top: [
        { value: '30px', duration: 150, easing: 'easeInOutQuad' },
        { value: '0px', duration: 150, easing: 'easeInOutQuad' }
      ]
    });
  }, getRandomInt(2000, 5000));
}

function stopBlinking() {
  clearInterval(blinkInterval);
}

// Blink once even while sleeping
function blinkWhileSleeping() {
  anime({
    targets: '.eye',
    height: [
      { value: '150px', duration: 150, easing: 'easeInOutQuad' },
      { value: '50px', duration: 150, easing: 'easeInOutQuad' }
    ],
    top: [
      { value: '0px', duration: 150, easing: 'easeInOutQuad' },
      { value: '30px', duration: 150, easing: 'easeInOutQuad' }
    ]
  });
}

// Eye closing logic
function close_eye() {
  if (isAnimating) return;

  if (!eyeOpen) {
    blinkWhileSleeping();
    return;
  }

  stopBlinking();
  isAnimating = true;
  anime({
    targets: '.eye',
    height: '50px',
    top: '30px',
    duration: 250,
    easing: 'easeInOutQuad',
    complete: () => {
      eyeOpen = false;
      isAnimating = false;
    }
  });
}

// Eye opening logic
function open_eye() {
  if (eyeOpen || isAnimating) return;

  isAnimating = true;
  anime({
    targets: '.eye',
    height: '150px',
    top: '0px',
    duration: 250,
    easing: 'easeInOutQuad',
    complete: () => {
      eyeOpen = true;
      isAnimating = false;
      startBlinking();
    }
  });
}

// Handle mouse movement and inactivity
function eye_control() {
  document.addEventListener('mousemove', () => {
    open_eye(); // Open if not already
    clearTimeout(closeTimeout);
    clearTimeout(positionTimeout);

    // Close after 4s of inactivity
    closeTimeout = setTimeout(() => {
      close_eye();
    }, 4000);

    // Reset eye container to center after 1s
    positionTimeout = setTimeout(() => {
      document.querySelectorAll('.eye_container').forEach(container => {
        container.style.transform = `translateX(0px)`;
      });
    }, 1000);
  });
}

// Eye glides left and right based on horizontal mouse position
function horizontalEyeMovement() {
  document.addEventListener('mousemove', (event) => {
    document.querySelectorAll('.eye_container').forEach(container => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      let dx = event.clientX - centerX;

      const maxOffset = 30;
      const normalized = Math.max(-1, Math.min(1, dx / (window.innerWidth / 2)));
      const offsetX = normalized * maxOffset;

      container.style.transform = `translateX(${offsetX}px)`;
    });
  });
}

// Reapply wake lock on fullscreen
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    requestWakeLock();
  }
});

// Run everything on page load
window.onload = function () {
  open_eye();
  eye_control();
  horizontalEyeMovement();
};
