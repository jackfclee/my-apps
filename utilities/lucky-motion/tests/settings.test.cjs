const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../script.js'), 'utf8');

function app({ saved = null, blocked = false, permission, reduced = false, mobile = false } = {}) {
  const elements = new Map(), listeners = new Map(), frames = [];
  let stored = saved, now = 1000, permissionCalls = 0;
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      value: '', style: { setProperty(key,value) { this[key] = value; } }, classList: { toggle() {} }, contains() { return false; }, focus() {}, children: [], attributes: {}, listeners: {},
      showModal() { this.open = true; }, close() { this.open = false; },
      addEventListener(type, fn) { this.listeners[type] = fn; },
      setAttribute(key, value) { this.attributes[key] = value; },
      append(...children) { this.children.push(...children); },
      replaceChildren() { this.children = []; }, getContext() { return {}; }
    });
    return elements.get(id);
  }
  const DeviceMotionEvent = permission === undefined ? {} : {
    async requestPermission() { permissionCalls++; return permission; }
  };
  const context = vm.createContext({
    document: { hidden: false, getElementById: element, createElement: () => element(Symbol()),
      addEventListener(type, fn) { listeners.set(type, fn); }, documentElement: { addEventListener() {} } },
    window: { isSecureContext: true, DeviceMotionEvent,
      addEventListener(type, fn) { listeners.set(type, fn); }, removeEventListener(type) { listeners.delete(type); } },
    DeviceMotionEvent, localStorage: {
      getItem() { if (blocked) throw Error('blocked'); return stored; },
      setItem(key, value) { if (blocked) throw Error('blocked'); stored = value; }
    },
    performance: { now: () => now }, matchMedia: query => ({ matches: query.includes('prefers-reduced') ? reduced : mobile, addEventListener() {} }),
    crypto: require('node:crypto').webcrypto,
    requestAnimationFrame(fn) { frames.push(fn); }, setTimeout() { return 1; }, clearTimeout() {}
  });
  vm.runInContext(source, context);
  return { element, listeners, frames, run: code => vm.runInContext(code, context),
    saved: () => JSON.parse(stored), clock(value) { now = value; }, permissionCalls: () => permissionCalls };
}

test('restores saved counts, duration and motion; can persist disabling motion', () => {
  const a = app({ saved: JSON.stringify({ total: 80, picks: 12, mixSeconds: 10, motionPreferred: true }) });
  assert.equal(a.element('total').value, 80);
  assert.equal(a.element('picks').value, 10);
  assert.equal(a.element('picks').max, 10);
  assert.equal(a.element('durationValue').textContent, '10 seconds');
  assert.equal(a.listeners.has('devicemotion'), true);
  a.element('motion').listeners.click();
  assert.equal(a.listeners.has('devicemotion'), false);
  assert.equal(a.saved().motionPreferred, false);
});

test('only valid counts are saved; duration changes survive a reload', () => {
  const a = app();
  a.element('total').value = '20'; a.element('picks').value = '4'; a.run('configure()');
  a.element('picks').value = '25'; a.run('configure()');
  assert.equal(a.saved().picks, 4);
  a.element('mixDuration').value = '12'; a.element('mixDuration').listeners.input();
  const b = app({ saved: JSON.stringify(a.saved()) });
  assert.equal(b.element('total').value, 20);
  assert.equal(b.element('picks').value, 4);
  assert.equal(b.element('mixDuration').value, 12);
});

test('malformed settings, invalid values and blocked storage leave the app usable', () => {
  for (const options of [{saved:'{'}, {saved:'null'}, {blocked:true},
    {saved:JSON.stringify({total:501,picks:900,mixSeconds:-2,motionPreferred:'true'})}]) {
    const a = app(options);
    assert.equal(a.element('total').value, 49);
    assert.equal(a.element('mixDuration').value, 5);
    a.run('saveSettings(); startDraw()');
    assert.equal(a.run('state'), 'drawing');
  }
});

test('active movement duration scales; idle time and overlapping sensors add no extra credit', () => {
  const a = app();
  a.run('recordMovement(1100, 1000)');
  assert.equal(a.run('energy'), 2);
  a.run('recordMovement(1100, 1000)');
  assert.equal(a.run('energy'), 2);
  a.run('recordMovement(9000, 1100)');
  assert.equal(a.run('energy'), 2);
  a.run('mixSeconds = 10; reset(); recordMovement(1100, 1000)');
  assert.equal(a.run('energy'), 1);
  a.run('reset(); for (let time = 1100; time <= 10900; time += 100) recordMovement(time, time - 100)');
  assert.equal(a.run('state'), 'ready');
  a.run('recordMovement(11000,10900)');
  assert.equal(a.run('state'), 'drawing');
});

test('automatic button mixing waits the selected time and locks duration during a draw', () => {
  const a = app();
  a.run('mixSeconds = 10; startDraw()');
  assert.equal(a.element('mixDuration').disabled, true);
  const mix = a.frames.pop();
  mix(6000);
  assert.equal(a.run('energy'), 50);
  assert.equal(a.run('state'), 'drawing');
  a.frames.pop()(11000);
  assert.equal(a.run('state'), 'done');
  assert.equal(a.element('mixDuration').disabled, false);
  assert.equal(a.run('new Set(selected).size'), 6);
});

test('saved motion preference waits for a user gesture when permission is required', async () => {
  const a = app({ saved: JSON.stringify({ motionPreferred:true }), permission:'granted' });
  assert.equal(a.permissionCalls(), 0);
  assert.equal(a.element('motion').textContent, 'Resume phone shake');
  await a.run('enableMotion(true)');
  assert.equal(a.permissionCalls(), 1);
  assert.equal(a.listeners.has('devicemotion'), true);
  assert.equal(a.saved().motionPreferred, true);
});

test('denied motion permission leaves retry and button mixing available', async () => {
  const a = app({ permission:'denied' });
  await a.run('enableMotion(true)');
  assert.equal(a.listeners.has('devicemotion'), false);
  assert.equal(a.element('motion').disabled, false);
  assert.equal(a.run('motionPreferred'), false);
  a.run('startDraw()');
  assert.equal(a.run('state'), 'drawing');
});

test('balls wait in ordered, non-overlapping rows above the chamber for every supported size', () => {
  const a = app();
  for (const n of [1, 6, 49, 500]) {
    a.run(`total = ${n}; reset()`);
    assert.equal(a.run('particles.length'), n);
    assert(a.run('particles.every((b,i) => b.number === i+1 && b.phase === "queued" && b.y+b.r < trayHeight && b.x-b.r > 10 && b.x+b.r < 440)'));
    assert(a.run('particles.every((b,i) => particles.slice(i+1).every(c => Math.hypot(b.x-c.x,b.y-c.y) >= b.r+c.r))'));
    a.run('particles.forEach(b => updateDrop(b, 99999))');
    assert(a.run('particles.every(b => b.phase === "queued")'));
  }
});

test('movement releases balls in order and reset returns them to the tray', () => {
  const a = app();
  a.run('addEnergy(1); particles.forEach(b => updateDrop(b, 1010))');
  assert.equal(a.run('particles[0].phase'), 'falling');
  assert.equal(a.run('particles[1].phase'), 'queued');
  a.run('particles.forEach(b => updateDrop(b, 3100))');
  assert(a.run('particles.every(b => b.phase === "mixing" && Math.hypot(b.x-225,b.y-chamberY) <= 214-b.r)'));
  a.run('reset()');
  assert.equal(a.run('dropStarted'), null);
  assert(a.run('particles.every(b => b.phase === "queued" && b.x === b.homeX && b.y === b.homeY)'));
});

test('a full meter cannot reveal winners before the last ball has entered', () => {
  const a = app();
  a.run('total = 500; reset(); addEnergy(100)');
  a.frames.pop()(2000);
  assert.equal(a.run('state'), 'drawing');
  a.frames.pop()(3100);
  assert.equal(a.run('state'), 'done');
  assert.equal(a.run('particles.length'), 494);
  assert(a.run('particles.every(b => b.phase === "mixing")'));
});

test('reduced-motion mode places balls inside without a falling animation', () => {
  const a = app({ reduced: true });
  a.run('addEnergy(1); particles.forEach(b => updateDrop(b, 1000))');
  assert(a.run('particles.every(b => b.phase === "mixing" && Math.hypot(b.x-225,b.y-chamberY) <= 214-b.r)'));
  assert.equal(a.run('new Set(particles.map(b => `${b.x},${b.y}`)).size'), 49);
});

test('mobile waits for start, requests permission on double-tap and enables shaking', async () => {
  const a = app({mobile:true, permission:'granted'});
  a.run('addEnergy(20)');
  assert.equal(a.run('energy'), 0);
  assert.equal(a.permissionCalls(), 0);
  const event = {isPrimary:true,pointerId:1,clientX:100,clientY:100,target:{closest(){return null;}}};
  a.listeners.get('pointerdown')(event); a.listeners.get('pointerup')(event);
  assert.equal(a.permissionCalls(), 0);
  a.clock(1200);
  a.listeners.get('pointerdown')(event); a.listeners.get('pointerup')(event);
  assert.equal(a.permissionCalls(), 1);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(a.run('mobileArmed'), true);
  assert.equal(a.run('state'), 'ready');
  a.run('addEnergy(20)'); assert.equal(a.run('energy'), 20);
});

test('mobile denied motion falls back to automatic mixing and opens results', async () => {
  const a = app({mobile:true,permission:'denied'});
  await a.run('startMobile()');
  assert.equal(a.run('state'), 'drawing');
  a.frames.pop()(10000);
  assert.equal(a.run('sheetOpen'), true);
  assert.equal(a.element('sheetContent').inert, false);
  assert.equal(a.element('sheetToggle').attributes['aria-expanded'], 'true');
});

test('mobile displays all ten selected balls together without pagination', () => {
  const a = app({mobile:true});
  a.run('total = 500; picks = 10; reset(); startDraw()');
  a.frames.pop()(10000);
  assert.equal(a.element('results').children.length, 10);
  assert.equal(new Set(a.element('results').children.map(ball => ball.textContent)).size, 10);
  assert.equal(a.element('results').style['--ball-count'], 10);
});

test('pick count is limited to ten and to the available number of balls', () => {
  const a = app();
  a.element('total').value = '49'; a.element('picks').value = '11'; a.run('configure()');
  assert.equal(a.run('valid'), false);
  a.element('picks').value = '10'; a.run('configure()');
  assert.equal(a.run('valid'), true);
  assert.equal(a.saved().picks, 10);
  a.element('total').value = '3'; a.run('configure()');
  assert.equal(a.run('valid'), false);
  a.element('picks').value = '3'; a.run('configure()');
  assert.equal(a.run('valid'), true);
  assert.equal(a.element('picks').max, 3);
  const restored = app({saved:JSON.stringify({total:500,picks:500})});
  assert.equal(restored.element('picks').value, 10);
  assert.equal(restored.element('total').value, 500);
});

test('mobile swipe down dismisses results; handle reopens them and reset clears the sheet', () => {
  const a = app({mobile:true});
  a.run('startDraw()'); a.frames.pop()(10000);
  const target = {closest(selector){return ['#resultSheet','#sheetToggle'].includes(selector) ? {} : null;}};
  a.listeners.get('pointerdown')({isPrimary:true,pointerId:1,clientX:100,clientY:100,target});
  a.listeners.get('pointerup')({pointerId:1,clientX:110,clientY:200,target});
  assert.equal(a.run('sheetOpen'),false);
  assert.equal(a.element('sheetContent').inert,true);
  a.run('setSheetOpen(true)');
  assert.equal(a.run('sheetOpen'),true);
  a.run('reset()');
  assert.equal(a.element('sheetLabel').textContent,'Results will appear here');
  assert.equal(a.run('mobileArmed'),false);
});

test('a drag or cancelled touch does not trigger the mobile double-tap action', () => {
  const a = app({mobile:true,permission:'granted'});
  const event = {isPrimary:true,pointerId:1,clientX:100,clientY:100,target:{closest(){return null;}}};
  a.listeners.get('pointerdown')(event);
  a.listeners.get('pointerup')({...event,clientY:180});
  a.clock(1200);
  a.listeners.get('pointerdown')(event);
  a.listeners.get('pointerup')(event);
  assert.equal(a.permissionCalls(),0);
  a.listeners.get('pointercancel')();
  a.clock(1400);
  a.listeners.get('pointerdown')(event);
  a.listeners.get('pointerup')(event);
  assert.equal(a.permissionCalls(),0);
});


test('mobile settings opens, saves changes and closes back to the machine', () => {
  const a = app({mobile:true});
  a.element('openSettings').listeners.click();
  assert.equal(a.run('settingsOpen'), true);
  assert.equal(a.element('settingsDialog').open, true);
  a.element('total').value = '60'; a.element('picks').value = '8';
  a.run('configure()');
  a.element('mixDuration').value = '9'; a.element('mixDuration').listeners.input();
  a.element('closeSettings').listeners.click();
  assert.equal(a.run('settingsOpen'), false);
  assert.equal(a.element('settingsDialog').open, false);
  assert.equal(a.saved().total, 60);
  assert.equal(a.saved().picks, 8);
  assert.equal(a.saved().mixSeconds, 9);
  assert.equal(a.element('mobileSummary').textContent, '8 of 60 balls · 9s mixing');
});

test('settings pauses motion and double-tap starts until dismissed', async () => {
  const a = app({mobile:true,permission:'granted'});
  a.run('mobileArmed = true; addEnergy(10); openSettings(); addEnergy(20); startDraw()');
  await a.run('startMobile()');
  assert.equal(a.run('energy'), 10);
  assert.equal(a.run('state'), 'ready');
  assert.equal(a.permissionCalls(), 0);
  a.run('closeSettings(); addEnergy(20)');
  assert.equal(a.run('energy'), 30);
});

test('invalid settings keep Done open; cancelling restores last valid values', () => {
  const a = app({mobile:true});
  a.run('openSettings()');
  a.element('picks').value = '999'; a.run('configure()');
  a.element('closeSettings').listeners.click();
  assert.equal(a.run('settingsOpen'), true);
  a.element('settingsDialog').listeners.cancel({preventDefault(){}});
  assert.equal(a.run('settingsOpen'), false);
  assert.equal(a.element('picks').value, 6);
  assert.equal(a.run('valid'), true);
});

test('settings cannot interrupt an automatic draw or open on desktop', () => {
  const a = app({mobile:true});
  a.run('startDraw(); openSettings()');
  assert.equal(a.run('settingsOpen'), false);
  const desktop = app();
  desktop.run('openSettings()');
  assert.equal(desktop.run('settingsOpen'), false);
});


test('mobile result history shows five previous draws in order without repeating the latest', () => {
  const a = app({mobile:true});
  for (let i = 0; i < 7; i++) {
    a.run('reset(); startDraw()');
    a.frames.pop()(10000);
  }
  const rows = a.element('historyRows').children;
  assert.equal(a.element('history').hidden, false);
  assert.equal(rows.length, 5);
  assert.equal(rows[0].children[0].children[0].textContent, 'Draw 6 · 6 of 49');
  assert.equal(rows[4].children[0].children[0].textContent, 'Draw 2 · 6 of 49');
  assert.equal(rows[0].children[1].children.length, 6);
  assert.equal(a.element('sheetContent').scrollTop, 0);
});

test('scrolling results does not dismiss the sheet and only single-finger content scrolling is allowed', () => {
  const a = app({mobile:true});
  a.run('startDraw()'); a.frames.pop()(10000);
  const target = {closest(selector){return ['#resultSheet','#sheetContent'].includes(selector) ? {} : null;}};
  a.listeners.get('pointerdown')({isPrimary:true,pointerId:1,clientX:100,clientY:100,target});
  a.listeners.get('pointerup')({pointerId:1,clientX:100,clientY:220,target});
  assert.equal(a.run('sheetOpen'), true);
  let prevented = false;
  a.listeners.get('touchmove')({target,touches:[{}],preventDefault(){prevented=true;}});
  assert.equal(prevented,false);
  a.listeners.get('touchmove')({target,touches:[{},{}],preventDefault(){prevented=true;}});
  assert.equal(prevented,true);
  prevented = false;
  a.listeners.get('touchmove')({target:{closest(){return null;}},touches:[{}],preventDefault(){prevented=true;}});
  assert.equal(prevented,true);
});
