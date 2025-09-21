let eyeOpen = false;
let isAnimating = false;
let closeTimeout;
let blinkInterval;
let positionTimeout;
let sleepBlinkTimeout;
let wakeLock = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log("Wake Lock is active");

    wakeLock.addEventListener('release', () => {
      console.log('Wake Lock was released');
    });
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startBlinking() {
  stopBlinking();
  blinkInterval = setInterval(() => {
    blinkOnce();
  }, getRandomInt(2000, 5000));
}

function stopBlinking() {
  clearInterval(blinkInterval);
}

function blinkOnce() {
  anime({
    targets: '.eye',
    height: [
      { value: '50px', duration: 200, easing: 'easeInOutQuad' },
      { value: '150px', duration: 200, easing: 'easeInOutQuad' }
    ],
    top: [
      { value: '30px', duration: 200, easing: 'easeInOutQuad' },
      { value: '0px', duration: 200, easing: 'easeInOutQuad' }
    ]
  });
}

function close_eye() {
  if (isAnimating || !eyeOpen) return;

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
      startSleepBlinkLoop();
    }
  });
}

function open_eye() {
  if (eyeOpen || isAnimating) return;

  isAnimating = true;
  anime({
    targets: '.eye',
    height: '150px',
    top: '0px',
    duration: 300,
    easing: 'easeInOutQuad',
    complete: () => {
      eyeOpen = true;
      isAnimating = false;
      startBlinking();
    }
  });
}

function startSleepBlinkLoop() {
  clearTimeout(sleepBlinkTimeout);

  sleepBlinkTimeout = setTimeout(async () => {
    if (eyeOpen) return;

    open_eye();

    await sleep(getRandomInt(4000, 7000));

    const blinks = getRandomInt(1, 2);
    for (let i = 0; i < blinks; i++) {
      blinkOnce();
      await sleep(getRandomInt(2500, 4500));
    }

    close_eye();
  }, getRandomInt(20000, 40000));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function eye_control() {
  document.addEventListener('mousemove', () => {
    open_eye();
    clearTimeout(closeTimeout);
    clearTimeout(positionTimeout);
    clearTimeout(sleepBlinkTimeout);
    stopBlinking();
    startBlinking();

    closeTimeout = setTimeout(() => {
      close_eye();
    }, getRandomInt(15000, 25000));

    positionTimeout = setTimeout(() => {
      document.querySelectorAll('.eye_container').forEach(container => {
        container.style.transform = `translateX(0px)`;
      });
    }, 1000);
  });
}

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

function updateKathmanduTime() {
  const timeElement = document.getElementById("time");

  if (!timeElement) {
    console.error("Time element with id='time' not found.");
    return;
  }
  
  const now = new Date();
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true, // This is the key change for 12-hour format
    timeZone: 'Asia/Kathmandu'
  };
  
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const kathmanduTime = formatter.format(now);
  
  timeElement.textContent = kathmanduTime;
}

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    requestWakeLock();
  }
});

window.onload = function () {
  open_eye();
  requestWakeLock();
  eye_control();
  horizontalEyeMovement();
  
  updateKathmanduTime();
  setInterval(updateKathmanduTime, 1000);
};