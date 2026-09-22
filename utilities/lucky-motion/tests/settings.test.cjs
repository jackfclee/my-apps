const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../script.js'), 'utf8');

function app({ saved = null, blocked = false, permission } = {}) {
  const elements = new Map(), listeners = new Map(), frames = [];
  let stored = saved, now = 1000, permissionCalls = 0;
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      value: '', style: {}, children: [], attributes: {}, listeners: {},
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
    performance: { now: () => now }, matchMedia: () => ({ matches: false }),
    crypto: require('node:crypto').webcrypto,
    requestAnimationFrame(fn) { frames.push(fn); }, setTimeout() { return 1; }, clearTimeout() {}
  });
  vm.runInContext(source, context);
  return { element, listeners, frames, run: code => vm.runInContext(code, context),
    saved: () => JSON.parse(stored), clock(value) { now = value; }, permissionCalls: () => permissionCalls };
}

test('restores saved counts, duration and motion; can persist disabling motion', () => {
  const a = app({ saved: JSON.stringify({ total: 80, picks: 12, mixSeconds: 20, motionPreferred: true }) });
  assert.equal(a.element('total').value, 80);
  assert.equal(a.element('picks').value, 12);
  assert.equal(a.element('picks').max, 80);
  assert.equal(a.element('durationValue').textContent, '20 seconds');
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
  a.element('mixDuration').value = '30'; a.element('mixDuration').listeners.input();
  const b = app({ saved: JSON.stringify(a.saved()) });
  assert.equal(b.element('total').value, 20);
  assert.equal(b.element('picks').value, 4);
  assert.equal(b.element('mixDuration').value, 30);
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
