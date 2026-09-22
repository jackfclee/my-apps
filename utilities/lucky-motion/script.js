'use strict';
const $ = id => document.getElementById(id);
const canvas = $('machine'), ctx = canvas.getContext('2d');
const palette = ['#f3bd59','#e98970','#a9c3a5','#b7c9dc','#d6bdcf'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mobileLayout = matchMedia('(max-width:700px), (pointer:coarse) and (max-width:1100px)');
let mobileArmed = false, mobileStarting = false, sheetOpen = false;
let settingsOpen = false;
let total = 49, picks = 6, energy = 0, state = 'ready', valid = true;
let particles = [], selected = [], history = [], drawNumber = 0, lastFrame = 0;
let animationToken = 0, lastPointer = null, lastMotion = 0, gravity = null;
const settingsKey = 'lucky-motion.settings.v1';
let mixSeconds = 5, motionPreferred = false, lastMovementCredit = 0;
let trayHeight = 0, chamberY = 225, dropStarted = null;
const dropFlight = 650;
function releaseDelay(index) { return index * Math.min(65, 1400 / Math.max(1, total - 1)); }
function beginRelease() {
  if (dropStarted !== null) return;
  dropStarted = performance.now();
  $('stageCaption').textContent = 'Here they come! Balls drop in number order.';
  canvas.setAttribute('aria-label', 'Numbered balls dropping from the upper tray into the lottery machine');
}
function updateDrop(ball, now) {
  if (ball.phase === 'mixing' || dropStarted === null) return;
  const elapsed = now - dropStarted - releaseDelay(ball.number - 1);
  if (elapsed < 0 && !reducedMotion.matches) return;
  ball.phase = 'falling';
  const t = reducedMotion.matches ? 1 : Math.min(1, Math.max(0, elapsed / dropFlight));
  // Bring each ball to the central opening, then let it accelerate down the chute.
  const slide = Math.min(1, t / .45);
  ball.x = ball.homeX + (225 - ball.homeX) * slide;
  ball.y = ball.homeY + (trayHeight - ball.r - ball.homeY) * slide;
  if (t > .45) ball.y += ((t - .45) / .55) ** 2 * (chamberY - 65 - (trayHeight - ball.r));
  if (t === 1) {
    ball.phase = 'mixing'; ball.vx = (Math.random() - .5) * 8; ball.vy = 5;
    if (reducedMotion.matches) {
      const angle = ball.number * 2.3999632297;
      const distance = Math.sqrt((ball.number - .5) / total) * (210 - ball.r);
      ball.x = 225 + Math.cos(angle) * distance; ball.y = chamberY + Math.sin(angle) * distance;
    }
  }
}

function saveSettings() {
  try {
    localStorage.setItem(settingsKey, JSON.stringify({total, picks, mixSeconds, motionPreferred}));
    $('settingsNote').textContent = 'Settings are remembered on this device.';
  } catch {
    $('settingsNote').textContent = 'Settings work for this visit, but this browser could not save them.';
  }
}
function restoreSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(settingsKey));
    if (saved && typeof saved === 'object') {
      if (Number.isInteger(saved.total) && saved.total >= 1 && saved.total <= 500 &&
          Number.isInteger(saved.picks) && saved.picks >= 1 && saved.picks <= saved.total) {
        total = saved.total; picks = Math.min(saved.picks, 10);
      }
      if (Number.isInteger(saved.mixSeconds) && saved.mixSeconds >= 3 && saved.mixSeconds <= 12) mixSeconds = saved.mixSeconds;
      motionPreferred = saved.motionPreferred === true;
    }
  } catch {
    $('settingsNote').textContent = 'Saved settings could not be read. Using defaults for this visit.';
  }
  $('total').value = total; $('picks').value = picks; $('picks').max = Math.min(total, 10);
  $('mixDuration').value = mixSeconds; updateDuration();
}
function updateDuration() {
  $('durationValue').textContent = `${mixSeconds} seconds`;
  $('mixDuration').setAttribute('aria-valuetext', `${mixSeconds} seconds`);
}
// Credit only closely spaced movement events, never idle time or both sensors twice.
function recordMovement(now, previous) {
  if (previous !== null && now - previous <= 200) {
    const elapsed = Math.max(0, Math.min(now - previous, now - lastMovementCredit));
    addEnergy(elapsed / (mixSeconds * 1000) * 100);
  }
  lastMovementCredit = now;
}

// Rejection sampling avoids modulo bias; partial Fisher–Yates avoids duplicates.
function randomBelow(limit) {
  const buffer = new Uint32Array(1);
  const ceiling = Math.floor(4294967296 / limit) * limit;
  do { crypto.getRandomValues(buffer); } while (buffer[0] >= ceiling);
  return buffer[0] % limit;
}
function sample(n, count) {
  const pool = Array.from({length:n}, (_, i) => i + 1);
  for (let i = 0; i < count; i++) {
    const j = i + randomBelow(n - i);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
function buildParticles() {
  dropStarted = null;
  const radius = Math.max(7, Math.min(17, 105 / Math.sqrt(total)));
  const spacing = radius * 2 + 5, columns = Math.min(total, Math.floor(410 / spacing));
  const rows = Math.ceil(total / columns);
  trayHeight = 44 + rows * spacing + 20;
  chamberY = trayHeight + 225;
  canvas.height = (trayHeight + 450) * 2;
  particles = Array.from({length:total}, (_, i) => {
    const row = Math.floor(i / columns), rowCount = Math.min(columns, total - row * columns);
    const x = 225 + (i % columns - (rowCount - 1) / 2) * spacing;
    const y = 44 + radius + row * spacing;
    return {number:i+1, x, y, homeX:x, homeY:y, vx:0, vy:0, r:radius, phase:'queued'};
  });
  canvas.setAttribute('aria-label', `${total} numbered balls arranged in rows above an empty lottery machine`);
}
function updateMeter() {
  $('energy').value = energy;
  $('percent').textContent = Math.floor(energy) + '%';
  $('mixLabel').textContent = state === 'done' ? 'Draw complete' : energy > 0 ? 'Keep the good luck moving…' : 'Waiting for a little movement';
  $('mobileEnergy').value = energy;
  $('mobileSummary').textContent = `${picks} of ${total} balls · ${mixSeconds}s mixing`;
  $('mobileAuto').disabled = state === 'drawing' || mobileStarting;
  $('openSettings').disabled = state === 'drawing' || mobileStarting;
  $('mobileAuto').textContent = state === 'done' ? 'New draw' : 'Mix automatically';
  if (state === 'drawing') $('mobileHint').textContent = `Mixing… ${Math.floor(energy)}%`;
  else if (state === 'done') $('mobileHint').textContent = 'Double-tap for a new draw';
  else if (mobileArmed) $('mobileHint').textContent = `Shake to mix · ${Math.floor(energy)}%`;
  else $('mobileHint').textContent = 'Double-tap the machine to start';
}
function showPlaceholders() {
  $('results').replaceChildren();
  $('results').style.setProperty('--ball-count', picks);
  for (let i = 0; i < picks; i++) {
    const ball = document.createElement('span'); ball.className = 'result-ball placeholder'; ball.textContent = '·'; ball.setAttribute('aria-hidden','true'); $('results').append(ball);
  }
}
function reset() {
  mobileArmed = false;
  animationToken++; state = 'ready'; energy = 0; selected = []; lastPointer = null;
  setSheetOpen(false);
  lastMotion = 0; gravity = null; lastMovementCredit = performance.now();
  $('total').disabled = $('picks').disabled = $('mixDuration').disabled = false;
  $('draw').disabled = !valid; $('draw').textContent = 'Mix & draw ↗';
  $('stateTag').textContent = 'READY'; $('announcement').textContent = '';
  $('resultMeta').textContent = 'The next draw is yours.';
  $('stageCaption').textContent = `${total} balls lined up. Move or press Mix & draw to drop them in.`;
  showPlaceholders(); buildParticles(); updateMeter();
}
function configure() {
  const n = Number($('total').value), x = Number($('picks').value);
  valid = Number.isInteger(n) && n >= 1 && n <= 500 && Number.isInteger(x) && x >= 1 && x <= Math.min(n, 10);
  $('error').textContent = valid ? '' : 'Use whole numbers: 1–500 total balls, and 1–10 picks, no more than the total.';
  $('total').setAttribute('aria-invalid', String(!Number.isInteger(n) || n < 1 || n > 500));
  $('picks').setAttribute('aria-invalid', String(!Number.isInteger(x) || x < 1 || x > Math.min(n, 10)));
  $('draw').disabled = !valid;
  if (valid) { total = n; picks = x; $('picks').max = Math.min(n, 10); saveSettings(); reset(); }
  else { energy = 0; updateMeter(); }
}
function addEnergy(amount) {
  if (!valid || state !== 'ready' || document.hidden || settingsOpen) return;
  if (mobileLayout.matches && !mobileArmed) return;
  if (amount > 0) beginRelease();
  energy = Math.min(100, energy + amount);
  updateMeter();
  if (energy >= 100) startDraw();
}
function startDraw() {
  if (!valid || state !== 'ready' || settingsOpen) return;
  beginRelease();
  state = 'drawing'; const token = ++animationToken;
  $('draw').disabled = $('total').disabled = $('picks').disabled = $('mixDuration').disabled = true;
  $('stateTag').textContent = 'MIXING'; $('draw').textContent = 'Mixing your numbers…';
  $('results').replaceChildren(); $('announcement').textContent = 'Mixing the balls…';
  const started = performance.now(), startingEnergy = energy;
  const releaseRemaining = reducedMotion.matches ? 0 : dropStarted + releaseDelay(total - 1) + dropFlight - started;
  const duration = Math.max(1, releaseRemaining, mixSeconds * 1000 * (1 - startingEnergy / 100));
  function mix(now) {
    if (token !== animationToken) return;
    const fraction = Math.min(1, (now - started) / duration);
    energy = startingEnergy + (100 - startingEnergy) * fraction; updateMeter();
    if (fraction < 1) requestAnimationFrame(mix);
    else {
      particles.forEach(ball => updateDrop(ball, now));
      reveal(token);
    }
  }
  requestAnimationFrame(mix);
}
function reveal(token) {
  if (token !== animationToken) return;
  selected = sample(total, picks);
  const winners = new Set(selected); particles = particles.filter(ball => !winners.has(ball.number));
  renderResults();
  state = 'done'; drawNumber++;
  $('stateTag').textContent = 'DRAWN'; $('draw').disabled = false; $('draw').textContent = 'Start a new draw ↻';
  $('total').disabled = $('picks').disabled = $('mixDuration').disabled = false;
  $('resultMeta').textContent = `Draw ${String(drawNumber).padStart(2,'0')} · ${picks} of ${total}`;
  $('announcement').textContent = `Draw complete. Selected numbers: ${selected.join(', ')}.`;
  $('stageCaption').textContent = 'A little movement. A brand new possibility.';
  canvas.setAttribute('aria-label', `${total - picks} balls remaining inside the lottery machine after the draw`);
  renderHistory();
  history.unshift({number:drawNumber, numbers:[...selected], total, time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});
  history = history.slice(0, 5); updateMeter();
  $('sheetContent').scrollTop = 0;
  if (mobileLayout.matches) setSheetOpen(true);
}
function renderResults() {
  $('results').replaceChildren();
  $('results').style.setProperty('--ball-count', Math.max(1, selected.length));
  selected.forEach((number, i) => {
    const ball = document.createElement('span'); ball.className = 'result-ball'; ball.textContent = number;
    ball.style.background = palette[(number-1) % palette.length];
    ball.style.animationDelay = Math.min(i * 90, 1800) + 'ms'; $('results').append(ball);
  });
}
function renderHistory() {
  $('history').hidden = history.length === 0; $('historyRows').replaceChildren();
  history.forEach(draw => {
    const row = document.createElement('div'), heading = document.createElement('div'), time = document.createElement('time'), detail = document.createElement('span'), numbers = document.createElement('div');
    row.className = 'history-row'; heading.className = 'history-heading'; time.textContent = draw.time;
    detail.textContent = `Draw ${draw.number} · ${draw.numbers.length} of ${draw.total}`;
    numbers.className = 'balls history-balls'; numbers.style.setProperty('--ball-count', draw.numbers.length);
    draw.numbers.forEach(number => {
      const ball = document.createElement('span'); ball.className = 'result-ball'; ball.textContent = number;
      ball.style.background = palette[(number-1) % palette.length]; numbers.append(ball);
    });
    heading.append(detail, time); row.append(heading, numbers); $('historyRows').append(row);
  });
}
$('total').addEventListener('input', configure); $('picks').addEventListener('input', configure);
$('mixDuration').addEventListener('input', () => {
  mixSeconds = Number($('mixDuration').value); updateDuration(); saveSettings(); reset();
});
$('draw').addEventListener('click', () => state === 'done' ? reset() : startDraw());
document.addEventListener('pointermove', event => {
  if (mobileLayout.matches) return;
  if (event.target.closest('input, button, label')) { lastPointer = null; return; }
  if (event.pointerType === 'touch' && !event.buttons) return;
  const now = performance.now();
  if (lastPointer && lastPointer.id === event.pointerId) {
    const distance = Math.hypot(event.clientX-lastPointer.x, event.clientY-lastPointer.y);
    if (distance >= 1) recordMovement(now, lastPointer.time);
  }
  lastPointer = {x:event.clientX, y:event.clientY, id:event.pointerId, time:now};
});
document.documentElement.addEventListener('pointerleave', () => { lastPointer = null; });
document.addEventListener('visibilitychange', () => { lastPointer = null; gravity = null; lastMotion = 0; lastMovementCredit = performance.now(); });
let motionEnabled = false, motionReceived = false;
let motionTimer;
function onMotion(event) {
  if (document.hidden) { lastMotion = 0; gravity = null; return; }
  const now = performance.now();
  const a = event.acceleration, g = event.accelerationIncludingGravity;
  let strength = 0;
  if (a && [a.x,a.y,a.z].every(Number.isFinite)) strength = Math.hypot(a.x,a.y,a.z);
  else if (g && [g.x,g.y,g.z].every(Number.isFinite)) {
    if (gravity) strength = Math.hypot(g.x-gravity.x,g.y-gravity.y,g.z-gravity.z);
    gravity = {x:g.x,y:g.y,z:g.z};
  } else return;
  if (!motionReceived) { motionReceived = true; $('motionNote').textContent = 'Motion connected. Gently shake your phone to fill the meter.'; }
  if (strength > 3) { recordMovement(now, lastMotion || null); lastMotion = now; }
  else lastMotion = 0;
}
async function enableMotion(fromClick = false) {
  if (motionEnabled) return;
  if (!window.isSecureContext || !window.DeviceMotionEvent) {
    $('motionNote').textContent = 'Phone motion needs a supported browser and HTTPS (or localhost). You can still drag or use Mix & draw.'; return;
  }
  if (!fromClick && typeof DeviceMotionEvent.requestPermission === 'function') {
    $('motion').textContent = 'Resume phone shake';
    $('motionNote').textContent = 'Phone shake is remembered. Tap Resume phone shake to allow sensor access for this visit.';
    return;
  }
  $('motion').disabled = true;
  try {
    if (typeof DeviceMotionEvent.requestPermission === 'function' && await DeviceMotionEvent.requestPermission() !== 'granted') {
      $('motionNote').textContent = 'Motion access was not granted. Use touch dragging or Mix & draw instead.'; return;
    }
    window.addEventListener('devicemotion', onMotion); motionEnabled = true;
    motionPreferred = true; saveSettings();
    $('motion').textContent = 'Disable phone shake'; $('motion').setAttribute('aria-pressed', 'true');
    $('instruction').textContent = 'Shake your phone to mix';
    $('motionNote').textContent = 'Waiting for your phone’s motion sensor…';
    motionTimer = setTimeout(() => {
      if (motionEnabled && !motionReceived) $('motionNote').textContent = 'No motion data detected. Check browser motion settings, or use touch dragging or Mix & draw.';
      if (mobileLayout.matches && mobileArmed && !motionReceived && state === 'ready') $('mobileHint').textContent = 'No motion detected. Tap Mix automatically.';
    }, 4000);
  } catch {
    $('motionNote').textContent = 'Motion access is unavailable. Try your browser’s motion settings, or use Mix & draw.';
  } finally {
    $('motion').disabled = false;
  }
}
$('motion').addEventListener('click', () => {
  if (!motionEnabled) { enableMotion(true); return; }
  window.removeEventListener('devicemotion', onMotion); clearTimeout(motionTimer);
  motionEnabled = false; motionPreferred = false; motionReceived = false; lastMotion = 0; gravity = null;
  saveSettings(); $('motion').textContent = 'Enable phone shake'; $('motion').setAttribute('aria-pressed', 'false');
  $('instruction').textContent = 'Move your mouse to mix';
  $('motionNote').textContent = 'Phone shake is off. Touch dragging and Mix & draw still work.';
});

function setSheetOpen(open) {
  sheetOpen = open && selected.length > 0;
  $('resultSheet').classList.toggle('sheet-open', sheetOpen);
  $('sheetToggle').setAttribute('aria-expanded', String(sheetOpen));
  $('sheetLabel').textContent = sheetOpen ? 'Swipe this handle down to hide' : selected.length ? 'Tap to show your numbers' : 'Results will appear here';
  $('sheetContent').inert = mobileLayout.matches && !sheetOpen;
  if (!sheetOpen && mobileLayout.matches && $('sheetContent').contains(document.activeElement)) $('sheetToggle').focus();
}
function openSettings() {
  if (!mobileLayout.matches || settingsOpen || mobileStarting || state === 'drawing') return;
  settingsOpen = true;
  tapStart = null; lastTap = null; sheetDrag = null;
  lastMotion = 0; lastPointer = null;
  setSheetOpen(false);
  $('settingsBody').append($('setupCard'));
  $('settingsDialog').showModal();
}
function closeSettings() {
  if (!settingsOpen) return;
  // Incomplete edits never replace the last valid, saved configuration.
  $('total').value = total; $('picks').value = picks; $('picks').max = Math.min(total, 10);
  valid = true; $('error').textContent = '';
  $('total').setAttribute('aria-invalid', 'false'); $('picks').setAttribute('aria-invalid', 'false');
  $('draw').disabled = false;
  settingsOpen = false;
  $('settingsDialog').close();
  $('mainLayout').append($('setupCard'));
  lastMotion = 0; gravity = null; lastMovementCredit = performance.now();
  updateMeter();
  if (mobileLayout.matches) $('openSettings').focus();
}
$('openSettings').addEventListener('click', openSettings);
$('closeSettings').addEventListener('click', () => {
  if (!valid) {
    $('error').textContent = 'Enter 1–500 total balls and 1–10 picks (no more than the total) before closing.';
    $('picks').focus(); return;
  }
  closeSettings();
});
$('settingsDialog').addEventListener('cancel', event => { event.preventDefault(); closeSettings(); });
$('settingsDialog').addEventListener('close', closeSettings);
async function startMobile() {
  if (!mobileLayout.matches || mobileStarting || state === 'drawing' || sheetOpen || settingsOpen) return;
  mobileStarting = true;
  // Request directly in the tap handler, before awaiting anything else (required on iOS).
  const permission = enableMotion(true);
  if (state === 'done') reset();
  $('mobileHint').textContent = 'Enabling phone shake…';
  $('mobileAuto').disabled = true;
  await permission;
  mobileStarting = false;
  if (!mobileLayout.matches) { updateMeter(); return; }
  mobileArmed = true;
  beginRelease(); updateMeter();
  if (!motionEnabled) {
    startDraw();
    $('mobileHint').textContent = 'Motion unavailable — mixing automatically';
  } else {
    $('mobileHint').textContent = 'Shake to mix, or tap Mix automatically';
  }
}
$('mobileAuto').addEventListener('click', () => {
  if (mobileStarting || state === 'drawing' || settingsOpen) return;
  if (state === 'done') reset();
  mobileArmed = true; startDraw();
});
$('sheetToggle').addEventListener('click', () => setSheetOpen(!sheetOpen));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mobileLayout.matches) setSheetOpen(false);
});
let tapStart = null, lastTap = null, sheetDrag = null;
document.addEventListener('pointerdown', event => {
  if (!mobileLayout.matches || settingsOpen) return;
  if (!event.isPrimary) { tapStart = null; lastTap = null; return; }
  if (event.target.closest('#resultSheet')) {
    if (event.target.closest('#sheetToggle')) sheetDrag = {id:event.pointerId, x:event.clientX, y:event.clientY};
    return;
  }
  if (event.target.closest('button, input') || sheetOpen) return;
  tapStart = {id:event.pointerId, x:event.clientX, y:event.clientY, time:performance.now()};
});
document.addEventListener('pointerup', event => {
  lastPointer = null;
  if (!mobileLayout.matches || settingsOpen) return;
  if (sheetDrag && sheetDrag.id === event.pointerId) {
    const dy = event.clientY-sheetDrag.y, dx = event.clientX-sheetDrag.x;
    if (Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx)) {
      setSheetOpen(dy < 0);
      suppressSheetClick = true;
      setTimeout(() => { suppressSheetClick = false; }, 400);
    }
    sheetDrag = null; return;
  }
  if (!tapStart || tapStart.id !== event.pointerId) return;
  const now = performance.now(), distance = Math.hypot(event.clientX-tapStart.x,event.clientY-tapStart.y);
  if (distance <= 20 && now-tapStart.time < 300) {
    if (lastTap && now-lastTap.time < 350 && Math.hypot(event.clientX-lastTap.x,event.clientY-lastTap.y) < 40) {
      lastTap = null; startMobile();
    } else lastTap = {x:event.clientX,y:event.clientY,time:now};
  } else lastTap = null;
  tapStart = null;
});
document.addEventListener('pointercancel', () => { tapStart = null; lastTap = null; sheetDrag = null; });
let suppressSheetClick = false;
$('sheetToggle').addEventListener('click', event => {
  if (suppressSheetClick) { event.stopImmediatePropagation(); event.preventDefault(); }
}, true);
// Prevent native pinch/double-tap gestures only in the mobile presentation.
for (const type of ['touchmove', 'gesturestart', 'gesturechange']) {
  document.addEventListener(type, event => {
    if (!mobileLayout.matches) return;
    if (type === 'touchmove' && settingsOpen && event.touches.length === 1 && event.target.closest('#settingsDialog')) return;
    if (type === 'touchmove' && sheetOpen && event.touches.length === 1 && event.target.closest('#sheetContent')) return;
    event.preventDefault();
  }, {passive:false});
}
function applyMobileLayout() {
  if (!mobileLayout.matches && settingsOpen) closeSettings();
  $('viewport').setAttribute('content', mobileLayout.matches
    ? 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
    : 'width=device-width, initial-scale=1');
  setSheetOpen(sheetOpen);
  if (selected.length) renderResults();
  updateMeter();
}
mobileLayout.addEventListener('change', applyMobileLayout);
function frame(now) {
  const dt = Math.min((now-lastFrame)/16.667,2) || 1; lastFrame = now;
  ctx.setTransform(2,0,0,2,0,0); ctx.clearRect(0,0,450,canvas.height / 2);
  ctx.fillStyle = '#fffef8'; ctx.strokeStyle = '#d8ddd2'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(10,5,430,trayHeight-15,16); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#65746a'; ctx.font = '600 10px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const trayLabel = dropStarted === null ? 'READY TO ROLL · 1–' + total : particles.some(ball => ball.phase !== 'mixing') ? 'RELEASING THE BALLS' : 'ALL BALLS RELEASED';
  ctx.fillText(trayLabel,225,25);
  const glass = ctx.createRadialGradient(160,trayHeight+115,10,225,chamberY,220);
  glass.addColorStop(0,'#fffef9'); glass.addColorStop(1,'#d9e1d3');
  ctx.beginPath(); ctx.arc(225,chamberY,219,0,Math.PI*2);
  ctx.fillStyle = glass; ctx.fill(); ctx.strokeStyle = '#d0d8ca'; ctx.lineWidth = 10; ctx.stroke();
  ctx.fillStyle = '#e8edde'; ctx.fillRect(204,trayHeight-12,42,28);
  ctx.strokeStyle = '#d0d8ca'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(204,trayHeight-12); ctx.lineTo(204,trayHeight+16); ctx.moveTo(246,trayHeight-12); ctx.lineTo(246,trayHeight+16); ctx.stroke();
  const active = (state === 'drawing' || state === 'ready' && energy > 0) && !reducedMotion.matches;
  particles.forEach(ball => {
    updateDrop(ball, now);
    if (ball.phase === 'mixing' && !reducedMotion.matches) {
      ball.vx += (Math.random()-.5) * (active ? 1.6 : .09) * dt;
      ball.vy += (active ? (Math.random()-.5)*1.6 : .06) * dt;
      ball.vx *= .995; ball.vy *= .995;
      const speed = Math.hypot(ball.vx,ball.vy), max = active ? 8 : 1.3;
      if (speed > max) { ball.vx *= max/speed; ball.vy *= max/speed; }
      ball.x += ball.vx*dt; ball.y += ball.vy*dt;
      const dx = ball.x-225, dy = ball.y-chamberY, distance = Math.hypot(dx,dy), boundary = 214-ball.r;
      if (distance > boundary) {
        const nx = dx/distance, ny = dy/distance, dot = ball.vx*nx+ball.vy*ny;
        ball.x = 225+nx*boundary; ball.y = chamberY+ny*boundary;
        if (dot > 0) { ball.vx -= 1.9*dot*nx; ball.vy -= 1.9*dot*ny; }
      }
    }
    ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
    ctx.fillStyle = palette[(ball.number-1)%palette.length]; ctx.fill();
    ctx.strokeStyle = '#243a311c'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r*.67,0,Math.PI*2); ctx.fillStyle = '#ffffffc9'; ctx.fill();
    ctx.fillStyle = '#243a31'; ctx.font = `700 ${Math.max(8,ball.r*.68)}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ball.number,ball.x,ball.y+.5);
  });
  ctx.beginPath(); ctx.arc(225,chamberY,199,Math.PI*1.08,Math.PI*1.64); ctx.strokeStyle = '#ffffffa0'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
  requestAnimationFrame(frame);
}
restoreSettings(); reset();
applyMobileLayout();
if (motionPreferred) enableMotion();
requestAnimationFrame(frame);
