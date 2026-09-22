'use strict';
const $ = id => document.getElementById(id);
const canvas = $('machine'), ctx = canvas.getContext('2d');
const palette = ['#f3bd59','#e98970','#a9c3a5','#b7c9dc','#d6bdcf'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let total = 49, picks = 6, energy = 0, state = 'ready', valid = true;
let particles = [], selected = [], history = [], drawNumber = 0, lastFrame = 0;
let animationToken = 0, lastPointer = null, lastMotion = 0, gravity = null;

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
  const radius = Math.max(9, Math.min(29, 230 / Math.sqrt(total)));
  particles = Array.from({length:total}, (_, i) => {
    const angle = Math.random() * Math.PI * 2, distance = Math.sqrt(Math.random()) * (210 - radius);
    return {number:i+1, x:225+Math.cos(angle)*distance, y:225+Math.sin(angle)*distance, vx:(Math.random()-.5)*3, vy:(Math.random()-.5)*3, r:radius};
  });
}
function updateMeter() {
  $('energy').value = energy;
  $('percent').textContent = Math.floor(energy) + '%';
  $('mixLabel').textContent = state === 'done' ? 'Draw complete' : energy > 0 ? 'Keep the good luck moving…' : 'Waiting for a little movement';
}
function showPlaceholders() {
  $('results').replaceChildren();
  for (let i = 0; i < Math.min(picks, 12); i++) {
    const ball = document.createElement('span'); ball.className = 'result-ball placeholder'; ball.textContent = '·'; ball.setAttribute('aria-hidden','true'); $('results').append(ball);
  }
}
function reset() {
  animationToken++; state = 'ready'; energy = 0; selected = []; lastPointer = null;
  $('total').disabled = $('picks').disabled = false;
  $('draw').disabled = !valid; $('draw').textContent = 'Mix & draw ↗';
  $('stateTag').textContent = 'READY'; $('announcement').textContent = '';
  $('resultMeta').textContent = 'The next draw is yours.';
  $('stageCaption').textContent = `${total} possibilities. ${picks} lucky ${picks === 1 ? 'pick' : 'picks'}.`;
  showPlaceholders(); buildParticles(); updateMeter();
}
function configure() {
  const n = Number($('total').value), x = Number($('picks').value);
  valid = Number.isInteger(n) && n >= 1 && n <= 500 && Number.isInteger(x) && x >= 1 && x <= n;
  $('error').textContent = valid ? '' : 'Use whole numbers: 1–500 total balls, and 1 to N picks.';
  $('total').setAttribute('aria-invalid', String(!Number.isInteger(n) || n < 1 || n > 500));
  $('picks').setAttribute('aria-invalid', String(!Number.isInteger(x) || x < 1 || x > n));
  $('draw').disabled = !valid;
  if (valid) { total = n; picks = x; $('picks').max = n; reset(); }
  else { energy = 0; updateMeter(); }
}
function addEnergy(amount) {
  if (!valid || state !== 'ready' || document.hidden) return;
  energy = Math.min(100, energy + amount);
  updateMeter();
  if (energy >= 100) startDraw();
}
function startDraw() {
  if (!valid || state !== 'ready') return;
  state = 'drawing'; const token = ++animationToken;
  $('draw').disabled = $('total').disabled = $('picks').disabled = true;
  $('stateTag').textContent = 'MIXING'; $('draw').textContent = 'Mixing your numbers…';
  $('results').replaceChildren(); $('announcement').textContent = 'Mixing the balls…';
  const started = performance.now(), startingEnergy = energy;
  const duration = reducedMotion.matches ? 150 : 1400;
  function mix(now) {
    if (token !== animationToken) return;
    const fraction = Math.min(1, (now - started) / duration);
    energy = startingEnergy + (100 - startingEnergy) * fraction; updateMeter();
    if (fraction < 1) requestAnimationFrame(mix);
    else reveal(token);
  }
  requestAnimationFrame(mix);
}
function reveal(token) {
  if (token !== animationToken) return;
  selected = sample(total, picks);
  const winners = new Set(selected); particles = particles.filter(ball => !winners.has(ball.number));
  selected.forEach((number, i) => {
    const ball = document.createElement('span'); ball.className = 'result-ball'; ball.textContent = number;
    ball.style.background = palette[(number-1) % palette.length];
    ball.style.animationDelay = Math.min(i * 90, 1800) + 'ms'; $('results').append(ball);
  });
  state = 'done'; drawNumber++;
  $('stateTag').textContent = 'DRAWN'; $('draw').disabled = false; $('draw').textContent = 'Start a new draw ↻';
  $('total').disabled = $('picks').disabled = false;
  $('resultMeta').textContent = `Draw ${String(drawNumber).padStart(2,'0')} · ${picks} of ${total}`;
  $('announcement').textContent = `Draw complete. Selected numbers: ${selected.join(', ')}.`;
  $('stageCaption').textContent = 'A little movement. A brand new possibility.';
  renderHistory();
  history.unshift({numbers:[...selected], total, time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});
  history = history.slice(0, 5); updateMeter();
}
function renderHistory() {
  $('history').hidden = history.length === 0; $('historyRows').replaceChildren();
  history.forEach(draw => {
    const row = document.createElement('div'), time = document.createElement('time'), numbers = document.createElement('span');
    row.className = 'history-row'; time.textContent = draw.time;
    numbers.textContent = `${draw.numbers.join(' · ')} (${draw.numbers.length} of ${draw.total})`;
    row.append(time, numbers); $('historyRows').append(row);
  });
}
$('total').addEventListener('input', configure); $('picks').addEventListener('input', configure);
$('draw').addEventListener('click', () => state === 'done' ? reset() : startDraw());
document.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch' && !event.buttons) return;
  if (lastPointer && lastPointer.id === event.pointerId) {
    const distance = Math.hypot(event.clientX-lastPointer.x, event.clientY-lastPointer.y);
    addEnergy(Math.min(distance, 80) / 18);
  }
  lastPointer = {x:event.clientX, y:event.clientY, id:event.pointerId};
});
document.addEventListener('pointerup', () => { lastPointer = null; });
document.documentElement.addEventListener('pointerleave', () => { lastPointer = null; });
document.addEventListener('visibilitychange', () => { lastPointer = null; gravity = null; lastMotion = 0; });
let motionEnabled = false, motionReceived = false;
function onMotion(event) {
  const now = performance.now();
  const a = event.acceleration, g = event.accelerationIncludingGravity;
  let strength = 0;
  if (a && [a.x,a.y,a.z].every(Number.isFinite)) strength = Math.hypot(a.x,a.y,a.z);
  else if (g && [g.x,g.y,g.z].every(Number.isFinite)) {
    if (gravity) strength = Math.hypot(g.x-gravity.x,g.y-gravity.y,g.z-gravity.z);
    gravity = {x:g.x,y:g.y,z:g.z};
  } else return;
  if (!motionReceived) { motionReceived = true; $('motionNote').textContent = 'Motion connected. Gently shake your phone to fill the meter.'; }
  const elapsed = lastMotion ? Math.min((now-lastMotion)/1000,.1) : 0; lastMotion = now;
  if (strength > 3) addEnergy(Math.min(strength-3,25) * elapsed * 2.5);
}
$('motion').addEventListener('click', async () => {
  if (motionEnabled) return;
  if (!window.isSecureContext || !window.DeviceMotionEvent) {
    $('motionNote').textContent = 'Phone motion needs a supported browser and HTTPS (or localhost). You can still drag or use Mix & draw.'; return;
  }
  try {
    if (typeof DeviceMotionEvent.requestPermission === 'function' && await DeviceMotionEvent.requestPermission() !== 'granted') {
      $('motionNote').textContent = 'Motion access was not granted. Use touch dragging or Mix & draw instead.'; return;
    }
    window.addEventListener('devicemotion', onMotion); motionEnabled = true;
    $('motion').textContent = 'Phone shake enabled ✓'; $('motion').disabled = true;
    $('instruction').textContent = 'Shake your phone to mix';
    $('motionNote').textContent = 'Waiting for your phone’s motion sensor…';
    setTimeout(() => {
      if (!motionReceived) $('motionNote').textContent = 'No motion data detected. Check browser motion settings, or use touch dragging or Mix & draw.';
    }, 4000);
  } catch {
    $('motionNote').textContent = 'Motion access is unavailable. Try your browser’s motion settings, or use Mix & draw.';
  }
});
function frame(now) {
  const dt = Math.min((now-lastFrame)/16.667,2) || 1; lastFrame = now;
  ctx.setTransform(2,0,0,2,0,0); ctx.clearRect(0,0,450,450);
  const active = (state === 'drawing' || state === 'ready' && energy > 0) && !reducedMotion.matches;
  particles.forEach(ball => {
    if (!reducedMotion.matches) {
      ball.vx += (Math.random()-.5) * (active ? 1.6 : .09) * dt;
      ball.vy += (active ? (Math.random()-.5)*1.6 : .06) * dt;
      ball.vx *= .995; ball.vy *= .995;
      const speed = Math.hypot(ball.vx,ball.vy), max = active ? 8 : 1.3;
      if (speed > max) { ball.vx *= max/speed; ball.vy *= max/speed; }
      ball.x += ball.vx*dt; ball.y += ball.vy*dt;
      const dx = ball.x-225, dy = ball.y-225, distance = Math.hypot(dx,dy), boundary = 214-ball.r;
      if (distance > boundary) {
        const nx = dx/distance, ny = dy/distance, dot = ball.vx*nx+ball.vy*ny;
        ball.x = 225+nx*boundary; ball.y = 225+ny*boundary;
        if (dot > 0) { ball.vx -= 1.9*dot*nx; ball.vy -= 1.9*dot*ny; }
      }
    }
    ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
    ctx.fillStyle = palette[(ball.number-1)%palette.length]; ctx.fill();
    ctx.strokeStyle = '#243a311c'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r*.67,0,Math.PI*2); ctx.fillStyle = '#ffffffc9'; ctx.fill();
    ctx.fillStyle = '#243a31'; ctx.font = `700 ${Math.max(8,ball.r*.68)}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ball.number,ball.x,ball.y+.5);
  });
  ctx.beginPath(); ctx.arc(225,225,199,Math.PI*1.08,Math.PI*1.64); ctx.strokeStyle = '#ffffffa0'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
  requestAnimationFrame(frame);
}
reset(); requestAnimationFrame(frame);
