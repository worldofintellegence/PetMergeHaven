(() => {
  'use strict';

  // The yard is a 12×12 world; the screen shows a 6×6 window you can drag around.
  const COLS = 12, ROWS = 12, N = COLS * ROWS, VIEW = 6, MAX = PETS.length;
  const idx = (r, c) => r * COLS + c;
  const FROM6 = (i) => idx(Math.floor(i / 6) + 3, (i % 6) + 3); // old 6×6 saves sit in the middle
  // Tiles open at the start: a small 2x3 patch in the middle of the yard.
  const START_OPEN = [8, 9, 14, 15, 20, 21].map(FROM6);
  const $ = (s) => document.querySelector(s);

  const IMGS = PETS.map((_, i) => renderPet(i + 1, 180).toDataURL());
  const BLINK = PETS.map((_, i) => renderPet(i + 1, 180, 'blink').toDataURL());
  const HAPPY = PETS.map((_, i) => renderPet(i + 1, 180, 'happy').toDataURL());
  const SRC2LV = new Map();
  [IMGS, BLINK, HAPPY].forEach((set) => set.forEach((src, i) => SRC2LV.set(src, i + 1)));
  const LOCK_SVG = '<svg class="lock" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2.5" fill="currentColor"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>';

  // Upgrade icons, drawn as SVG to match the game's art style.
  const ICON = {
    nest: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="20" rx="9" ry="11" fill="#ffd54a" stroke="#c98a12" stroke-width="2.2"/><ellipse cx="21" cy="15.5" rx="2.6" ry="3.6" fill="#fff6c8"/><path d="M6 26q18 6 36 0q-2 14-18 14Q8 40 6 26z" fill="#b97a3f" stroke="#7a4a22" stroke-width="2.2" stroke-linejoin="round"/><path d="M9.5 30.5q14.5 5 29 0M12 35.5q12 4 24 0" fill="none" stroke="#e0a565" stroke-width="2" stroke-linecap="round"/><path d="M38 6l1.6 3.6 3.6 1.6-3.6 1.6L38 16.4l-1.6-3.6-3.6-1.6 3.6-1.6z" fill="#fff" stroke="#f0a400" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
    hatch: `<svg viewBox="0 0 48 48"><circle cx="24" cy="27" r="16" fill="#ffb26b" opacity=".35"/><path d="M24 2.5c3 3-1 4 2 7.5M17.5 5c2 2.2-1 3.2 1 5.5M30.5 5c2 2.2-1 3.2 1 5.5" stroke="#ff6a2e" stroke-width="2.2" fill="none" stroke-linecap="round"/><ellipse cx="24" cy="28.5" rx="6.5" ry="8" fill="#fff3dc" stroke="#c99a5e" stroke-width="2"/><circle cx="22" cy="26" r="1.6" fill="#f6b26b"/><circle cx="26.5" cy="31" r="1.3" fill="#f6b26b"/><path d="M10 35V25a14 14 0 0 1 28 0v10" fill="rgba(200,235,255,.45)" stroke="#6fa8d0" stroke-width="2.2"/><path d="M14.5 23a9.5 9.5 0 0 1 5.5-7" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/><rect x="7" y="34.5" width="34" height="8" rx="3.5" fill="#e2683c" stroke="#9b3c1c" stroke-width="2.2"/><circle cx="14" cy="38.5" r="1.6" fill="#ffd54a"/></svg>`,
    charm: `<svg viewBox="0 0 48 48"><g fill="#5ccf6b" stroke="#2f8a3e" stroke-width="2" stroke-linejoin="round"><path d="M22 21C17 21 12.5 17 15 12.5C17 9.5 20.5 10 22 12.5C23.5 10 27 9.5 29 12.5C31.5 17 27 21 22 21z"/><path d="M22 21C17 21 12.5 17 15 12.5C17 9.5 20.5 10 22 12.5C23.5 10 27 9.5 29 12.5C31.5 17 27 21 22 21z" transform="rotate(90 22 21)"/><path d="M22 21C17 21 12.5 17 15 12.5C17 9.5 20.5 10 22 12.5C23.5 10 27 9.5 29 12.5C31.5 17 27 21 22 21z" transform="rotate(180 22 21)"/><path d="M22 21C17 21 12.5 17 15 12.5C17 9.5 20.5 10 22 12.5C23.5 10 27 9.5 29 12.5C31.5 17 27 21 22 21z" transform="rotate(270 22 21)"/></g><circle cx="22" cy="21" r="2.6" fill="#9be67a"/><path d="M24 30q3 7 9 9" stroke="#2f8a3e" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="37" cy="37" r="7.5" fill="#ffc531" stroke="#b8740e" stroke-width="2"/><circle cx="37" cy="37" r="3.8" fill="none" stroke="#d8901a" stroke-width="1.6"/></svg>`,
    cuddle: `<svg viewBox="0 0 48 48"><path d="M24 42C10 32 4.5 25 4.5 17.5 4.5 11 9.5 6.5 15 6.5c4 0 7 2 9 5 2-3 5-5 9-5 5.5 0 10.5 4.5 10.5 11 0 7.5-5.5 14.5-19.5 24.5z" fill="#ff7fa8" stroke="#c94a78" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 15a5 5 0 0 1 5-4" stroke="#ffd1e1" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="24" cy="27" rx="6.2" ry="5.2" fill="#fff"/><circle cx="17.3" cy="20" r="2.7" fill="#fff"/><circle cx="21.7" cy="16.6" r="2.7" fill="#fff"/><circle cx="26.3" cy="16.6" r="2.7" fill="#fff"/><circle cx="30.7" cy="20" r="2.7" fill="#fff"/></svg>`,
    family: `<svg viewBox="0 0 48 48"><rect x="31" y="8" width="5.5" height="10" rx="1" fill="#b34a26"/><path d="M4.5 24.5L24 8l19.5 16.5z" fill="#ff8a5c" stroke="#b34a26" stroke-width="2.2" stroke-linejoin="round"/><rect x="10.5" y="23" width="27" height="19" rx="2.5" fill="#fff3dc" stroke="#b08a5e" stroke-width="2.2"/><path d="M24 38C18 34 16 31 16 28.3c0-2.5 2-4.3 4-4.3 2 0 3.4 1.2 4 2.5.6-1.3 2-2.5 4-2.5 2 0 4 1.8 4 4.3 0 2.7-2 5.7-8 9.7z" fill="#ff5c8f" stroke="#c94a78" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    auto: `<svg viewBox="0 0 48 48"><path d="M40 18.2A17 17 0 1 1 29.8 8" fill="none" stroke="#7b55d6" stroke-width="3" stroke-linecap="round"/><path d="M34.6 9.7L31 4.7 28.6 11.3z" fill="#7b55d6" stroke="#7b55d6" stroke-width="1.5" stroke-linejoin="round"/><g fill="#ffad60" stroke="#b5651d" stroke-width="2"><ellipse cx="22.5" cy="28" rx="7" ry="6"/><circle cx="15" cy="20.5" r="3"/><circle cx="20" cy="16.5" r="3"/><circle cx="25.5" cy="16.5" r="3"/><circle cx="30.3" cy="20.5" r="3"/></g><circle cx="37.5" cy="37.5" r="8" fill="#fff" stroke="#7b55d6" stroke-width="2.2"/><path d="M37.5 37.5v-4.6M37.5 37.5h3.4" stroke="#4a3558" stroke-width="2" stroke-linecap="round"/></svg>`,
    amerge: `<svg viewBox="0 0 48 48"><circle cx="11" cy="14" r="7.5" fill="#ffcadd" stroke="#c94a78" stroke-width="2.2"/><circle cx="37" cy="14" r="7.5" fill="#ffcadd" stroke="#c94a78" stroke-width="2.2"/><circle cx="9" cy="12.5" r="1.2" fill="#4a3558"/><circle cx="13" cy="12.5" r="1.2" fill="#4a3558"/><circle cx="35" cy="12.5" r="1.2" fill="#4a3558"/><circle cx="39" cy="12.5" r="1.2" fill="#4a3558"/><path d="M15.5 20.5l5 5.5M32.5 20.5l-5 5.5" stroke="#2d86d1" stroke-width="3" stroke-linecap="round"/><path d="M24 25.5l3.3 6.8 7.4 1-5.4 5.2 1.3 7.4L24 42.4l-6.6 3.5 1.3-7.4-5.4-5.2 7.4-1z" fill="#ffd54a" stroke="#c98a12" stroke-width="2" stroke-linejoin="round"/></svg>`,
    rush: `<svg viewBox="0 0 48 48"><circle cx="21" cy="27" r="15" fill="#ffc531" stroke="#b8740e" stroke-width="2.4"/><circle cx="21" cy="27" r="10.5" fill="none" stroke="#d8901a" stroke-width="2"/><path d="M23.5 15.5L15 29h6l-3 9.5L28 24h-6z" fill="#fff6c0" stroke="#b8740e" stroke-width="1.8" stroke-linejoin="round"/><rect x="28.5" y="3.5" width="17" height="12" rx="6" fill="#ff5c8f" stroke="#c94a78" stroke-width="1.5"/><path d="M32.8 7.3l3.4 4.4M36.2 7.3l-3.4 4.4M38.6 8.1c.6-1 2.6-1 2.9.2.3 1.3-2.9 2.6-2.9 3.4h3.2" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };

  // Permanent upgrades have levels; boosters (kind: 'boost') last BOOST_ADD seconds of play and can be stacked.
  const BOOST_ADD = 180, BOOST_MAX = 540;
  const UPG = {
    egg: {
      name: 'Golden Nest', icon: ICON.nest, bg: '#ffe9a8', max: MAX - 6,
      desc: (l) => `New eggs hatch as ${PETS[Math.min(l + 1, MAX - 1)].name}`,
      cost: (l) => Math.floor(900 * Math.pow(28, l)),
    },
    hatch: {
      name: 'Warm Incubator', icon: ICON.hatch, bg: '#ffd6c4', max: 8,
      desc: (l) => `Free egg every ${hatchInterval(l + 1).toFixed(1)}s (now ${hatchInterval(l).toFixed(1)}s)`,
      cost: (l) => Math.floor(150 * Math.pow(3, l)),
    },
    charm: {
      name: 'Lucky Clover', icon: ICON.charm, bg: '#d4f5cf', max: 30,
      desc: (l) => `+25% coins from every pet (now +${l * 25}%)`,
      cost: (l) => Math.floor(400 * Math.pow(3.1, l)),
    },
    cuddle: {
      name: 'Cuddle Charm', icon: ICON.cuddle, bg: '#ffdce9', max: 10,
      desc: (l) => `+50% coins when you cuddle a pet that asks (now +${l * 50}%)`,
      cost: (l) => Math.floor(600 * Math.pow(3.2, l)),
    },
    family: {
      name: 'Family Ribbon', icon: ICON.family, bg: '#ffe4d1', max: 15,
      desc: (l) => `+20% coins from adoptions (now +${l * 20}%)`,
      cost: (l) => Math.floor(500 * Math.pow(3, l)),
    },
    amerge: {
      name: 'Auto Merge', icon: ICON.amerge, bg: '#dcefff', max: 8,
      desc: (l) => `Merges pets & serves customers for ${amDur(l + 1)}s, every ${amStep(l + 1).toFixed(1)}s · recharge ${amCharge(l + 1)}s${l + 1 >= 5 ? ' · restarts by itself' : ''}`,
      cost: (l) => Math.floor(2500 * Math.pow(3.4, l)),
    },
    auto: {
      kind: 'boost', name: 'Auto Petter', icon: ICON.auto, bg: '#e7ddff',
      desc: () => 'Every pet gets petted automatically for 3 min',
      cost: () => Math.max(150, Math.round(totalIncome() * 40)),
    },
    rush: {
      kind: 'boost', name: 'Coin Rush', icon: ICON.rush, bg: '#fff1b8',
      desc: () => 'All pets earn double coins for 3 min',
      cost: () => Math.max(250, Math.round(totalIncome() * 60)),
    },
  };
  const isBoost = (k) => UPG[k].kind === 'boost';
  const upgCost = (k) => isBoost(k) ? UPG[k].cost() : UPG[k].cost(S.upg[k]);
  const upgMaxed = (k) => isBoost(k) ? S.boost[k] > BOOST_MAX - BOOST_ADD : S.upg[k] >= UPG[k].max;
  const rushMul = () => (S.boost.rush > 0 ? 2 : 1);
  const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

  // ---------- state ----------
  const loaded = load();
  let S = loaded || fresh();
  let hasSave = !!loaded;   // a saved game exists -> "Continue" is available
  let started = false;      // player has entered the game at least once this session
  let paused = true;        // game loop frozen (main menu / pause screen)

  function fresh() {
    const grid = Array(N).fill(0), open = Array(N).fill(0);
    START_OPEN.forEach((i) => (open[i] = 1));
    [14, 15, 20].map(FROM6).forEach((i) => (grid[i] = 1));
    return {
      coins: 20, grid, open, bought: 0, maxLevel: 1, discovered: [1],
      upg: { egg: 0, hatch: 0, charm: 0, cuddle: 0, family: 0, amerge: 0 }, boost: { auto: 0, rush: 0 }, orders: [null, null, null], served: 0,
      level: 1, xp: 0, hatchT: 0, last: Date.now(), sound: true, music: true, tutDone: false,
      stats: { merges: 0, taps: 0, cuddles: 0, sells: 0, undos: 0, boosts: 0, earned: 0 }, ach: {},
      streak: 0, bestStreak: 0, am: { phase: 'ready', t: 0 },
    };
  }
  function load() {
    try {
      const raw = Platform.loadSave();
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (Array.isArray(s.grid) && s.grid.length === 36 && Array.isArray(s.open)) { // 6×6 save → 12×12 world
        const g = Array(N).fill(0), op = Array(N).fill(0);
        s.grid.forEach((L, i) => (g[FROM6(i)] = L)); s.open.forEach((v, i) => (op[FROM6(i)] = v));
        s.grid = g; s.open = op;
      }
      if (!Array.isArray(s.grid) || s.grid.length !== N || !Array.isArray(s.open)) return null;
      // saves from before the tutorial existed: only players still on level 1 get it
      const f = fresh();
      s.upg = Object.assign(f.upg, s.upg); s.boost = Object.assign(f.boost, s.boost); // older saves lack new upgrades
      s.stats = Object.assign(f.stats, s.stats); s.ach = s.ach || {}; s.am = s.am || f.am;
      if (s.tutDone === undefined) s.tutDone = (s.level || 1) > 1 || (s.served || 0) > 0;
      return Object.assign(fresh(), s);
    } catch (e) { return null; }
  }
  function save() {
    if (!started) return; // never write a save from the menu before a game begins
    hasSave = true;
    S.last = Date.now();
    Platform.writeSave(JSON.stringify(S));
  }

  // Settings live outside the save so "New Game" never resets them.
  const SET_KEY = 'petMergeHaven.settings';
  const SET = Object.assign({ music: 0.7, sfx: 1, zoom: 1, reduceMotion: false, sci: false }, (() => {
    try { return JSON.parse(localStorage.getItem(SET_KEY)) || {}; } catch (e) { return {}; }
  })());
  function saveSettings() { try { localStorage.setItem(SET_KEY, JSON.stringify(SET)); } catch (e) {} }
  function applySettings() {
    document.body.classList.toggle('reduce-motion', !!SET.reduceMotion);
    if (Platform.canZoom) Platform.setZoom(SET.zoom);
    if (typeof MUSIC !== 'undefined') MUSIC.setVolume(SET.music);
  }

  // ---------- economy ----------
  const baseIncome = (L) => Math.round(Math.pow(2.3, L - 1));
  const income = (L) => baseIncome(L) * (1 + 0.25 * S.upg.charm);
  const totalIncome = () => S.grid.reduce((a, L) => a + (L ? income(L) : 0), 0);
  const eggCost = () => Math.floor(15 * Math.pow(1.06, S.bought));
  const spawnLevel = () => 1 + S.upg.egg;
  // Auto Merge is a timed power: it runs, then recharges. Levels add run time, speed and faster recharge.
  const amDur = (l = S.upg.amerge) => 20 + 5 * l;                       // 25 s … 60 s
  const amStep = (l = S.upg.amerge) => Math.max(0.8, 2.6 - 0.22 * l);   // one action every 2.4 s … 0.8 s
  const amCharge = (l = S.upg.amerge) => Math.max(25, 95 - 9 * l);      // 86 s … 25 s
  function hatchInterval(l = S.upg.hatch) { return Math.max(1.5, 6 - 0.55 * l); }
  const sellValue = (L) => Math.floor(income(L) * 12);
  const openCount = () => S.open.reduce((a, b) => a + b, 0);
  const unlockCost = () => Math.floor(30 * Math.pow(1.38, openCount() - START_OPEN.length));
  // Adoption streak: every adoption in a row adds +10% to all family prices (max ×2). A family leaving resets it.
  const streakMul = () => 1 + 0.1 * Math.min(S.streak || 0, 10);
  const orderReward = (o) => Math.round(o.reward * (1 + 0.2 * S.upg.family) * streakMul());
  const xpNeed = (lv) => Math.floor(8 * Math.pow(1.4, lv - 1));

  function neighbors(i) {
    const r = Math.floor(i / COLS), c = i % COLS, out = [];
    if (r > 0) out.push(i - COLS);
    if (r < ROWS - 1) out.push(i + COLS);
    if (c > 0) out.push(i - 1);
    if (c < COLS - 1) out.push(i + 1);
    return out;
  }
  const buyable = (i) => !S.open[i] && neighbors(i).some((j) => S.open[j]);

  function fmt(n) {
    n = Math.floor(n);
    if (n < 1000) return String(n);
    if (SET.sci && n >= 1e6) return n.toExponential(2).replace('e+', 'e');
    const u = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp'];
    let i = -1;
    while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; }
    return (n < 10 ? n.toFixed(2) : n < 100 ? n.toFixed(1) : Math.floor(n)) + u[i];
  }

  // ---------- audio ----------
  let AC;
  function tone(f, d = 0.1, type = 'sine', vol = 0.15, slide = 0) {
    if (!S.sound) return;
    try {
      if (!audioCtx()) return;
      const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(f * slide, t + d);
      g.gain.setValueAtTime(Math.max(0.0002, vol * SET.sfx), t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + 0.02);
    } catch (e) {}
  }
  const SFX = {
    merge: (l) => { tone(300 + l * 50, 0.15, 'triangle', 0.2, 2); setTimeout(() => tone(500 + l * 70, 0.2, 'sine', 0.14, 1.5), 70); },
    pop: () => tone(620, 0.07, 'sine', 0.1, 1.5),
    tap: () => tone(1100, 0.06, 'square', 0.035, 1.3),
    buy: () => tone(420, 0.12, 'triangle', 0.16, 1.7),
    bad: () => tone(170, 0.16, 'sawtooth', 0.07, 0.7),
    cash: () => { tone(880, 0.08, 'square', 0.05); setTimeout(() => tone(1320, 0.12, 'square', 0.05), 80); },
    unlock: () => { tone(330, 0.1, 'square', 0.06, 1.5); setTimeout(() => tone(660, 0.18, 'triangle', 0.14, 1.3), 90); },
    fanfare: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'triangle', 0.16), i * 110)),
    hover: () => tone(880, 0.07, 'sine', 0.09, 1.5),
    // whoosh into the bin, then a "ka-ching"
    sell: () => {
      tone(900, 0.2, 'sawtooth', 0.035, 0.3);
      setTimeout(() => { tone(1568, 0.09, 'square', 0.045); tone(1976, 0.1, 'triangle', 0.09); }, 170);
      setTimeout(() => tone(2637, 0.28, 'triangle', 0.1), 260);
    },
    coin: (k) => tone(1100 + k * 85, 0.05, 'triangle', 0.07, 1.25),
    good: () => [660, 880, 1175, 1568].forEach((f, i) => setTimeout(() => tone(f, 0.16, 'triangle', 0.13), i * 75)),
    wish: () => { tone(988, 0.09, 'sine', 0.1, 1.3); setTimeout(() => tone(1319, 0.14, 'sine', 0.1, 1.2), 110); },
    happy: () => [784, 988, 1175, 1568, 1976].forEach((f, i) => setTimeout(() => tone(f, 0.14, i % 2 ? 'sine' : 'triangle', 0.12, 1.1), i * 65)),
  };

  // ---------- background music (generated live: music-box melody, soft chords, bass, shaker) ----------
  const MUSIC = (() => {
    const BPM = 96, EIGHTH = 60 / BPM / 2;
    const CHORDS = [[48, [60, 64, 67]], [45, [57, 60, 64]], [41, [57, 60, 65]], [43, [55, 59, 62]]]; // C Am F G
    const _ = null;
    const MELODY = [
      [76, _, 79, _, 84, 83, 79, _], [81, _, 76, _, 72, _, 76, 79], [77, _, 81, _, 84, _, 81, 77], [79, _, 74, 77, 79, _, _, _],
      [72, 76, 79, 76, 84, _, 79, _], [76, _, 72, 76, 81, _, 79, _], [77, 76, 74, _, 72, _, 74, _], [79, 77, 76, 74, 71, _, _, _],
      [84, _, 83, _, 79, _, 76, _], [81, 79, 76, _, 72, _, _, _], [77, _, 81, 84, 86, _, 84, 81], [79, _, _, 83, 86, _, 84, _],
    ];
    const ARP = [0, 1, 2, 1, 0, 1, 2, 1];
    let ac, out, noise, timer = null, step = 0, next = 0, on = false, vol = SET.music;
    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    function note(m, t, dur, type, vol, attack = 0.01) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = hz(m);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05);
    }
    function shaker(t, vol) {
      const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      src.buffer = noise; f.type = 'highpass'; f.frequency.value = 6000;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      src.connect(f).connect(g).connect(out); src.start(t); src.stop(t + 0.06);
    }
    function schedule() {
      while (next < ac.currentTime + 0.25) {
        const bar = Math.floor(step / 8) % MELODY.length, e = step % 8, [root, triad] = CHORDS[bar % 4];
        const m = MELODY[bar][e];
        if (m) { note(m, next, EIGHTH * 2.2, 'triangle', 0.16); note(m + 12, next, EIGHTH * 1.2, 'sine', 0.035); }
        note(triad[ARP[e]], next, EIGHTH * 1.6, 'sine', 0.05);
        if (e === 0 || e === 4) note(root - 12 + (e === 4 ? 7 : 0), next, EIGHTH * 3.5, 'triangle', 0.13, 0.02);
        if (e % 2 === 1) shaker(next, 0.05);
        next += EIGHTH; step++;
      }
    }
    return {
      start(ctx) {
        if (on || !ctx) return;
        ac = ctx; on = true;
        if (!out) {
          out = ac.createGain(); out.gain.value = 0.0001; out.connect(ac.destination);
          noise = ac.createBuffer(1, ac.sampleRate * 0.1, ac.sampleRate);
          const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        }
        out.gain.cancelScheduledValues(ac.currentTime);
        out.gain.setTargetAtTime(Math.max(0.0001, 0.8 * vol), ac.currentTime, 0.6); // gentle fade in
        next = ac.currentTime + 0.1;
        timer = setInterval(schedule, 60); schedule();
      },
      stop() {
        if (!on) return;
        on = false; clearInterval(timer); timer = null;
        if (out) out.gain.setTargetAtTime(0.0001, ac.currentTime, 0.15);
      },
      get on() { return on; },
      setVolume(v) { vol = v; if (on && out) out.gain.setTargetAtTime(Math.max(0.0001, 0.8 * vol), ac.currentTime, 0.1); },
    };
  })();
  function audioCtx() {
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    return AC;
  }
  // Music needs a user gesture before it may start; it also stops while the app is in the background.
  function syncMusic() {
    const want = S.music && !document.hidden;
    if (want) {
      const ac = audioCtx(); if (!ac) return;
      if (ac.state === 'suspended') ac.resume().catch(() => {});
      MUSIC.start(ac);
    } else MUSIC.stop();
  }
  function toggleMusic() { S.music = !S.music; syncMusic(); renderHUD(); save(); SFX.tap(); }
  window.addEventListener('pointerdown', () => { if (S.music && !MUSIC.on) syncMusic(); else if (AC && AC.state === 'suspended') AC.resume().catch(() => {}); }, true);

  // Gameplay events, used by the tutorial to notice when the player did the step.
  function tutEvent(ev) { if (tut) tutOnEvent(ev); achSoon(); }

  // ---------- DOM ----------
  const board = $('#board'), ordersEl = $('#orders'), fx = $('#fx');
  const cells = [];
  for (let i = 0; i < N; i++) {
    const c = document.createElement('div');
    c.className = 'cell'; c.dataset.i = i;
    board.appendChild(c); cells.push(c);
  }

  function renderCell(i, anim) {
    const c = cells[i], L = S.grid[i];
    const alt = (Math.floor(i / COLS) + (i % COLS)) % 2 === 1;
    c.className = 'cell' + (alt ? ' alt' : '');
    c.innerHTML = '';
    if (!S.open[i]) {
      c.classList.add('locked');
      if (buyable(i)) {
        c.classList.add('buyable');
        c.innerHTML = `<div class="price"><i class="coin"></i>${fmt(unlockCost())}</div>`;
        if (S.coins >= unlockCost()) c.classList.add('afford');
      } else c.innerHTML = LOCK_SVG;
      return;
    }
    if (L) {
      const im = new Image();
      im.src = IMGS[L - 1]; im.className = 'pet'; im.draggable = false; im.alt = PETS[L - 1].name;
      im.style.animationDelay = (-Math.random() * 2.4).toFixed(2) + 's';
      c.appendChild(im);
      const b = document.createElement('span'); b.className = 'lv'; b.textContent = L; c.appendChild(b);
      if (anim) { void c.offsetWidth; c.classList.add('pop'); }
      if (wish && wish.i === i && wish.L === L) c.classList.add('wish');
    }
  }
  function renderLocked() { for (let i = 0; i < N; i++) if (!S.open[i]) renderCell(i); }
  function renderAll() { for (let i = 0; i < N; i++) renderCell(i); renderOrders(); renderStreak(); renderHUD(); renderXP(); renderBoosts(); renderDock(); }

  let lastAfford = null;
  function renderHUD() {
    $('#coins').textContent = fmt(S.coins);
    $('#rate').textContent = fmt(totalIncome() * rushMul()) + '/s';
    const cost = eggCost();
    $('#cost').textContent = fmt(cost);
    $('#buyBtn').classList.toggle('disabled', S.coins < cost || !emptyCells().length);
    $('#buyIcon').src = IMGS[spawnLevel() - 1];
    $('#soundBtn').classList.toggle('muted', !S.sound);
    $('#cbCoins').textContent = fmt(S.coins); $('#cbRate').textContent = fmt(totalIncome() * rushMul()) + '/s';
    $('#cbCost').textContent = fmt(cost); $('#cbBuyIcon').src = IMGS[spawnLevel() - 1];
    ['#musicBtn', '#menuMusic', '#pauseMusic'].forEach((s) => $(s).classList.toggle('muted', !S.music));
    const afford = S.coins >= unlockCost();
    if (afford !== lastAfford) {
      lastAfford = afford;
      document.querySelectorAll('.cell.buyable').forEach((c) => c.classList.toggle('afford', afford));
    }
  }
  function renderXP() {
    const need = xpNeed(S.level);
    $('#lvl').textContent = S.level;
    $('#xpFill').style.width = Math.min(100, (S.xp / need) * 100) + '%';
    $('#xpText').textContent = `${fmt(S.xp)} / ${fmt(need)} XP`;
  }

  const CUSTC = {};
  const custImg = (seed, mood) => CUSTC[seed + (mood || '')] || (CUSTC[seed + (mood || '')] = renderCustomer(seed, mood, 120).toDataURL());
  function renderOrders() {
    ordersEl.innerHTML = '';
    const now = Date.now();
    S.orders.forEach((o, k) => {
      const slot = document.createElement('div');
      slot.className = 'oslot';
      slot.innerHTML = '<div class="oslot-wait">Next customer…</div>';
      const since = o && o.t ? now - o.t : 1e9;
      if (o && o.level) {
        if (o.cust == null) o.cust = k * 5 % CUSTOMER_LOOKS;
        const d = document.createElement('div');
        d.dataset.k = k;
        d.className = 'order cust' + (S.grid.includes(o.level) ? ' ready' : '') + (since < ARRIVE * 1000 + 100 ? ' arrive' : '');
        d.style.setProperty('--d', -Math.min(since, 600) + 'ms');
        d.innerHTML = `<img class="cust-av" src="${custImg(o.cust)}" alt="Customer">
          <div class="req"><img class="req-pet" src="${IMGS[o.level - 1]}" alt="">
            <div class="otxt"><div class="oname">${PETS[o.level - 1].name}</div>
            <div class="reward"><i class="coin sm"></i>${fmt(orderReward(o))}</div></div></div>
          <div class="obar"><i></i></div>`;
        paintBar(d, o);
        slot.appendChild(d);
      } else if (o && (o.done || o.gone) && since < LEAVE_MS) {
        // customer walking away: happy with their new pet, or sad
        const happy = !!o.done, L = o.done || o.gone;
        const d = document.createElement('div');
        d.className = 'order cust leave ' + (happy ? 'happy' : 'sad');
        d.style.setProperty('--d', -since + 'ms');
        d.innerHTML = `<img class="cust-av" src="${custImg(o.cust || 0, happy ? 'happy' : 'sad')}" alt="">
          <div class="req">${happy ? `<img class="req-pet" src="${HAPPY[L - 1]}" alt=""><div class="otxt"><div class="adopt-txt">Thank you! 💖</div>
            <div class="reward"><i class="coin sm"></i>+${fmt(o.paid)}</div></div>` : '<div class="otxt"><div class="adopt-txt sad">Maybe next time… 😢</div></div>'}</div>`;
        slot.appendChild(d);
      }
      ordersEl.appendChild(slot);
    });
  }


  // Patience bar: green → yellow → red, the card hurries when almost out of time.
  function paintBar(card, o) {
    const bar = card && card.querySelector('.obar i');
    if (!bar || !o || !o.dur) return;
    const f = Math.max(0, Math.min(1, o.left / o.dur));
    bar.style.width = (f * 100).toFixed(1) + '%';
    bar.className = f > 0.5 ? '' : f > 0.25 ? 'mid' : 'low';
    const c = card.classList.contains('order') ? card : card.querySelector('.order');
    if (c) c.classList.toggle('hurry', f <= 0.25);
  }
  function renderStreak() {
    const chip = $('#streakChip'), n = S.streak || 0;
    chip.classList.toggle('on', n > 0);
    chip.innerHTML = `🔥 ${n} in a row · <b>×${streakMul().toFixed(1)}</b>`;
  }

  // ---------- fx ----------
  function centerOf(el) { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  function floatText(x, y, text, cls = '') {
    const d = document.createElement('div');
    d.className = 'float ' + cls;
    d.textContent = text; d.style.left = x + 'px'; d.style.top = y + 'px';
    fx.appendChild(d); setTimeout(() => d.remove(), 1000);
  }
  function sparks(x, y, n = 12) {
    const cols = ['#ffd23a', '#ff7fa8', '#7fd3ff', '#9be67a', '#ffffff'];
    for (let k = 0; k < n; k++) {
      const s = document.createElement('div');
      s.className = 'spark';
      const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 40;
      s.style.left = x - 5 + 'px'; s.style.top = y - 5 + 'px';
      s.style.background = cols[k % cols.length];
      s.style.setProperty('--dx', Math.cos(a) * r + 'px'); s.style.setProperty('--dy', Math.sin(a) * r + 'px');
      fx.appendChild(s); setTimeout(() => s.remove(), 600);
    }
  }
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1800);
  }
  function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

  // ---------- modal ----------
  const modal = $('#modal'), card = $('#modalCard');
  const modalQueue = [];
  function openModal(html, onBind) {
    if (!modal.classList.contains('hidden') || document.body.classList.contains('companion')) { modalQueue.push([html, onBind]); return; }
    // html may be a function so queued popups render with up-to-date coins/costs
    card.innerHTML = typeof html === 'function' ? html() : html; modal.classList.remove('hidden');
    card.classList.toggle('wide', !!card.querySelector('.lvl-up'));
    card.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
    if (onBind) onBind(card);
  }
  function closeModal() {
    modal.classList.add('hidden'); modal.classList.remove('top');
    if (modalQueue.length) { const [h, b] = modalQueue.shift(); setTimeout(() => openModal(h, b), 120); }
  }
  modal.addEventListener('pointerdown', (e) => { if (e.target === modal) closeModal(); });

  function showDiscovery(L) {
    SFX.fanfare();
    openModal(`<h2>New pet!</h2><img class="hero" src="${IMGS[L - 1]}" alt="">
      <p style="font-size:22px;color:var(--ink);font-weight:700;margin-top:4px">${PETS[L - 1].name}</p>
      <p>Level ${L} · earns <b>${fmt(income(L))}</b> coins/sec</p>
      ${L === MAX ? '<p><b>You found the rarest pet of all!</b></p>' : ''}
      <div class="actions"><button class="btn go" data-close>Yay!</button></div>`);
  }

  function showBook() {
    const items = PETS.map((p, i) => {
      const L = i + 1, known = S.discovered.includes(L);
      return `<div class="${known ? '' : 'locked'}"><img src="${IMGS[i]}" alt="">${known ? p.name : '???'}
        <small>Lv ${L}${known ? ' · ' + fmt(income(L)) + '/s' : ''}</small></div>`;
    }).join('');
    openModal(`<h2>Pet Collection</h2><p>${S.discovered.length} / ${MAX} discovered · ${S.served} adoptions</p>
      <div class="book">${items}</div>${achListHTML()}<div class="actions"><button class="btn go" data-close>Close</button></div>`);
  }

  // ---------- upgrades (shared by Shop and Level-Up popup) ----------
  const canBuyUpg = (k) => !upgMaxed(k) && S.coins >= upgCost(k);
  const readyUpgCount = () => Object.keys(UPG).filter(canBuyUpg).length;

  function upgRow(k) {
    const u = UPG[k], boost = isBoost(k), maxed = upgMaxed(k), ok = canBuyUpg(k);
    const left = boost && S.boost[k] > 0 ? `<br><span class="boost-left" data-left="${k}">⏱ ${mmss(S.boost[k])} left</span>` : '';
    const lvl = boost ? '<span class="tag-boost">3 MIN</span>' : `<small>Lv ${S.upg[k]}</small>`;
    return `<div class="shop-item${ok ? ' ready' : ''}"><div class="ic" style="background:${u.bg}">${u.icon}</div>
      <div class="txt"><b>${u.name} ${lvl}${ok ? '<span class="tag-ready">Ready!</span>' : ''}</b><small>${maxed && !boost ? 'Maxed out!' : u.desc(S.upg[k])}${left}</small></div>
      <button class="btn ${maxed || !ok ? 'disabled' : ''}" data-up="${k}">${maxed ? 'MAX' : `<i class="coin sm"></i>${fmt(upgCost(k))}`}</button></div>`;
  }
  function upgRowsHTML() {
    const keys = Object.keys(UPG);
    return '<div class="upg-sec">Upgrades</div>' + keys.filter((k) => !isBoost(k)).map(upgRow).join('')
      + '<div class="upg-sec">Boosters</div>' + keys.filter(isBoost).map(upgRow).join('');
  }

  function upgSubText() {
    const n = readyUpgCount();
    return n ? `You can afford ${n} upgrade${n > 1 ? 's' : ''} right now!` : 'Possible upgrades — keep earning coins to buy them!';
  }

  // Buy one level of upgrade k. Returns true when bought. `el` is used for feedback effects.
  function buyUpg(k, el) {
    if (!UPG[k] || upgMaxed(k)) { SFX.bad(); if (el) shake(el); return false; }
    const c = upgCost(k);
    if (S.coins < c) { SFX.bad(); if (el) shake(el); return false; }
    S.coins -= c;
    if (isBoost(k)) { S.boost[k] += BOOST_ADD; S.stats.boosts++; SFX.fanfare(); toast(`${UPG[k].name} is on! ⏱ ${mmss(S.boost[k])}`); renderBoosts(); }
    else { S.upg[k]++; SFX.buy(); if (k === 'amerge' && S.upg.amerge === 1) setTimeout(() => startAM(), 300); }
    save();
    if (el) { const [x, y] = centerOf(el); sparks(x, y, 10); }
    tutEvent('upgrade');
    return true;
  }
  // Shift+click buys as many levels as you can afford, Ctrl/Cmd+click up to 10.
  function buyUpgMulti(k, el, e) {
    const n = e && e.shiftKey ? 999 : e && (e.ctrlKey || e.metaKey) ? 10 : 1;
    let bought = 0;
    while (bought < n && !upgMaxed(k) && S.coins >= upgCost(k)) { if (!buyUpg(k, bought ? null : el)) break; bought++; if (isBoost(k)) break; }
    if (!bought) buyUpg(k, el); // gives the "can't afford" feedback
    if (bought > 1) toast(`Bought ${bought} levels of ${UPG[k].name}!`);
    return bought;
  }
  function refreshUpgLists() {
    document.querySelectorAll('.upg-list').forEach((list) => {
      list.innerHTML = upgRowsHTML();
      const root = list.parentElement.closest('.card, #dockShop') || list.parentElement;
      const sub = root.querySelector('.lvl-up-sub'); if (sub) sub.textContent = upgSubText();
    });
    dockSig = '';
  }
  function bindUpgrades(root) {
    // one delegated listener per container, so re-rendered rows keep working
    if (root._upgBound) return;
    root._upgBound = true;
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-up]');
      if (!b || !root.contains(b)) return;
      if (buyUpgMulti(b.dataset.up, b, e)) { refreshUpgLists(); renderAll(); }
    });
  }

  function showShop() {
    openModal(`<h2>Shop</h2><div class="upg-list">${upgRowsHTML()}</div>
      <div class="actions"><button class="btn go" data-close>Close</button></div>
      <button class="reset">Reset progress</button>`, (root) => {
      bindUpgrades(root);
      root.querySelector('.reset').onclick = () => {
        if (confirm('Reset all progress? This cannot be undone.')) {
          S = fresh(); save(); closeModal(); lastAfford = null; renderAll(); refreshMenu();
        }
      };
    });
  }

  // Level-up gift: one free level of a random upgrade (or 3 min of a booster).
  function grantRandomUpgrade() {
    const pool = [];
    Object.keys(UPG).forEach((k) => {
      if (upgMaxed(k)) return;
      const w = k === 'egg' ? 1 : isBoost(k) ? 2 : 3;
      for (let i = 0; i < w; i++) pool.push(k);
    });
    if (!pool.length) return null;
    const k = pool[(Math.random() * pool.length) | 0];
    if (isBoost(k)) { S.boost[k] = Math.min(BOOST_MAX, S.boost[k] + BOOST_ADD); renderBoosts(); }
    else S.upg[k]++;
    dockSig = '';
    return k;
  }
  const giftLabel = (k) => isBoost(k) ? `${UPG[k].name} +3 min` : `${UPG[k].name} → Lv ${S.upg[k]}`;
  // slot-machine style reveal of the gifts inside the level-up popup
  function spinGifts(root, gifts) {
    const keys = Object.keys(UPG), name = root.querySelector('.gift-name');
    root.querySelectorAll('.gift-slot').forEach((slot, i) => {
      const k = gifts[i], stopAt = performance.now() + 1100 + i * 450;
      let n = 0;
      const spin = () => {
        if (!slot.isConnected) return;
        if (performance.now() < stopAt) {
          slot.innerHTML = UPG[keys[n++ % keys.length]].icon; slot.style.background = UPG[keys[(n - 1) % keys.length]].bg;
          if (n % 2) tone(900 + (n % 6) * 60, 0.03, 'square', 0.025);
          setTimeout(spin, 70);
          return;
        }
        slot.innerHTML = UPG[k].icon; slot.style.background = UPG[k].bg; slot.classList.add('landed');
        const [x, y] = centerOf(slot); sparks(x, y, 12);
        SFX.good();
        if (i === gifts.length - 1 && name) name.textContent = gifts.map(giftLabel).join(' · ');
      };
      spin();
    });
  }
  function showLevelUp(fromLv, toLv, bonus, gifts = []) {
    SFX.fanfare();
    const jumped = toLv - fromLv;
    openModal(() => `<div class="lvl-up">
      <div class="lvl-up-side">
        <div class="lvl-up-head"><div class="lvl-up-burst"><small>LV</small><b>${toLv}</b></div><h2>Level Up!</h2></div>
        <img class="lvl-up-hero" src="${HAPPY[Math.max(0, S.maxLevel - 1)]}" alt="">
        <p>${jumped > 1 ? `Amazing — you jumped ${jumped} levels!` : 'Your pet haven is growing.'}</p>
        <div class="card-center"><span class="lvl-up-bonus"><i class="coin sm"></i>+${fmt(bonus)} bonus</span></div>
        ${gifts.length ? `<div class="lvl-gift"><small>🎁 Free upgrade${gifts.length > 1 ? 's' : ''}!</small>
          <div class="gift-reel">${gifts.map((k, i) => `<span class="gift-slot" data-i="${i}">${UPG[k].icon}</span>`).join('')}</div>
          <b class="gift-name">Spinning…</b></div>` : ''}
      </div>
      <div class="lvl-up-main">
        <p class="lvl-up-sub">${upgSubText()}</p>
        <div class="upg-list">${upgRowsHTML()}</div>
      </div>
      <div class="actions"><button class="btn go" data-close>Continue</button></div>
    </div>`, (root) => { bindUpgrades(root); spinGifts(root, gifts); });
  }

  // ---------- core actions ----------
  function emptyCells() { const e = []; for (let i = 0; i < N; i++) if (S.open[i] && !S.grid[i]) e.push(i); return e; }

  function addCoins(v) { S.coins += v; S.stats.earned += v; }

  function addXP(v, x, y) {
    S.xp += v;
    if (x != null) floatText(x, y + 14, `+${fmt(v)} XP`, 'xp');
    const from = S.level;
    let bonus = 0;
    while (S.xp >= xpNeed(S.level)) {
      S.xp -= xpNeed(S.level); S.level++;
      bonus += Math.max(50, Math.round(totalIncome() * 30));
    }
    if (S.level > from) {
      addCoins(bonus);
      const gifts = [];
      for (let lv = from + 1; lv <= S.level; lv++) { const g = grantRandomUpgrade(); if (g) gifts.push(g); }
      showLevelUp(from, S.level, bonus, gifts);
      renderHUD(); save();
    }
    renderXP();
  }

  function spawn(level) {
    const e = emptyCells();
    if (!e.length) return false;
    const vis = e.filter(inView), pool = vis.length ? vis : e;
    const i = pool[(Math.random() * pool.length) | 0];
    if (!inView(i)) pingEdge(i);
    S.grid[i] = level; renderCell(i, true); SFX.pop();
    discover(level);
    renderOrders();
    return true;
  }

  function buyEgg() {
    const c = eggCost();
    if (!emptyCells().length) { SFX.bad(); shake($('#buyBtn')); toast('No free tiles — merge pets or unlock more tiles!'); return; }
    if (S.coins < c) { SFX.bad(); shake($('#buyBtn')); toast('Not enough coins yet!'); return; }
    S.coins -= c; S.bought++; spawn(spawnLevel()); SFX.buy(); renderHUD();
    tutEvent('buy');
  }

  function tryUnlock(i) {
    if (!buyable(i)) { SFX.bad(); shake(cells[i]); toast('Unlock the tiles next to your yard first!'); return; }
    const c = unlockCost();
    if (S.coins < c) { SFX.bad(); shake(cells[i]); toast(`You need ${fmt(c)} coins to unlock this tile.`); return; }
    S.coins -= c; S.open[i] = 1;
    lastAfford = null;
    renderLocked(); renderCell(i);
    cells[i].classList.add('unlocking');
    const [x, y] = centerOf(cells[i]); sparks(x, y, 14); SFX.unlock();
    addXP(3, x, y);
    renderHUD(); save();
    if (openCount() === N) toast('Your whole yard is unlocked!');
    tutEvent('unlock');
  }

  function discover(L) {
    if (S.discovered.includes(L)) return;
    S.discovered.push(L);
    S.maxLevel = Math.max(S.maxLevel, L);
    showDiscovery(L);
    save();
  }

  function merge(from, to) {
    const L = S.grid[from] + 1;
    S.grid[from] = 0; S.grid[to] = L;
    renderCell(from); renderCell(to, true);
    const vis = inView(to), [x, y] = centerOf(cells[to]);
    if (vis) { sparks(x, y, 18); mergeBurst(x, y, cells[to]); }
    SFX.merge(L);
    discover(L);
    addXP(L, vis ? x : null, y);
    S.stats.merges++;
    renderOrders(); renderHUD();
    tutEvent('merge');
  }

  function fulfill(from, k) {
    const o = S.orders[k];
    const reward = orderReward(o), L = o.level;
    S.grid[from] = 0; renderCell(from);
    addCoins(reward); S.served++;
    S.streak = (S.streak || 0) + 1; S.bestStreak = Math.max(S.bestStreak || 0, S.streak);
    const el = ordersEl.children[k], [x, y] = centerOf(el);
    const img = el.querySelector('.req-pet'), [ix, iy] = img ? centerOf(img) : [x, y];
    puff(ix, iy);                                   // the pet goes home in a puff of cloud
    floatText(x, y, '+' + fmt(reward), 'big'); sparks(x, y, 16); SFX.cash();
    coinShower(x, y, Math.min(14, 5 + L));          // coins fly from the family into the coin counter
    if (S.streak > 1) floatText(x, y - 36, `🔥 Streak ×${streakMul().toFixed(1)}`, 'praise');
    addXP(L * 4, x, y + 10);
    S.orders[k] = { until: Date.now() + LEAVE_MS + custGap(), done: L, paid: reward, cust: o.cust, t: Date.now() };
    renderOrders(); renderStreak(); renderHUD(); save();
    tutEvent('fulfill');
  }

  // Customers: a person walks up and asks for a pet. Most ask for one you already have, so each
  // visit is a quick decision — sell it to them now, or keep it for merging.
  const PATIENCE = 12, ARRIVE = 0.5, LEAVE_MS = 550;
  const patience = () => 10 + Math.random() * 5; // each customer waits 10–15 s
  const custGap = () => 1200 + Math.random() * 1300;   // empty counter before the next customer
  function newOrder() {
    const onBoard = [...new Set(S.grid.filter((L, i) => L && S.open[i]))];
    let level;
    if (onBoard.length && Math.random() < 0.75) level = onBoard[(Math.random() * onBoard.length) | 0];
    else {
      const known = S.discovered.filter((L) => L >= spawnLevel());
      level = known.length ? known[(Math.random() * known.length) | 0] : spawnLevel();
    }
    const reward = Math.round(income(level) * (40 + Math.random() * 30) + 25);
    const dur = patience();
    return { level, reward, dur, left: dur + ARRIVE, cust: (Math.random() * CUSTOMER_LOOKS) | 0, t: Date.now() };
  }


  // ---------- drag & drop ----------
  let drag = null;
  function targetAt(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const c = el.closest('.cell'); if (c) return { kind: 'cell', el: c, i: +c.dataset.i };
    const o = el.closest('.order'); if (o) return { kind: 'order', el: o, k: +o.dataset.k };
    const s = el.closest('#sell'); if (s) return { kind: 'sell', el: s };
    return null;
  }
  function clearOver() { document.querySelectorAll('.over').forEach((e) => e.classList.remove('over')); }

  board.addEventListener('pointerdown', (e) => {
    const c = e.target.closest('.cell');
    if (!c || drag || panning || e.button !== 0) return;
    const i = +c.dataset.i;
    if (!S.open[i] || !S.grid[i]) return; // empty grass / fences: handled by the pan code (tap = unlock)
    if (amBusy && amBusy.includes(i)) return; // this pet is flying to its twin
    e.preventDefault();
    drag = { i, x0: e.clientX, y0: e.clientY, moved: false, ghost: null, id: e.pointerId };
  });

  window.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) {
      drag.moved = true;
      const L = S.grid[drag.i], size = cells[drag.i].getBoundingClientRect().width;
      const g = new Image(); g.id = 'ghost'; g.src = IMGS[L - 1];
      g.style.width = g.style.height = size + 'px';
      document.body.appendChild(g); drag.ghost = g;
      cells[drag.i].classList.add('dragging');
      armSell(L); tutEl.classList.add('dragging');
      S.grid.forEach((l, j) => { if (j !== drag.i && S.open[j] && l === L && L < MAX) cells[j].classList.add('match'); });
    }
    if (drag.moved) {
      drag.lx = e.clientX; drag.ly = e.clientY;
      drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px';
      clearOver();
      const t = targetAt(e.clientX, e.clientY);
      if (t && !(t.kind === 'cell' && (t.i === drag.i || !S.open[t.i]))) t.el.classList.add('over');
      const overSell = !!t && t.kind === 'sell';
      if (overSell !== !!drag.overSell) { drag.overSell = overSell; if (overSell) SFX.hover(); }
    }
  });

  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    clearOver(); disarmSell(); tutEl.classList.remove('dragging');
    document.querySelectorAll('.match').forEach((c) => c.classList.remove('match'));
    if (!d.moved) { tapPet(d.i); return; }
    cells[d.i].classList.remove('dragging');
    const t = e.type === 'pointercancel' ? null : targetAt(e.clientX, e.clientY), L = S.grid[d.i];
    if (t && t.kind === 'sell') { sellPet(d.i, t.el, d.ghost); save(); return; }
    d.ghost.remove();
    if (!t) return;
    if (t.kind === 'cell') {
      const j = t.i;
      if (j === d.i) return;
      if (!S.open[j]) { SFX.bad(); shake(cells[j]); return; }
      if (!S.grid[j]) { S.grid[j] = L; S.grid[d.i] = 0; renderCell(d.i); renderCell(j, true); SFX.pop(); }
      else if (S.grid[j] === L && L < MAX) merge(d.i, j);
      else { S.grid[d.i] = S.grid[j]; S.grid[j] = L; renderCell(d.i, true); renderCell(j, true); SFX.pop(); }
      renderOrders();
    } else if (t.kind === 'order') {
      const o = S.orders[t.k];
      if (o && o.level === L) fulfill(d.i, t.k);
      else { SFX.bad(); shake(t.el); if (o && o.level) toast(`This family wants a ${S.discovered.includes(o.level) ? PETS[o.level - 1].name : 'pet you have not discovered yet'}!`); }
    }
    save();
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  function tapPet(i) {
    const L = S.grid[i]; if (!L) return;
    const c = cells[i], [x, y] = centerOf(c);
    lastPlay = performance.now();
    showMood(c.querySelector('.pet'), L, HAPPY, 650); // a quick smile on every pat
    if (wish && wish.i === i && wish.L === L) {
      // the pet asked for cuddles: big happy reward
      const v = wishReward(L);
      clearWish(true);
      addCoins(v);
      c.classList.remove('tap', 'joy'); void c.offsetWidth; c.classList.add('joy');
      showMood(c.querySelector('.pet'), L, HAPPY, 1500);
      floatText(x, y - 26, '+' + fmt(v), 'big'); floatText(x, y - 58, `${PETS[L - 1].name} is so happy! 💖`, 'bye');
      emojiBurst(x, y - 10, ['💖', '💕', '✨', '😊'], 8); sparks(x, y, 12);
      coinShower(x, y, Math.min(10, 4 + L));
      SFX.happy(); addXP(1, x, y);
      S.stats.cuddles++;
      renderHUD(); save();
      tutEvent('tap'); tutEvent('cuddle');
      return;
    }
    c.classList.remove('tap'); void c.offsetWidth; c.classList.add('tap');
    const v = income(L) * rushMul(); addCoins(v);
    S.stats.taps++;
    floatText(x, y - 20, '+' + fmt(v)); SFX.tap(); renderHUD();
    tutEvent('tap');
  }

  // Swap a pet picture to another face (blink / happy) for a moment, then back.
  function showMood(img, L, set, ms) {
    if (!img || !L) return;
    img.src = set[L - 1];
    clearTimeout(img._moodT);
    img._moodT = setTimeout(() => { if (img.src === set[L - 1]) img.src = IMGS[L - 1]; }, ms);
  }

  // ---------- pets ask for cuddles when the player is idle ----------
  let wish = null, wishCooldown = 0, lastPlay = performance.now();
  const wishReward = (L) => Math.max(10, Math.round(income(L) * 20 * (1 + 0.5 * S.upg.cuddle)));
  function clearWish(done) {
    if (!wish) return;
    const c = cells[wish.i]; if (c) c.classList.remove('wish');
    wish = null;
    wishCooldown = performance.now() + (done ? 9000 : 14000);
  }
  function wishTick() {
    const now = performance.now();
    if (wish) {
      if (S.grid[wish.i] !== wish.L || now > wish.until) clearWish(false);
      return;
    }
    if (tut || now < wishCooldown || now - lastPlay < 6000 || !modal.classList.contains('hidden')) return;
    const pets = []; for (let i = 0; i < N; i++) if (S.open[i] && S.grid[i] && inView(i)) pets.push(i);
    if (!pets.length) return;
    const i = pets[(Math.random() * pets.length) | 0], L = S.grid[i];
    wish = { i, L, until: now + 12000 };
    cells[i].classList.add('wish');
    SFX.wish();
    toast(`${PETS[L - 1].name} wants cuddles! Tap it for +${fmt(wishReward(L))} coins 💖`);
  }
  window.addEventListener('pointerdown', () => { lastPlay = performance.now(); }, true);

  // ---------- buttons ----------
  $('#buyBtn').addEventListener('click', buyEgg);
  $('#shopBtn').addEventListener('click', showShop);
  $('#bookBtn').addEventListener('click', showBook);
  ['#musicBtn', '#menuMusic', '#pauseMusic'].forEach((s) => $(s).addEventListener('click', toggleMusic));
  function toggleSound() { S.sound = !S.sound; renderHUD(); save(); if (S.sound) SFX.pop(); }
  $('#soundBtn').addEventListener('click', toggleSound);

  // ---------- main menu / pause screen ----------
  const mainMenu = $('#mainMenu'), pauseScreen = $('#pauseScreen'), ngConfirm = $('#newGameConfirm');
  const isOn = (el) => el.classList.contains('active');
  function showLayer(el, on) { el.classList.toggle('active', on); el.setAttribute('aria-hidden', on ? 'false' : 'true'); }

  function cancelDrag() {
    if (!drag) return;
    if (drag.ghost) drag.ghost.remove();
    cells[drag.i].classList.remove('dragging');
    document.querySelectorAll('.match').forEach((c) => c.classList.remove('match'));
    clearOver(); disarmSell(); tutEl.classList.remove('dragging'); drag = null;
  }

  function hideAllModals() { modalQueue.length = 0; modal.classList.add('hidden'); }

  function refreshMenu() {
    $('#menuContinue').classList.toggle('is-disabled', !hasSave);
    $('#menuSave').textContent = hasSave
      ? `Saved game · Level ${S.level} · ${S.discovered.length}/${MAX} pets found`
      : 'No saved game yet — start a new adventure!';
    // Show pets around a bigger "hero" pet (best pet discovered, or a starter lineup)
    const row = $('#menuPets'); row.innerHTML = '';
    const hero = hasSave ? S.maxLevel : 3;
    const start = Math.min(Math.max(hero - 2, 1), MAX - 4);
    [0, 1, 2, 3, 4].map((d) => start + d).forEach((lv, idx) => {
      const known = !hasSave || S.discovered.includes(lv);
      // Use the pre-rendered PNGs (as the board does): large live canvases can fail to draw in Android WebView
      const cv = new Image(); cv.src = IMGS[lv - 1]; cv.alt = ''; cv.draggable = false;
      if (lv === hero) cv.className = 'hero-pet';
      if (!known) cv.style.filter = 'brightness(0) opacity(.2)';
      cv.style.animationDelay = `${idx * 0.15}s`;
      row.appendChild(cv);
    });
    renderHUD();
  }

  function openMainMenu() {
    cancelDrag(); save();
    stopTutorial(); hideUndo();
    paused = true;
    hideAllModals();
    showLayer(pauseScreen, false); showLayer(ngConfirm, false);
    refreshMenu();
    showLayer(mainMenu, true);
  }

  function offlineEarnings() {
    const away = Math.min(7200, (Date.now() - S.last) / 1000);
    if (away <= 60 || totalIncome() <= 0) return;
    const earned = Math.floor(totalIncome() * away * 0.5);
    addCoins(earned);
    openModal(`<h2>Welcome back!</h2><img class="hero" src="${IMGS[S.maxLevel - 1]}" alt="">
      <p>Your pets earned <b style="color:var(--ink)">${fmt(earned)}</b> coins while you were away.</p>
      <div class="actions"><button class="btn go" data-close>Collect</button></div>`);
  }

  function startGame(isNew) {
    if (isNew) { S = fresh(); lastAfford = null; }
    started = true; paused = false;
    stopTutorial(); hideUndo(); clearWish(false); lastPlay = performance.now();
    hideAllModals();
    showLayer(ngConfirm, false); showLayer(mainMenu, false);
    renderAll(); centerOnYard();
    if (!isNew) offlineEarnings();
    // Level-1 players who haven't finished the tutorial get the guided tour
    if (!S.tutDone && S.level === 1) setTimeout(() => { if (!paused && !tut && !S.tutDone) startTutorial(false); }, 650);
    renderHUD(); save();
    lastFrame = performance.now(); acc = 0;
    SFX.buy();
  }

  function pauseGame(quiet) {
    if (!started || paused) return;
    cancelDrag();
    paused = true; save();
    $('#pausePetImg').src = IMGS[Math.max(0, S.maxLevel - 1)];
    $('#pauseStats').innerHTML = `<span>LV ${S.level}</span><span><i class="coin sm"></i>${fmt(S.coins)}</span>
      <span>${fmt(totalIncome())}/s</span><span>🐾 ${S.discovered.length}/${MAX}</span>`;
    renderHUD();
    showLayer(pauseScreen, true);
    if (!quiet) SFX.pop();
  }

  function resumeGame() {
    showLayer(pauseScreen, false);
    paused = false; lastFrame = performance.now();
    SFX.tap();
  }

  $('#pauseBtn').addEventListener('click', () => pauseGame());
  $('#pauseResume').addEventListener('click', resumeGame);
  $('#pauseMenu').addEventListener('click', () => { SFX.tap(); openMainMenu(); });
  $('#pauseHelp').addEventListener('click', () => {
    resumeGame(); stopTutorial();
    startTutorial(S.tutDone); // replay from the pause menu (no tutorial gifts the second time)
  });
  $('#menuContinue').addEventListener('click', () => { if (hasSave) startGame(false); });
  $('#menuNew').addEventListener('click', () => {
    if (hasSave) { SFX.pop(); showLayer(ngConfirm, true); } else startGame(true);
  });
  $('#newGameYes').addEventListener('click', () => startGame(true));
  $('#newGameNo').addEventListener('click', () => { SFX.tap(); showLayer(ngConfirm, false); });
  ngConfirm.addEventListener('click', (e) => { if (e.target === ngConfirm) showLayer(ngConfirm, false); });
  $('#menuExit').addEventListener('click', () => openExitModal());
  $('#pauseExit').addEventListener('click', () => openExitModal());

  // ---------- exit confirmation modal ("Leave the Tab" & "Stay") ----------
  const exitModal = $('#gameExitModal');
  const confirmExitBtn = $('#btnConfirmExit');
  const cancelExitBtn = $('#btnCancelExit');
  const exitModalPetImg = $('#exitModalPetImg');

  function openExitModal() {
    SFX.pop();
    if (exitModalPetImg) {
      const petIndex = Math.min(Math.max(0, S.maxLevel - 1), IMGS.length - 1);
      exitModalPetImg.src = IMGS[petIndex] || IMGS[2]; // Default to Kitten Puff or highest pet
    }
    if (exitModal) exitModal.classList.add('active');
  }

  function closeExitModal() {
    SFX.tap();
    if (exitModal) exitModal.classList.remove('active');
  }

  function doLeaveTab() {
    SFX.bad();
    save();

    // 0. Steam desktop app or Android app: close natively
    if (Platform.exit()) return;

    // 1. If inside an iframe (e.g. a games portal modal), notify parent window
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ action: 'closeModal', type: 'GAME_ENDED' }, '*');
        window.parent.postMessage('closeModal', '*');
      }
    } catch (e) {}

    // 2. Try window.close()
    try { window.close(); } catch (e) {}

    // 3. Fallback: browser history or back to game portal root
    setTimeout(() => {
      if (window.history && window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '../';
      }
    }, 120);
  }

  if (cancelExitBtn) cancelExitBtn.addEventListener('click', closeExitModal);
  if (confirmExitBtn) confirmExitBtn.addEventListener('click', doLeaveTab);
  if (exitModal) {
    exitModal.addEventListener('click', (e) => {
      if (e.target === exitModal) closeExitModal();
    });
  }

  // Android app sent to background (called from the native wrapper before the WebView pauses)
  window.onAndroidPause = () => { save(); pauseGame(true); MUSIC.stop(); };

  // Android hardware/gesture back button (called from the native wrapper)
  window.onAndroidBack = () => {
    if (exitModal && isOn(exitModal)) { closeExitModal(); return; }
    if (isOn(ngConfirm)) { showLayer(ngConfirm, false); return; }
    if (isOn(mainMenu)) { openExitModal(); return; }
    if (!modal.classList.contains('hidden')) { closeModal(); return; }
    if (isOn(pauseScreen)) { resumeGame(); return; }
    pauseGame();
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (exitModal && isOn(exitModal)) { closeExitModal(); return; }
      if (isOn(ngConfirm)) { showLayer(ngConfirm, false); return; }
      if (isOn(mainMenu)) return;
      if (!modal.classList.contains('hidden')) { closeModal(); return; }
      if (isOn(pauseScreen)) { resumeGame(); return; }
      pauseGame();
      return;
    }
    if (paused || !modal.classList.contains('hidden') || (exitModal && isOn(exitModal))) return;
    if (e.code === 'Space') { e.preventDefault(); buyEgg(); }
  });

  // ---------- ciel games loading screen & art generation ----------
  function initLoadingScreen() {
    const loadingScreen = $('#ciel-loading-screen');
    const heroCanvas = $('#loading-hero-canvas');
    const petsRow = $('#loading-pets-row');
    const progressBar = $('#ciel-progress-bar');
    const statusText = $('#ciel-loading-status');
    const percentText = $('#ciel-loading-percent');

    // 1. Procedural art generation for loading hero banner
    if (typeof renderLoadingHero === 'function' && heroCanvas) {
      try {
        renderLoadingHero(heroCanvas);
      } catch (err) {
        console.warn('Hero canvas render:', err);
      }
    }

    // 2. Procedural mini pets row generation
    if (petsRow && typeof renderPet === 'function') {
      petsRow.innerHTML = '';
      [1, 2, 3, 4, 5].forEach((lv, idx) => {
        try {
          const miniCv = renderPet(lv, 76);
          miniCv.className = 'mini-loader-pet';
          miniCv.style.animationDelay = `${idx * 0.16}s`;
          miniCv.title = PETS[lv - 1]?.name || 'Cute Pet';
          petsRow.appendChild(miniCv);
        } catch (e) {}
      });
    }

    // 3. Smooth animated loading sequence
    let currentPct = 0;
    const stages = [
      { at: 20, text: 'Waking up baby pets...' },
      { at: 50, text: 'Gathering pet treats & cushions...' },
      { at: 75, text: 'Preparing Adoption Haven...' },
      { at: 95, text: 'Finalizing cuddles & toys...' },
      { at: 100, text: 'Welcome to Pet Merge Haven!' }
    ];

    const timer = setInterval(() => {
      // Advance progress smoothly
      const inc = Math.floor(Math.random() * 8) + 4;
      currentPct = Math.min(100, currentPct + inc);

      if (progressBar) progressBar.style.width = `${currentPct}%`;
      if (percentText) percentText.textContent = `${currentPct}%`;

      const curStage = stages.find((s) => currentPct <= s.at) || stages[stages.length - 1];
      if (statusText) statusText.textContent = curStage.text;

      if (currentPct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
              loadingScreen.style.display = 'none';
            }, 450);
          }
        }, 300);
      }
    }, 45);
  }

  // ---------- selling: interactive bin, flying coins, undo ----------
  const sellEl = $('#sell'), sellLbl = sellEl.querySelector('.sell-lbl'), coinPill = $('.pill.coins');
  function armSell(L) { sellEl.classList.add('armed'); sellLbl.innerHTML = `<i class="coin sm"></i>+${fmt(sellValue(L))}`; }
  function disarmSell() { sellEl.classList.remove('armed'); sellLbl.textContent = 'Sell'; }

  function emojiBurst(x, y, list, n) {
    for (let k = 0; k < n; k++) {
      const d = document.createElement('div');
      d.className = 'emo'; d.textContent = list[k % list.length];
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, r = 50 + Math.random() * 60;
      d.style.left = x + 'px'; d.style.top = y + 'px';
      d.style.setProperty('--dx', Math.cos(a) * r + 'px'); d.style.setProperty('--dy', Math.sin(a) * r + 'px');
      d.style.setProperty('--rot', (Math.random() * 60 - 30).toFixed(0) + 'deg');
      d.style.animationDelay = (k * 0.04).toFixed(2) + 's';
      fx.appendChild(d); setTimeout(() => d.remove(), 1400);
    }
  }

  // Coins burst out of (x, y) and fly into the coin counter, ticking as they land.
  function coinShower(x, y, n) {
    const [tx, ty] = centerOf(coinPill.querySelector('.coin'));
    for (let k = 0; k < n; k++) {
      const c = document.createElement('i');
      c.className = 'coin fly-coin';
      fx.appendChild(c);
      const a = Math.random() * Math.PI * 2, r = 30 + Math.random() * 45;
      const mx = x + Math.cos(a) * r, my = y + Math.sin(a) * r - 25;
      if (!c.animate) { setTimeout(() => c.remove(), 50); continue; }
      const anim = c.animate([
        { transform: `translate(${x}px, ${y}px) scale(.3)`, opacity: 0 },
        { transform: `translate(${mx}px, ${my}px) scale(1.1)`, opacity: 1, offset: 0.35, easing: 'cubic-bezier(.5,0,.75,0)' },
        { transform: `translate(${tx}px, ${ty}px) scale(.7)`, opacity: 1 },
      ], { duration: 650 + k * 45, easing: 'ease-out', fill: 'forwards' });
      anim.onfinish = () => {
        c.remove(); SFX.coin(k);
        coinPill.classList.remove('bump'); void coinPill.offsetWidth; coinPill.classList.add('bump');
      };
    }
  }

  function sellPet(i, bin, ghost) {
    const L = S.grid[i], v = sellValue(L);
    S.grid[i] = 0; renderCell(i); addCoins(v);
    renderOrders(); renderHUD();
    const [bx, by] = centerOf(bin);
    // the pet does a little flip into the bin
    let delay = 0;
    if (ghost && ghost.animate) {
      const gx = parseFloat(ghost.style.left) || bx, gy = parseFloat(ghost.style.top) || by;
      delay = 380;
      ghost.animate([
        { left: gx + 'px', top: gy + 'px', transform: 'translate(-50%,-60%) scale(1.15) rotate(0deg)', opacity: 1 },
        { left: (gx + bx) / 2 + 'px', top: Math.min(gy, by) - 50 + 'px', transform: 'translate(-50%,-60%) scale(.9) rotate(200deg)', opacity: 1, offset: 0.45 },
        { left: bx + 'px', top: by + 'px', transform: 'translate(-50%,-50%) scale(.1) rotate(360deg)', opacity: 0.3 },
      ], { duration: delay, easing: 'ease-in', fill: 'forwards' }).onfinish = () => ghost.remove();
    } else if (ghost) ghost.remove();
    SFX.sell();
    setTimeout(() => {
      bin.classList.remove('gulp'); void bin.offsetWidth; bin.classList.add('gulp');
      sparks(bx, by, 16);
      emojiBurst(bx, by - 10, ['💖', '✨', '⭐', '💛'], 7);
      floatText(bx, by - 40, '+' + fmt(v), 'big');
      const tx = Math.max(120, Math.min(innerWidth - 120, bx)); // keep the long text on screen
      floatText(tx, by - 70, `Bye-bye, ${PETS[L - 1].name}! 👋`, 'bye');
      coinShower(bx, by, Math.min(12, 4 + L));
    }, delay);
    if (!tut) showUndo(i, L, v);
    S.stats.sells++;
    tutEvent('sell');
  }

  let undoInfo = null, undoT;
  const undoEl = $('#undoSell');
  function showUndo(i, L, v) {
    undoInfo = { i, L, v };
    undoEl.innerHTML = `<img src="${IMGS[L - 1]}" alt=""><span>Sold!</span><button type="button">↶ Undo</button>`;
    undoEl.classList.add('show');
    clearTimeout(undoT); undoT = setTimeout(hideUndo, 4000);
  }
  function hideUndo() { undoInfo = null; undoEl.classList.remove('show'); }
  undoEl.addEventListener('click', (e) => {
    if (!e.target.closest('button') || !undoInfo || paused) return;
    const { i, L, v } = undoInfo; hideUndo();
    if (S.coins < v) { SFX.bad(); toast('Those coins are already spent!'); return; }
    const j = S.open[i] && !S.grid[i] ? i : emptyCells()[0];
    if (j == null) { SFX.bad(); toast('No free tile to bring your pet back!'); return; }
    S.coins -= v; S.grid[j] = L; renderCell(j, true);
    S.stats.undos++; tutEvent('undo');
    const [x, y] = centerOf(cells[j]); sparks(x, y, 12); emojiBurst(x, y, ['💖'], 4);
    SFX.unlock(); renderOrders(); renderHUD(); save();
  });

  // ---------- guided tutorial (level 1) ----------
  // A hand shows each move; the step waits until the player does it. Everything outside the
  // highlighted area is blocked, so younger players can't get lost.
  let tut = null;
  const tutEl = $('#tut'), tutSpot = tutEl.querySelector('.tut-spot'), tutBlocks = [...tutEl.querySelectorAll('.tut-block')];
  const tutHand = tutEl.querySelector('.tut-hand'), tutHandPet = tutEl.querySelector('.tut-pet');
  const tutBubble = tutEl.querySelector('.tut-bubble');
  const pimg = (L) => `<img src="${IMGS[Math.max(1, Math.min(MAX, L)) - 1]}" alt="">`;
  const op = (t) => `<span class="op">${t}</span>`;
  const COIN_I = '<i class="coin"></i>';
  const petCells = () => { const a = []; for (let i = 0; i < N; i++) if (S.open[i] && S.grid[i]) a.push(i); return a; };
  const byLevel = (dir) => petCells().sort((a, b) => dir * (S.grid[a] - S.grid[b]))[0];
  function findPair() {
    const seen = {};
    for (const i of petCells().sort((a, b) => S.grid[a] - S.grid[b])) {
      const L = S.grid[i];
      if (L >= MAX) continue;
      if (seen[L] != null) return [seen[L], i];
      seen[L] = i;
    }
    return null;
  }
  function placePet(L) { const e = emptyCells(); if (!e.length) return false; S.grid[e[0]] = L; renderCell(e[0], true); discover(L); return true; }
  function ensurePet() { return petCells().length > 0 || placePet(spawnLevel()); }
  function gift(amount) {
    if (amount <= 0) return true;
    if (tut.replay) return false;
    addCoins(amount); renderHUD();
    const [x, y] = centerOf(coinPill); floatText(x, y - 24, '🎁 +' + fmt(amount), 'big');
    return true;
  }

  const TUT = [
    {
      icons: () => pimg(1) + pimg(2) + pimg(3),
      title: 'Welcome to Pet Merge Haven!',
      text: 'Let\'s learn how to play together. Just follow the hand 👆',
      next: 'Let\'s go!',
    },
    {
      wait: 'merge',
      prep() {
        if (!findPair()) { placePet(1); placePet(1); }
        const p = findPair(); if (!p) return false;
        this.L = S.grid[p[0]];
      },
      icons() { return pimg(this.L) + op('+') + pimg(this.L) + op('=') + pimg(this.L + 1); },
      title: 'Merge pets!',
      text: 'Drag a pet onto the same pet to make a brand-new pet.',
      view() {
        const p = findPair(); if (!p) return {};
        return { hole: [cells[p[0]], cells[p[1]]], hand: { mode: 'drag', from: cells[p[0]], to: cells[p[1]], pet: S.grid[p[0]] } };
      },
    },
    {
      wait: 'tap', need: 3,
      prep() { if (!ensurePet()) return false; },
      icons: () => pimg(byLevel(-1) != null ? S.grid[byLevel(-1)] : 1) + op('👆') + op('=') + COIN_I,
      title: 'Tap for coins!',
      text: 'Tap your pet to collect coins. Pets also earn coins all by themselves!',
      view() { const i = byLevel(-1); return i == null ? {} : { hole: [cells[i]], hand: { mode: 'tap', from: cells[i] } }; },
    },
    {
      wait: 'buy',
      prep() {
        if (!emptyCells().length) return false;
        if (S.coins < eggCost() && !gift(eggCost() - S.coins)) return false;
      },
      icons: () => COIN_I + op('→') + '🥚' + op('→') + pimg(spawnLevel()),
      title: 'Buy an egg',
      text: 'Tap the green button to buy an egg. A baby pet hatches on your yard!',
      view: () => ({ hole: [$('#buyBtn')], hand: { mode: 'tap', from: $('#buyBtn') } }),
    },
    {
      wait: 'hatch',
      prep() {
        if (!emptyCells().length) return false;
        tut.hatchOn = true;
        S.hatchT = Math.max(S.hatchT, hatchInterval() - 3); // don't keep them waiting long
      },
      icons: () => '⏳' + op('→') + '🥚' + op('→') + pimg(spawnLevel()),
      title: 'Free eggs!',
      text: 'When this yellow bar fills up, you get a free egg. Watch it fill!',
      view: () => ({ hole: [$('#hatch')] }),
    },
    {
      wait: 'fulfill',
      prep() {
        if (!ensurePet()) return false;
        const L = S.grid[byLevel(-1)];
        this.L = L;
        S.orders[0] = { level: L, reward: Math.round(income(L) * 40 + 25), dur: 90, left: 90, cust: 3, t: Date.now() - 1000 };
        renderOrders();
      },
      icons() { return pimg(this.L) + op('→') + '🏡' + op('=') + COIN_I + COIN_I; },
      title: 'Adopt a pet',
      text: 'Customers come to adopt pets! Drag the pet they ask for onto their card before they leave.',
      view() {
        const i = petCells().find((j) => S.grid[j] === this.L), card = ordersEl.children[0];
        return i == null || !card ? {} : { hole: [cells[i], card], hand: { mode: 'drag', from: cells[i], to: card, pet: this.L } };
      },
    },
    {
      wait: 'sell',
      prep() { if (!ensurePet()) return false; this.L = S.grid[byLevel(1)]; },
      icons() { return pimg(this.L) + op('→') + '🗑️' + op('=') + COIN_I; },
      title: 'Sell a pet',
      text: 'Need more space? Drag a pet into the pink bin to sell it for coins.',
      view() {
        const i = byLevel(1);
        return i == null ? {} : { hole: [cells[i], sellEl], hand: { mode: 'drag', from: cells[i], to: sellEl, pet: S.grid[i] } };
      },
    },
    {
      wait: 'unlock',
      prep() {
        const i = [...Array(N).keys()].find(buyable);
        if (i == null) return false;
        if (S.coins < unlockCost() && !gift(unlockCost() - S.coins)) return false;
        this.i = i;
      },
      icons: () => '🔒' + op('→') + '🔓' + op('=') + '🌱',
      title: 'Grow your yard',
      text: 'Tap a wooden tile to unlock more room for your pets.',
      view() {
        const i = S.open[this.i] ? [...Array(N).keys()].find(buyable) : this.i;
        return i == null ? {} : { hole: [cells[i]], hand: { mode: 'tap', from: cells[i] } };
      },
    },
    {
      icons: () => ['egg', 'charm', 'cuddle', 'auto'].map((k) => `<span class="tut-ic" style="background:${UPG[k].bg}">${UPG[k].icon}</span>`).join(''),
      title: 'Shop upgrades',
      text: 'Spend coins in the Shop on upgrades and 3-minute boosters like Auto Petter!',
      view: () => ({ hole: [$('#shopBtn')], hand: { mode: 'tap', from: $('#shopBtn') } }),
    },
    {
      icons: () => '⭐' + op('→') + `<span class="lv-ic"><small>LV</small>${S.level + 1}</span>` + op('=') + '🎁',
      title: 'Level up',
      text: 'Merging, adopting and unlocking give you XP. Fill the green bar to level up and get a bonus!',
      view: () => ({ hole: [$('.lvl-badge'), $('#xpBar')] }),
    },
    {
      icons: () => '📖' + op('·') + '⏸️' + op('·') + '🔊' + op('·') + '🎵',
      title: 'Handy buttons',
      text: 'Up here you can see every pet you found, pause the game, and turn sounds or music on and off.',
      view: () => ({ hole: [$('#pauseBtn'), $('.top-btns')] }),
    },
    {
      icons: () => '🎉' + pimg(Math.max(2, S.maxLevel)) + '🎉',
      title: 'You\'re ready!',
      text: '',
      next: 'Play!',
    },
  ];

  function startTutorial(replay) {
    tut = { k: 0, replay: !!replay, hatchOn: false, count: 0, lock: false, act: false, sig: '', anims: [] };
    TUT[TUT.length - 1].text = replay
      ? 'Have fun growing your pet haven!'
      : 'Here\'s a gift of 100 coins to start. Have fun growing your pet haven!';
    tutEl.classList.add('on');
    tutGo(0);
  }

  function stopTutorial() {
    if (!tut) return;
    tut.anims.forEach((a) => a.cancel());
    tutEl.classList.remove('on', 'away');
    tut = null;
  }

  function finishTutorial(completed) {
    if (!tut) return;
    const replay = tut.replay;
    stopTutorial();
    S.tutDone = true;
    if (completed) {
      SFX.fanfare();
      for (let k = 0; k < 4; k++) setTimeout(() => sparks(innerWidth * (0.2 + 0.2 * k), innerHeight * 0.4, 18), k * 120);
      emojiBurst(innerWidth / 2, innerHeight / 2, ['🎉', '⭐', '💖', '🐾'], 10);
      if (!replay) { addCoins(100); coinShower(innerWidth / 2, innerHeight / 2, 10); }
    } else toast('You can replay the tutorial from the Pause menu ⏸️');
    renderHUD(); save();
  }

  function tutGo(k) {
    const st = TUT[k];
    tut.k = k; tut.count = 0; tut.lock = false; tut.hatchOn = false;
    // A step the yard can't support right now (e.g. no space) becomes a "look" step with Next.
    tut.act = !!st.wait && !(st.prep && st.prep() === false);
    tutBubble.querySelector('.tut-icons').innerHTML = st.icons();
    tutBubble.querySelector('.tut-text').textContent = st.text;
    tutBubble.querySelector('.tut-next').textContent = st.next || (k === TUT.length - 1 ? 'Done' : 'Next ›');
    tutBubble.querySelector('.tut-dots').innerHTML = TUT.map((_, j) => `<i class="${j < k ? 'done' : j === k ? 'on' : ''}"></i>`).join('');
    tutBubble.classList.toggle('act', tut.act);
    tutBubble.querySelector('.tut-skip').style.display = k === TUT.length - 1 ? 'none' : '';
    tutTitle();
    tut.sig = '';
    tutLayout();
    tutBubble.classList.remove('bounce'); void tutBubble.offsetWidth; tutBubble.classList.add('bounce');
  }
  function tutTitle() {
    const st = TUT[tut.k];
    tutBubble.querySelector('.tut-title').textContent = st.title + (tut.act && st.need ? ` (${tut.count}/${st.need})` : '');
  }

  function tutOnEvent(ev) {
    const st = TUT[tut.k];
    if (!tut.act || tut.lock || ev !== st.wait) return;
    tut.count++;
    tutTitle();
    if (st.need && tut.count < st.need) return;
    tut.lock = true;
    const words = ['Great job!', 'Awesome!', 'Super!', 'Well done!', 'Yay!'];
    setTimeout(() => {
      if (!tut) return;
      SFX.good();
      const r = tutBubble.getBoundingClientRect();
      floatText(r.left + r.width / 2, r.top + 10, words[tut.k % words.length], 'praise');
      tut.hatchOn = false;
      setTimeout(() => tut && tutGo(tut.k + 1), 650);
    }, 350);
  }

  tutBubble.querySelector('.tut-next').addEventListener('click', () => {
    if (!tut) return;
    SFX.tap();
    if (tut.k >= TUT.length - 1) finishTutorial(true); else tutGo(tut.k + 1);
  });
  tutBubble.querySelector('.tut-skip').addEventListener('click', () => finishTutorial(false));
  tutBlocks.forEach((b) => b.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    tutBubble.classList.remove('bounce'); void tutBubble.offsetWidth; tutBubble.classList.add('bounce');
  }));

  function tutLayout() {
    const st = TUT[tut.k];
    const v = (st.view && st.view.call(st)) || {};
    const W = innerWidth, H = innerHeight;
    let r = null;
    (v.hole || []).filter(Boolean).forEach((el) => {
      const b = el.getBoundingClientRect();
      r = r ? { l: Math.min(r.l, b.left), t: Math.min(r.t, b.top), r: Math.max(r.r, b.right), b: Math.max(r.b, b.bottom) }
        : { l: b.left, t: b.top, r: b.right, b: b.bottom };
    });
    if (r) { const p = 6; r = { l: Math.max(0, r.l - p), t: Math.max(0, r.t - p), r: Math.min(W, r.r + p), b: Math.min(H, r.b + p) }; }
    const h = v.hand ? { mode: v.hand.mode, pet: v.hand.pet, a: centerOf(v.hand.from), b: v.hand.to ? centerOf(v.hand.to) : null } : null;
    const sig = JSON.stringify([W, H, r && [r.l, r.t, r.r, r.b].map(Math.round), h && [h.mode, h.pet, h.a.map(Math.round), h.b && h.b.map(Math.round)], tut.k]);
    if (sig === tut.sig) return;
    tut.sig = sig;

    // spotlight + click blockers around it
    const set = (el, l, t, w, hh) => { el.style.left = l + 'px'; el.style.top = t + 'px'; el.style.width = Math.max(0, w) + 'px'; el.style.height = Math.max(0, hh) + 'px'; };
    tutSpot.classList.toggle('none', !r);
    if (r) {
      set(tutSpot, r.l, r.t, r.r - r.l, r.b - r.t);
      set(tutBlocks[0], 0, 0, W, r.t);
      set(tutBlocks[1], 0, r.b, W, H - r.b);
      set(tutBlocks[2], 0, r.t, r.l, r.b - r.t);
      set(tutBlocks[3], r.r, r.t, W - r.r, r.b - r.t);
    } else {
      set(tutSpot, W / 2, H / 2, 0, 0);
      set(tutBlocks[0], 0, 0, W, H);
      [1, 2, 3].forEach((n) => set(tutBlocks[n], 0, 0, 0, 0));
    }
    placeBubble(r);
    animHand(h);
  }

  function placeBubble(r) {
    const W = innerWidth, H = innerHeight, m = 12;
    const bw = tutBubble.offsetWidth, bh = tutBubble.offsetHeight;
    const cx = (x) => Math.max(m, Math.min(W - bw - m, x)), cy = (y) => Math.max(m, Math.min(H - bh - m, y));
    let x = (W - bw) / 2, y = (H - bh) / 2;
    if (r) {
      const midX = (r.l + r.r) / 2 - bw / 2, midY = (r.t + r.b) / 2 - bh / 2;
      const opts = [
        { room: W - r.r, fits: W - r.r - 2 * m >= bw, x: r.r + m, y: midY },
        { room: r.l, fits: r.l - 2 * m >= bw, x: r.l - m - bw, y: midY },
        { room: H - r.b, fits: H - r.b - 2 * m >= bh, x: midX, y: r.b + m },
        { room: r.t, fits: r.t - 2 * m >= bh, x: midX, y: r.t - m - bh },
      ];
      const fit = opts.filter((o) => o.fits).sort((a, b) => b.room - a.room)[0];
      if (fit) { x = fit.x; y = fit.y; }
      else { y = r.t > H - r.b ? m : H - bh - m; } // no room anywhere: top or bottom edge, whichever is freer
    }
    tutBubble.style.left = cx(x) + 'px'; tutBubble.style.top = cy(y) + 'px';
  }

  function animHand(h) {
    tut.anims.forEach((a) => a.cancel()); tut.anims = [];
    tutHand.style.display = h ? 'block' : 'none';
    tutHand.classList.toggle('tap', !!h && h.mode === 'tap');
    if (!h || !tutHand.animate) return;
    const [ax, ay] = h.a, at = (x, y, s) => `translate(${x}px, ${y}px) scale(${s})`;
    if (h.mode === 'drag') {
      const [bx, by] = h.b;
      tutHandPet.src = IMGS[h.pet - 1];
      const io = 'ease-in-out';
      tut.anims.push(tutHand.animate([
        { transform: at(ax, ay, 1.1), opacity: 0, offset: 0 },
        { transform: at(ax, ay, 1), opacity: 1, offset: 0.12 },
        { transform: at(ax, ay, 0.86), opacity: 1, offset: 0.22, easing: io },
        { transform: at(bx, by, 0.86), opacity: 1, offset: 0.7 },
        { transform: at(bx, by, 1), opacity: 1, offset: 0.8 },
        { transform: at(bx, by, 1), opacity: 0, offset: 1 },
      ], { duration: 2300, iterations: Infinity }));
      tut.anims.push(tutHandPet.animate([
        { opacity: 0, transform: 'scale(.6)', offset: 0 },
        { opacity: 0, transform: 'scale(.6)', offset: 0.18 },
        { opacity: 0.9, transform: 'scale(1)', offset: 0.24 },
        { opacity: 0.9, transform: 'scale(1)', offset: 0.7 },
        { opacity: 0, transform: 'scale(.6)', offset: 0.78 },
        { opacity: 0, transform: 'scale(.6)', offset: 1 },
      ], { duration: 2300, iterations: Infinity }));
    } else {
      tutHandPet.style.opacity = 0;
      tut.anims.push(tutHand.animate([
        { transform: at(ax, ay + 10, 1), offset: 0 },
        { transform: at(ax, ay, 1), offset: 0.2 },
        { transform: at(ax, ay, 0.82), offset: 0.32 },
        { transform: at(ax, ay, 1), offset: 0.45 },
        { transform: at(ax, ay + 10, 1), offset: 1 },
      ], { duration: 1100, iterations: Infinity, easing: 'ease-in-out' }));
    }
  }

  // Keep the spotlight on its target (layout changes, resizes) and step aside for popups / pause.
  setInterval(() => {
    if (!tut) return;
    const away = paused || !modal.classList.contains('hidden') || isOn(mainMenu) || (exitModal && exitModal.classList.contains('active'));
    tutEl.classList.toggle('away', away);
    if (away) { tut.sig = ''; return; }
    if (!drag) tutLayout(); // never move the spotlight under a finger mid-drag
  }, 150);

  // ---------- boosters: countdown, HUD chips, auto petting ----------
  const boostsEl = $('#boosts');
  function renderBoosts() {
    boostsEl.innerHTML = Object.keys(S.boost).filter((k) => S.boost[k] > 0)
      .map((k) => `<span class="boost-chip" title="${UPG[k].name}">${UPG[k].icon}${mmss(S.boost[k])}</span>`).join('');
  }
  function boostTick() {
    let ended = false;
    for (const k of Object.keys(S.boost)) {
      if (S.boost[k] <= 0) continue;
      S.boost[k] = Math.max(0, S.boost[k] - 1);
      if (!S.boost[k]) { ended = true; toast(`${UPG[k].name} finished — get another in the Shop!`); }
    }
    renderBoosts();
    // keep timers in an open Shop / Level-up list current
    if (!modal.classList.contains('hidden') && card.querySelector('.upg-list')) {
      if (ended) { card.querySelector('.upg-list').innerHTML = upgRowsHTML(); bindUpgrades(card); }
      else card.querySelectorAll('[data-left]').forEach((el) => { el.textContent = `⏱ ${mmss(S.boost[el.dataset.left])} left`; });
    }
  }
  const autoPawEl = document.createElement('div');
  autoPawEl.className = 'auto-paw'; autoPawEl.textContent = '🐾'; fx.appendChild(autoPawEl);
  let autoAcc = 0, autoIdx = 0, autoSnd = 0;
  function autoPet(dt) {
    const on = S.boost.auto > 0;
    autoPawEl.classList.toggle('on', on);
    if (!on) return;
    const pets = []; for (let i = 0; i < N; i++) if (S.open[i] && S.grid[i] && !(drag && drag.i === i) && (companion || inView(i))) pets.push(i);
    if (!pets.length) return;
    // every pet gets a pat about every 1.5 s (faster when there are many pets)
    const step = Math.max(0.12, 1.5 / pets.length);
    autoAcc += dt;
    if (autoAcc < step) return;
    autoAcc = 0;
    const i = pets[autoIdx++ % pets.length], L = S.grid[i], c = cells[i], [x, y] = centerOf(c);
    autoPawEl.style.transform = `translate(${x - 4}px, ${y - 4}px)`;
    c.classList.remove('tap'); void c.offsetWidth; c.classList.add('tap');
    showMood(c.querySelector('.pet'), L, HAPPY, 450);
    const v = income(L) * rushMul(); addCoins(v);
    floatText(x, y - 20, '+' + fmt(v), 'auto');
    if (autoSnd++ % 2 === 0) tone(1250 + (autoIdx % 5) * 80, 0.04, 'sine', 0.03, 1.3);
  }

  // ---------- living pets: tag every pet picture, give it an idle animation and random blinks ----------
  function tagPet(img) {
    if (img.id === 'ghost' || img.classList.contains('tut-pet')) return;
    const L = SRC2LV.get(img.src);
    if (!L) return;
    if (img.dataset.lv !== String(L)) {
      img.dataset.lv = L; img.dataset.t = PETS[L - 1].type; img.classList.add('pa');
      if (!img.style.animationDelay) img.style.animationDelay = (-Math.random() * 3).toFixed(2) + 's';
    }
  }
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === 'attributes') { if (m.target.tagName === 'IMG') tagPet(m.target); continue; }
      m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        if (n.tagName === 'IMG') tagPet(n); else n.querySelectorAll('img').forEach(tagPet);
      });
    }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  document.querySelectorAll('img').forEach(tagPet);

  setInterval(() => {
    const pets = document.querySelectorAll('img.pa');
    if (!pets.length) return;
    for (let k = 0; k < 2; k++) {
      const img = pets[(Math.random() * pets.length) | 0], L = +img.dataset.lv;
      if (!L || img.src !== IMGS[L - 1] || !img.offsetParent) continue;
      showMood(img, L, BLINK, 140);
      if (Math.random() < 0.25) setTimeout(() => img.src === IMGS[L - 1] && showMood(img, L, BLINK, 120), 300); // double blink
    }
  }, 420);

  // =====================================================================================
  // ---------- achievements (shown in-game everywhere, also unlocked on Steam) ----------
  const ACH = [
    ['FIRST_MERGE', 'First Merge', 'Merge two matching pets', (s) => s.stats.merges >= 1],
    ['MERGE_100', 'Merge Maker', 'Merge 100 times', (s) => s.stats.merges >= 100],
    ['MERGE_1000', 'Merge Master', 'Merge 1,000 times', (s) => s.stats.merges >= 1000],
    ['PETS_5', 'Pet Pals', 'Discover 5 different pets', (s) => s.discovered.length >= 5],
    ['PETS_10', 'Pet Expert', 'Discover 10 different pets', (s) => s.discovered.length >= 10],
    ['PETS_ALL', 'Haven Complete', `Discover all ${MAX} pets`, (s) => s.discovered.length >= MAX],
    ['ADOPT_1', 'Forever Home', 'Find a family for a pet', (s) => s.served >= 1],
    ['ADOPT_25', 'Matchmaker', 'Complete 25 adoptions', (s) => s.served >= 25],
    ['ADOPT_100', 'Adoption Hero', 'Complete 100 adoptions', (s) => s.served >= 100],
    ['CUDDLE_1', 'Cuddle Buddy', 'Cuddle a pet that asked for it', (s) => s.stats.cuddles >= 1],
    ['CUDDLE_50', 'Cuddle Champion', 'Cuddle 50 pets that asked for it', (s) => s.stats.cuddles >= 50],
    ['TAP_500', 'Pat Pat Pat', 'Pat your pets 500 times', (s) => s.stats.taps >= 500],
    ['SELL_1', 'Bye-Bye', 'Sell a pet', (s) => s.stats.sells >= 1],
    ['UNDO_1', 'Changed My Mind', 'Undo a sale', (s) => s.stats.undos >= 1],
    ['YARD_FULL', 'Room to Roam', 'Unlock 40 tiles of the yard', (s) => s.open.filter(Boolean).length >= 40],
    ['LEVEL_10', 'Growing Haven', 'Reach level 10', (s) => s.level >= 10],
    ['LEVEL_25', 'Haven Legend', 'Reach level 25', (s) => s.level >= 25],
    ['COINS_1M', 'Millionaire', 'Earn 1,000,000 coins in total', (s) => s.stats.earned >= 1e6],
    ['BOOST_1', 'Power Up', 'Use a booster', (s) => s.stats.boosts >= 1],
    ['UPG_MAX', 'Maxed Out', 'Max out any upgrade', (s) => Object.keys(UPG).some((k) => !isBoost(k) && s.upg[k] >= UPG[k].max)],
    ['TUTORIAL', 'Haven Graduate', 'Finish the tutorial', (s) => s.tutDone && s.stats.merges > 0],
    ['STREAK_10', 'On a Roll', 'Complete 10 adoptions in a row', (s) => (s.bestStreak || 0) >= 10],
  ];
  const achToastEl = $('#achToast'), achQueue = [];
  let achShowing = false, achPending = false;
  function achSoon() { if (achPending) return; achPending = true; setTimeout(() => { achPending = false; achCheck(); }, 0); }
  function achCheck() {
    if (!started) return;
    for (const [id, name, , test] of ACH) {
      if (S.ach[id]) continue;
      let ok = false; try { ok = test(S); } catch (e) {}
      if (!ok) continue;
      S.ach[id] = Date.now();
      Platform.unlockAchievement(id);
      achQueue.push(name);
    }
    if (achQueue.length) { save(); showNextAch(); }
  }
  function showNextAch() {
    if (achShowing || !achQueue.length) return;
    achShowing = true;
    achToastEl.innerHTML = `<span class="ach-cup">🏆</span><span><small>Achievement unlocked</small><b>${achQueue.shift()}</b></span>`;
    achToastEl.classList.add('show');
    SFX.good();
    setTimeout(() => { achToastEl.classList.remove('show'); setTimeout(() => { achShowing = false; showNextAch(); }, 350); }, 3200);
  }
  const achCount = () => ACH.filter(([id]) => S.ach[id]).length;
  function achListHTML() {
    return `<h3 class="ach-head">Achievements <small>${achCount()} / ${ACH.length}</small></h3><div class="ach-list">${ACH.map(([id, name, desc]) => {
      const got = !!S.ach[id];
      return `<div class="ach${got ? ' got' : ''}"><span>${got ? '🏆' : '🔒'}</span><div><b>${name}</b><small>${desc}</small></div></div>`;
    }).join('')}</div>`;
  }

  // ---------- settings ----------
  function showSettings() {
    modal.classList.toggle('top', paused || isOn(mainMenu)); // above the pause / menu screens
    const pct = (v) => Math.round(v * 100) + '%';
    const desk = Platform.isDesktop;
    openModal(`<h2>Settings</h2>
      <div class="set-list">
        <label class="set-row" for="setMusic"><span>🎵 Music volume</span><input type="range" id="setMusic" min="0" max="100" step="5" value="${Math.round(SET.music * 100)}"><output>${pct(SET.music)}</output></label>
        <label class="set-row" for="setSfx"><span>🔊 Sound effects</span><input type="range" id="setSfx" min="0" max="100" step="5" value="${Math.round(SET.sfx * 100)}"><output>${pct(SET.sfx)}</output></label>
        ${desk ? `<label class="set-row" for="setZoom"><span>🔍 UI scale</span><input type="range" id="setZoom" min="80" max="150" step="10" value="${Math.round(SET.zoom * 100)}"><output>${pct(SET.zoom)}</output></label>` : ''}
        <label class="set-row check" for="setMotion"><span>🌙 Reduce motion <small>calmer pet animations</small></span><input type="checkbox" id="setMotion" ${SET.reduceMotion ? 'checked' : ''}></label>
        <label class="set-row check" for="setSci"><span>🔢 Scientific numbers <small>1.23e9 instead of 1.23B</small></span><input type="checkbox" id="setSci" ${SET.sci ? 'checked' : ''}></label>
        ${desk ? `<div class="set-row btns"><button class="btn small" id="setFull">⛶ Fullscreen <kbd>F11</kbd></button><button class="btn small" id="setComp">🐾 Companion mode <kbd>C</kbd></button></div>` : ''}
      </div>
      <details class="keys"><summary>Keyboard shortcuts</summary>
        <div class="key-grid">
          <span><kbd>Space</kbd> Buy egg</span><span><kbd>Q</kbd> Shop</span><span><kbd>B</kbd> Pet book</span><span><kbd>Esc</kbd> Pause</span>
          <span><kbd>1</kbd>–<kbd>8</kbd> Buy upgrade</span><span><kbd>Shift</kbd>+buy Max</span><span><kbd>Ctrl</kbd>+buy ×10</span><span>Right-click Sell pet</span>
          <span><kbd>M</kbd> Music</span><span><kbd>N</kbd> Sounds</span><span><kbd>,</kbd> Settings</span>${desk ? '<span><kbd>F11</kbd> Fullscreen</span><span><kbd>C</kbd> Companion</span>' : ''}
        </div>
      </details>
      <div class="actions"><button class="btn go" data-close>Done</button></div>`, (root) => {
      const slider = (id, key, after) => {
        const el = root.querySelector('#' + id); if (!el) return;
        el.addEventListener('input', () => { SET[key] = el.value / 100; el.nextElementSibling.textContent = el.value + '%'; after && after(); });
        el.addEventListener('change', () => { saveSettings(); applySettings(); });
      };
      slider('setMusic', 'music', () => MUSIC.setVolume(SET.music));
      slider('setSfx', 'sfx', () => SFX.tap());
      slider('setZoom', 'zoom');
      root.querySelector('#setMotion').addEventListener('change', (e) => { SET.reduceMotion = e.target.checked; saveSettings(); applySettings(); });
      root.querySelector('#setSci').addEventListener('change', (e) => { SET.sci = e.target.checked; saveSettings(); renderAll(); });
      const full = root.querySelector('#setFull'); if (full) full.onclick = () => Platform.toggleFullscreen();
      const comp = root.querySelector('#setComp'); if (comp) comp.onclick = () => { closeModal(); setCompanion(true); };
    });
  }
  $('#setBtn').addEventListener('click', showSettings);
  $('#menuSettings').addEventListener('click', showSettings);
  $('#pauseSettings').addEventListener('click', showSettings);

  // ---------- Shop docked in the side panel on wide (PC) screens ----------
  const dockEl = $('#dockShop'), dockList = dockEl.querySelector('.upg-list');
  let dockSig = '';
  function renderDock() {
    if (getComputedStyle(dockEl).display === 'none') { dockSig = ''; return; }
    const sig = Object.keys(UPG).map((k) => [canBuyUpg(k) ? 1 : 0, upgMaxed(k) ? 1 : 0, S.upg[k] || 0, S.boost[k] > 0 ? 1 : 0, fmt(upgCost(k))].join(',')).join('|');
    if (sig === dockSig) {
      dockList.querySelectorAll('[data-left]').forEach((el) => { el.textContent = `⏱ ${mmss(S.boost[el.dataset.left])} left`; });
      return;
    }
    dockSig = sig;
    dockList.innerHTML = upgRowsHTML();
  }
  bindUpgrades(dockEl);
  window.addEventListener('resize', () => { dockSig = ''; renderDock(); });

  // ---------- tooltips (mouse only) ----------
  const tipEl = $('#tip');
  const hoverable = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const TIPS = {
    coins: () => `<b>${Math.floor(S.coins).toLocaleString()} coins</b><br>Earning ${fmt(totalIncome() * rushMul())} per second${rushMul() > 1 ? ' (Coin Rush ×2)' : ''}<br>Lifetime: ${fmt(S.stats.earned)}`,
    buy: () => `<b>Buy an egg</b> · ${fmt(eggCost())} coins<br>Hatches a ${PETS[spawnLevel() - 1].name}<br><small>Hotkey: Space</small>`,
    hatch: () => `<b>Free egg</b> every ${hatchInterval().toFixed(1)}s<br><small>Upgrade Warm Incubator to speed it up</small>`,
    sell: () => `<b>Sell bin</b><br>Drag a pet here, or right-click a pet on the board`,
    shop: () => '<b>Shop</b> · upgrades and boosters<br><small>Hotkey: Q</small>',
    book: () => `<b>Pet book</b> · ${S.discovered.length}/${MAX} pets · ${achCount()}/${ACH.length} achievements<br><small>Hotkey: B</small>`,
    sound: () => `<b>Sounds</b> ${S.sound ? 'on' : 'off'}<br><small>Hotkey: N</small>`,
    music: () => `<b>Music</b> ${S.music ? 'on' : 'off'}<br><small>Hotkey: M</small>`,
    settings: () => '<b>Settings</b><br><small>Hotkey: ,</small>',
    pause: () => '<b>Pause</b><br><small>Hotkey: Esc</small>',
    xp: () => `<b>Level ${S.level}</b> · ${fmt(S.xp)} / ${fmt(xpNeed(S.level))} XP<br>Merges, adoptions and unlocks give XP`,
  };
  [['.pill.coins', 'coins'], ['#buyBtn', 'buy'], ['#hatch', 'hatch'], ['#sell', 'sell'], ['#shopBtn', 'shop'], ['#bookBtn', 'book'],
    ['#soundBtn', 'sound'], ['#musicBtn', 'music'], ['#setBtn', 'settings'], ['#pauseBtn', 'pause'], ['#xpBar', 'xp'], ['.lvl-badge', 'xp']]
    .forEach(([sel, k]) => { const el = $(sel); if (el) el.dataset.tip = k; });
  function tipHTML(el) {
    const c = el.closest('#board .cell');
    if (c) {
      const i = +c.dataset.i, L = S.grid[i];
      if (!S.open[i]) return buyable(i) ? `<b>Fenced tile</b><br>Click to unlock for ${fmt(unlockCost())} coins` : '<b>Fenced tile</b><br>Unlock the tiles next to your yard first';
      if (!L) return null;
      const next = L < MAX ? `Merge two → <b>${S.discovered.includes(L + 1) ? PETS[L].name : '???'}</b>` : '<b>The rarest pet of all!</b>';
      return `<b>${PETS[L - 1].name}</b> · Lv ${L}<br>Earns ${fmt(income(L) * rushMul())}/s · sells for ${fmt(sellValue(L))}<br>${next}<br><small>Click: pat · Drag: merge · Right-click: sell</small>`;
    }
    const o = el.closest('.order');
    if (o) {
      const ord = S.orders[+o.dataset.k];
      if (!ord || !ord.level) return '<b>A new family is on the way</b>';
      const known = S.discovered.includes(ord.level);
      return `<b>Family wants a ${known ? PETS[ord.level - 1].name : 'pet you haven\'t found yet'}</b><br>Pays ${Math.round(orderReward(ord)).toLocaleString()} coins${S.streak ? ` (streak ×${streakMul().toFixed(1)})` : ''}<br>Leaves in ${Math.max(0, Math.ceil(ord.left || 0))}s<br><small>Drag a matching pet onto this card</small>`;
    }
    const up = el.closest('[data-up]');
    if (up) {
      const k = up.dataset.up, idx = Object.keys(UPG).indexOf(k) + 1;
      return `<b>${UPG[k].name}</b><br>Click: buy 1 · Ctrl: ×10 · Shift: max${idx <= 9 ? `<br><small>Hotkey: ${idx}</small>` : ''}`;
    }
    const t = el.closest('[data-tip]');
    if (t && TIPS[t.dataset.tip]) return TIPS[t.dataset.tip]();
    return null;
  }
  let tipFor = null, tipTimer = 0, tipX = 0, tipY = 0;
  function placeTip() {
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    let x = tipX + 16, y = tipY + 18;
    if (x + w > innerWidth - 8) x = tipX - w - 12;
    if (y + h > innerHeight - 8) y = tipY - h - 12;
    tipEl.style.transform = `translate(${Math.max(8, x)}px, ${Math.max(8, y)}px)`;
  }
  function hideTip() { clearTimeout(tipTimer); tipFor = null; tipEl.classList.remove('show'); }
  if (hoverable) {
    document.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      tipX = e.clientX; tipY = e.clientY;
      if (drag) { hideTip(); return; }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const target = el && (el.closest('#board .cell, .order, [data-up], [data-tip]'));
      if (target !== tipFor) {
        hideTip(); tipFor = target;
        if (target) tipTimer = setTimeout(() => {
          const html = tipHTML(target);
          if (!html || tipFor !== target) return;
          tipEl.innerHTML = html; tipEl.classList.add('show'); placeTip();
        }, 350);
      } else if (tipEl.classList.contains('show')) {
        const html = tipHTML(target); if (html && html !== tipEl.innerHTML) tipEl.innerHTML = html;
        placeTip();
      }
    });
    document.addEventListener('pointerdown', hideTip, true);
    document.addEventListener('wheel', hideTip, { passive: true });
  }

  // ---------- right-click to sell ----------
  board.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const c = e.target.closest('.cell');
    if (!c || paused || tut || drag) return;
    const i = +c.dataset.i;
    if (!S.open[i] || !S.grid[i]) return;
    sellPet(i, sellEl, null); save();
  });
  if (Platform.isDesktop) document.addEventListener('contextmenu', (e) => e.preventDefault());

  // ---------- Desktop Companion mode (Steam build): a strip at the bottom of the screen ----------
  let companion = false;
  function setCompanion(on) {
    if (!Platform.canCompanion || on === companion) return;
    if (on && (tut || paused)) { toast(tut ? 'Finish the tutorial first!' : 'Resume the game first!'); return; }
    companion = on;
    cancelDrag(); hideTip();
    if (on) { if (!modal.classList.contains('hidden')) closeModal(); }
    document.body.classList.toggle('companion', on);
    Platform.setCompanion(on);
    dockSig = '';
    if (!on && modalQueue.length && modal.classList.contains('hidden')) { const [h, b] = modalQueue.shift(); openModal(h, b); }
    SFX.pop(); renderHUD();
  }
  $('#cbExit').addEventListener('click', () => setCompanion(false));
  $('#cbBuy').addEventListener('click', buyEgg);

  // ---------- extra hotkeys (PC) ----------
  window.addEventListener('keydown', (e) => {
    if (e.repeat && e.code !== 'Space') return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.code === 'F11' && Platform.canFullscreen) { e.preventDefault(); Platform.toggleFullscreen(); return; }
    if (e.code === 'KeyM') { toggleMusic(); return; }
    if (e.code === 'KeyN') { toggleSound(); return; }
    if (e.code === 'Comma' && modal.classList.contains('hidden') && !(exitModal && isOn(exitModal))) { showSettings(); return; }
    if (paused || tut || (exitModal && isOn(exitModal))) return;
    if (e.code === 'KeyC' && Platform.canCompanion) { setCompanion(!companion); return; }
    const modalOpen = !modal.classList.contains('hidden');
    if (e.code === 'KeyQ') { if (modalOpen) closeModal(); else showShop(); return; }
    if (e.code === 'KeyG' && !modalOpen) { startAM(); return; }
    if (e.code === 'KeyB') { if (modalOpen) closeModal(); else showBook(); return; }
    const m = /^Digit([1-9])$/.exec(e.code);
    if (m) {
      const k = Object.keys(UPG)[+m[1] - 1];
      if (!k) return;
      const el = document.querySelector(`#modalCard [data-up="${k}"], #dockShop [data-up="${k}"]`);
      if (buyUpgMulti(k, el, e)) { refreshUpgLists(); renderAll(); }
    }
  });

  // Customers come and go every few seconds. Smooth 5-second patience, then they walk away.
  function ordersTick(dt) {
    const hold = tut || companion || !modal.classList.contains('hidden'); // never drain behind a popup
    const now = Date.now();
    let changed = false;
    S.orders.forEach((o, k) => {
      if (!o) { S.orders[k] = { until: now + 300 + k * 1700 }; changed = true; return; } // staggered first customers
      if (o.until && now >= o.until) { S.orders[k] = newOrder(); changed = true; return; }
      if (!o.level || hold) return;
      if (o.dur == null || o.dur > 20) { o.dur = PATIENCE; o.left = Math.min(o.left == null ? PATIENCE : o.left, PATIENCE); } // older saves / tutorial
      o.left -= dt;
      if (o.left <= 0) { familyLeft(k, o); changed = true; return; }
      paintBar(ordersEl.children[k], o);
    });
    // drop finished leave animations so the slot shows "Next customer…"
    S.orders.forEach((o) => { if (o && (o.done || o.gone) && !o.cleared && now - o.t >= LEAVE_MS) { o.cleared = true; changed = true; } });
    if (changed) { renderOrders(); renderStreak(); }
  }
  function familyLeft(k, o) {
    S.orders[k] = { until: Date.now() + LEAVE_MS + custGap(), gone: o.level, cust: o.cust, t: Date.now() };
    if ((S.streak || 0) > 0) S.streak--; // a missed customer cools the streak a little
    tone(330, 0.16, 'sine', 0.05, 0.7);
  }
  function puff(x, y) {
    for (let k = 0; k < 9; k++) {
      const d = document.createElement('div');
      d.className = 'puff';
      const a = Math.random() * Math.PI * 2, r = 14 + Math.random() * 26;
      d.style.left = x + 'px'; d.style.top = y + 'px';
      d.style.setProperty('--dx', Math.cos(a) * r + 'px'); d.style.setProperty('--dy', Math.sin(a) * r - 8 + 'px');
      d.style.animationDelay = (k * 0.02).toFixed(2) + 's';
      fx.appendChild(d); setTimeout(() => d.remove(), 900);
    }
    tone(520, 0.25, 'sine', 0.06, 0.5); // soft "poof"
  }

  // ---------- endless yard: drag the grass to look around ----------
  const boardView = $('#boardView'), boardFrame = $('#boardFrame');
  const pan = { x: 3, y: 3 };          // top-left visible cell (can be fractional while dragging)
  let panning = null;
  const cellPx = () => { const a = cells[0].getBoundingClientRect(), b = cells[1].getBoundingClientRect(); return (b.left - a.left) || 50; };
  function inView(i) {
    if (companion) return true;
    const r = Math.floor(i / COLS), c = i % COLS;
    return c > pan.x - 0.6 && c < pan.x + VIEW - 0.4 && r > pan.y - 0.6 && r < pan.y + VIEW - 0.4;
  }
  function applyPan(glide) {
    pan.x = Math.max(0, Math.min(COLS - VIEW, pan.x));
    pan.y = Math.max(0, Math.min(ROWS - VIEW, pan.y));
    board.classList.toggle('glide', !!glide);
    board.style.setProperty('--px', pan.x); board.style.setProperty('--py', pan.y);
    boardFrame.classList.toggle('can-l', pan.x > 0.05); boardFrame.classList.toggle('can-r', pan.x < COLS - VIEW - 0.05);
    boardFrame.classList.toggle('can-u', pan.y > 0.05); boardFrame.classList.toggle('can-d', pan.y < ROWS - VIEW - 0.05);
  }
  function snapPan() { pan.x = Math.round(pan.x); pan.y = Math.round(pan.y); applyPan(true); }
  function centerOnYard() {
    let sr = 0, sc = 0, n = 0;
    for (let i = 0; i < N; i++) if (S.open[i]) { sr += Math.floor(i / COLS); sc += i % COLS; n++; }
    if (n) { pan.x = sc / n - VIEW / 2 + 0.5; pan.y = sr / n - VIEW / 2 + 0.5; }
    snapPan();
  }
  // something happened off-screen: flash the arrow on that side
  function pingEdge(i) {
    const r = Math.floor(i / COLS), c = i % COLS;
    const side = c < pan.x ? 'l' : c >= pan.x + VIEW ? 'r' : r < pan.y ? 'u' : 'd';
    const a = boardFrame.querySelector('.pa-' + side); if (!a) return;
    a.classList.remove('ping'); void a.offsetWidth; a.classList.add('ping');
  }
  boardView.addEventListener('pointerdown', (e) => {
    if (drag || panning || e.button !== 0 || e.target.closest('.pan-arrow')) return;
    const c = e.target.closest('.cell'), i = c ? +c.dataset.i : -1;
    if (i >= 0 && S.open[i] && S.grid[i]) return; // pets are dragged, not panned
    e.preventDefault();
    panning = { id: e.pointerId, x0: e.clientX, y0: e.clientY, px: pan.x, py: pan.y, moved: false, cell: i, P: cellPx() };
  });
  window.addEventListener('pointermove', (e) => {
    if (!panning || e.pointerId !== panning.id) return;
    const dx = e.clientX - panning.x0, dy = e.clientY - panning.y0;
    if (!panning.moved && Math.hypot(dx, dy) > 7) { panning.moved = true; boardView.classList.add('grabbing'); hideTipSafe(); }
    if (panning.moved) { pan.x = panning.px - dx / panning.P; pan.y = panning.py - dy / panning.P; applyPan(false); }
  });
  function endPan(e) {
    if (!panning || e.pointerId !== panning.id) return;
    const p = panning; panning = null;
    boardView.classList.remove('grabbing');
    if (p.moved) { snapPan(); return; }
    if (e.type === 'pointerup' && p.cell >= 0 && !S.open[p.cell]) tryUnlock(p.cell); // a tap on a fence
  }
  window.addEventListener('pointerup', endPan);
  window.addEventListener('pointercancel', endPan);
  boardView.addEventListener('wheel', (e) => {
    if (paused || companion) return;
    e.preventDefault();
    const P = cellPx();
    pan.x += (e.shiftKey ? e.deltaY : e.deltaX) / P; if (!e.shiftKey) pan.y += e.deltaY / P;
    applyPan(false); clearTimeout(boardView._wt); boardView._wt = setTimeout(snapPan, 160);
  }, { passive: false });
  boardFrame.querySelectorAll('.pan-arrow').forEach((b) => b.addEventListener('click', () => {
    const [dx, dy] = b.dataset.pan.split(',').map(Number);
    pan.x += dx * 3; pan.y += dy * 3; snapPan(); SFX.tap();
  }));
  window.addEventListener('keydown', (e) => {
    if (paused || tut || companion || !modal.classList.contains('hidden')) return;
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!d) return;
    e.preventDefault(); pan.x += d[0]; pan.y += d[1]; snapPan();
  });
  function hideTipSafe() { try { hideTip(); } catch (e) {} }

  // ---------- Auto Merge power: runs for a while, merging pairs and serving customers ----------
  let amT = 0, amBusy = null;
  const amBar = $('#amBar'), amFill = amBar.querySelector('.am-fill'), amTxt = amBar.querySelector('.am-txt');
  function startAM() {
    if (!S.upg.amerge || S.am.phase !== 'ready' || tut) return;
    S.am.phase = 'active'; S.am.t = amDur(); amT = amStep();
    const [x, y] = centerOf(amBar); sparks(x, y, 14); SFX.fanfare();
    amBar.classList.remove('kick'); void amBar.offsetWidth; amBar.classList.add('kick');
    paintAM(); save();
  }
  amBar.addEventListener('click', () => startAM());
  function paintAM() {
    const l = S.upg.amerge;
    amBar.hidden = !l;
    if (!l) return;
    const st = S.am;
    let f = 1, txt;
    if (st.phase === 'active') { f = st.t / amDur(); txt = `⚡ Auto Merge · ${Math.ceil(st.t)}s`; }
    else if (st.phase === 'charge') { f = 1 - st.t / amCharge(); txt = `Recharging · ${Math.ceil(st.t)}s`; }
    else txt = '▶ Start Auto Merge (G)';
    amFill.style.width = (Math.max(0, Math.min(1, f)) * 100).toFixed(1) + '%';
    if (amTxt.textContent !== txt) amTxt.textContent = txt;
    amBar.dataset.phase = st.phase;
  }
  function autoMerge(dt) {
    if (!S.upg.amerge) { amBar.hidden = true; return; }
    const st = S.am;
    if (!tut) {
      if (st.phase === 'active') {
        st.t -= dt; amT += dt;
        if (amT >= amStep() && !amBusy) { amT = 0; amAction(); }
        if (st.t <= 0) { st.phase = 'charge'; st.t = amCharge(); tone(500, 0.2, 'sine', 0.06, 0.6); }
      } else if (st.phase === 'charge') {
        st.t -= dt;
        if (st.t <= 0) {
          st.phase = 'ready'; st.t = 0;
          if (S.upg.amerge >= 5) startAM(); else { SFX.wish(); toast('Auto Merge is ready! ⚡'); }
        }
      }
    }
    paintAM();
  }
  // one Auto Merge action: serve a waiting customer if a pet on the board matches, otherwise merge a pair
  function amAction() {
    const free = (i) => S.grid[i] && S.open[i] && !(drag && drag.i === i) && !(wish && wish.i === i);
    // 1) a customer is waiting for a pet we have → carry it to them
    let best = null;
    S.orders.forEach((o, k) => {
      if (!o || !o.level || o.left < 0.8 || !ordersEl.children[k] || !ordersEl.children[k].querySelector('.order.cust:not(.leave)')) return;
      const cand = [];
      for (let i = 0; i < N; i++) if (free(i) && S.grid[i] === o.level) cand.push(i);
      if (!cand.length) return;
      const i = cand.find(inView) ?? cand[0];
      if (!best || o.left < best.left) best = { k, i, L: o.level, left: o.left };
    });
    if (best) {
      const { k, i, L } = best, card = ordersEl.children[k];
      amBusy = [i];
      flyPet(i, L, centerOf(card), () => {
        amBusy = null;
        const o = S.orders[k];
        if (o && o.level === L && S.grid[i] === L) fulfill(i, k);
      });
      return;
    }
    // 2) merge the lowest matching pair (prefer pets on screen)
    const by = {};
    for (let i = 0; i < N; i++) { const L = S.grid[i]; if (free(i) && L < MAX) (by[L] = by[L] || []).push(i); }
    let pair = null;
    for (const L of Object.keys(by).map(Number).sort((a, b) => a - b)) {
      const list = by[L]; if (list.length < 2) continue;
      const vis = list.filter(inView);
      pair = vis.length >= 2 ? [vis[0], vis[1]] : [list[0], list[1]];
      break;
    }
    if (!pair) return;
    const [a, b] = pair, L = S.grid[a];
    if (!inView(a) || !inView(b)) { merge(a, b); return; }  // off-screen pairs merge quietly
    amBusy = pair;
    flyPet(a, L, centerOf(cells[b]), () => {
      amBusy = null;
      if (S.grid[a] === L && S.grid[b] === L) merge(a, b);
    });
  }
  // a pet hops from its tile to a point (another pet, or a customer's card) like a real drag
  function flyPet(i, L, [bx, by], done) {
    const vis = inView(i), vr = boardView.getBoundingClientRect();
    const ra = vis ? cells[i].getBoundingClientRect() : { left: vr.left + vr.width / 2 - 30, top: vr.top + vr.height / 2 - 30, width: 60 };
    const ax = ra.left + ra.width / 2, ay = ra.top + ra.width / 2;
    const g = new Image(); g.src = IMGS[L - 1]; g.className = 'am-fly';
    g.style.width = g.style.height = ra.width + 'px';
    document.body.appendChild(g);
    if (vis) cells[i].classList.add('am-src');
    const fin = () => { g.remove(); cells[i].classList.remove('am-src'); done(); };
    if (!g.animate) { fin(); return; }
    const far = Math.hypot(bx - ax, by - ay);
    g.animate([
      { transform: `translate(${ax}px, ${ay}px) translate(-50%, -50%) scale(1)` },
      { transform: `translate(${ax}px, ${ay}px) translate(-50%, -60%) scale(1.15)`, offset: 0.15 },
      { transform: `translate(${(ax + bx) / 2}px, ${Math.min(ay, by) - ra.width * 0.6}px) translate(-50%, -50%) scale(1.15) rotate(-10deg)`, offset: 0.55 },
      { transform: `translate(${bx}px, ${by}px) translate(-50%, -50%) scale(.75)` },
    ], { duration: Math.min(700, 380 + far * 0.35), easing: 'ease-in-out', fill: 'forwards' }).onfinish = fin;
  }
  // big merge moment: a ring of light, stars and a glow on the new pet
  function mergeBurst(x, y, cell) {
    const r = document.createElement('div');
    r.className = 'mring'; r.style.left = x + 'px'; r.style.top = y + 'px';
    r.style.width = r.style.height = cell.getBoundingClientRect().width + 'px';
    fx.appendChild(r); setTimeout(() => r.remove(), 700);
    emojiBurst(x, y - 6, ['✨', '⭐', '💫', '✨'], 6);
    cell.classList.remove('merged'); void cell.offsetWidth; cell.classList.add('merged');
  }

  // ---------- loop ----------
  let tick = 0, lastFrame = performance.now(), acc = 0;
  function secondTick() {
    tick++;
    // Every pet pays out every 3 seconds, staggered across the board.
    for (let i = 0; i < N; i++) {
      const L = S.grid[i];
      if (!L || (i + tick) % 3) continue;
      const v = income(L) * 3 * rushMul(); addCoins(v);
      if (!inView(i)) continue;
      const [x, y] = centerOf(cells[i]); floatText(x, y - 18, '+' + fmt(v));
    }
    const now = Date.now();
    let changed = false;
    void now; void changed;
    boostTick();
    renderHUD();
    renderDock();
    wishTick();
    achCheck();
    if (tick % 5 === 0) save();
  }

  function frame(t) {
    if (paused) { lastFrame = t; requestAnimationFrame(frame); return; }
    const dt = Math.min(0.25, (t - lastFrame) / 1000); lastFrame = t;
    acc += dt;
    if (acc >= 1) { acc -= 1; secondTick(); }
    autoPet(dt);
    autoMerge(dt);
    ordersTick(dt);
    const iv = hatchInterval();
    if (tut && !tut.hatchOn) {
      // free eggs wait while the tutorial explains things, so the yard doesn't fill up
    } else if (emptyCells().length) {
      S.hatchT += dt;
      if (S.hatchT >= iv) { S.hatchT = 0; spawn(spawnLevel()); renderHUD(); tutEvent('hatch'); }
    } else S.hatchT = Math.min(S.hatchT + dt, iv);
    $('#hatchFill').style.width = (S.hatchT / iv) * 100 + '%';
    requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { save(); pauseGame(true); } // auto-pause when the app goes to background
    else lastFrame = performance.now();
    syncMusic();
  });
  window.addEventListener('pagehide', save);

  // ---------- boot: loading panel -> main menu ----------
  applySettings();
  initLoadingScreen();
  renderAll(); centerOnYard();
  openMainMenu(); // sits under the loading panel and is revealed when it fades out
  requestAnimationFrame(frame);
})();
