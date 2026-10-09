import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, push, onDisconnect, serverTimestamp, remove, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ============================================
// ТЕМЫ
// ============================================
const savedTheme = localStorage.getItem('murino_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

document.querySelectorAll('[data-theme-btn]').forEach(btn => {
  if (btn.dataset.themeBtn === savedTheme) btn.classList.add('active');
  else btn.classList.remove('active');

  btn.addEventListener('click', () => {
    const theme = btn.dataset.themeBtn;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('murino_theme', theme);
    document.querySelectorAll('[data-theme-btn]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ============================================
// FIREBASE
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyDtzE3NVFHFVYqDJprioaCjEhJu-RrBPAg",
  authDomain: "murino-fm-f887c.firebaseapp.com",
  databaseURL: "https://murino-fm-f887c-default-rtdb.firebaseio.com",
  projectId: "murino-fm-f887c",
  storageBucket: "murino-fm-f887c.firebasestorage.app",
  messagingSenderId: "579166745258",
  appId: "1:579166745258:web:9b406191155d8c018a96d3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

window.__murinoDb = db;

let myId = localStorage.getItem('murino_myId');
if (!myId) {
  myId = 'u_' + Math.random().toString(36).slice(2, 10);
  localStorage.setItem('murino_myId', myId);
}
window.__murinoMyId = myId;

// ============================================
// ПЛЕЙЛИСТ
// ============================================
const PROXY = 'https://murino-fm-rho.vercel.app/api/proxy?url=';

const RAW_PLAYLIST = [
  "https://cdn.dbimg.app/3xY3HWbv.mp3",
  "https://cdn.dbimg.app/A2BaTRO9.mp3",
  "https://cdn.dbimg.app/cC1pheSc.mp3",
  "https://cdn.dbimg.app/SpFoc66b.mp3",
  "https://cdn.dbimg.app/7YHHShDy.mp3",
  "https://cdn.dbimg.app/xgLFnA9X.mp3",
  "https://cdn.dbimg.app/ijwaRw3C.mp3",
  "https://cdn.dbimg.app/5Hivjumt.mp3",
  "https://cdn.dbimg.app/jqnVbbUS.mp3",
  "https://cdn.dbimg.app/qYjIZCjs.mp3",
  "https://cdn.dbimg.app/b0cBgfjL.mp3",
  "https://cdn.dbimg.app/fzSli6fm.mp3",
  "https://cdn.dbimg.app/f6h4MbUg.mp3",
  "https://cdn.dbimg.app/vsy10Sbo.mp3",
  "https://cdn.dbimg.app/HquKVun7.mp3",
  "https://cdn.dbimg.app/0JMfDlFA.mp3",
  "https://cdn.dbimg.app/htg0Nawi.mp3",
  "https://cdn.dbimg.app/J3XnGCqJ.mp3",
  "https://cdn.dbimg.app/y9c9ffzw.mp3",
  "https://cdn.dbimg.app/3pAU62Oc.mp3",
  "https://cdn.dbimg.app/RIr0C3ZR.mp3",
  "https://cdn.dbimg.app/P0hovoxB.mp3",
  "https://cdn.dbimg.app/BGTDYkVa.mp3",
  "https://cdn.dbimg.app/hbSGRMU6.mp3",
  "https://cdn.dbimg.app/PtEurF1U.mp3",
  "https://cdn.dbimg.app/erUitYL9.mp3",
  "https://cdn.dbimg.app/VJReWdfD.mp3",
  "https://cdn.dbimg.app/Ljx0cQPP.mp3",
  "https://cdn.dbimg.app/mgSEgOdj.mp3",
  "https://cdn.dbimg.app/6TCFDES4.mp3",
  "https://cdn.dbimg.app/Cjjw5uuM.mp3",
  "https://cdn.dbimg.app/FpbbepTt.mp3",
  "https://cdn.dbimg.app/l37hWGHP.mp3",
  "https://cdn.dbimg.app/LYy0BNfJ.mp3",
  "https://cdn.dbimg.app/iOvEo2WU.mp3",
  "https://cdn.dbimg.app/fEYCg1od.mp3",
  "https://cdn.dbimg.app/j5wmTVey.mp3",
  "https://cdn.dbimg.app/DsuFXbew.mp3",
  "https://cdn.dbimg.app/VHvtfdKd.mp3",
  "https://cdn.dbimg.app/GRmeKydt.mp3",
  "https://cdn.dbimg.app/vkd5SrHy.mp3",
  "https://cdn.dbimg.app/RMDwptJo.mp3",
  "https://cdn.dbimg.app/pYjMbyQo.mp3",
  "https://cdn.dbimg.app/C78esIa3.mp3",
  "https://cdn.dbimg.app/FU53l5nm.mp3",
  "https://cdn.dbimg.app/kjqcZHfG.mp3",
  "https://cdn.dbimg.app/EDZAKEpj.mp3",
  "https://cdn.dbimg.app/IcDuF6Dg.mp3",
  "https://cdn.dbimg.app/AqpED89b.mp3",
  "https://cdn.dbimg.app/mOkApMPl.mp3",
  "https://cdn.dbimg.app/xqD5plQS.mp3",
  "https://cdn.dbimg.app/YA2zeXnL.mp3",
  "https://cdn.dbimg.app/bPYUaqJ8.mp3",
  "https://cdn.dbimg.app/0lH4Hvb6.mp3",
  "https://cdn.dbimg.app/kjmnHYs7.mp3",
  "https://cdn.dbimg.app/dJTA9Moh.mp3",
  "https://cdn.dbimg.app/MOOHcwX3.mp3",
  "https://cdn.dbimg.app/nE3hTbjK.mp3",
  "https://cdn.dbimg.app/JnTUiDJo.mp3",
  "https://cdn.dbimg.app/QGkvd62s.mp3",
  "https://cdn.dbimg.app/MiQwm4WD.mp3",
  "https://cdn.dbimg.app/hsFeiff4.mp3",
  "https://cdn.dbimg.app/8M5xdRSb.mp3",
  "https://cdn.dbimg.app/OZeBkQLE.mp3",
  "https://cdn.dbimg.app/eTSxfceG.mp3",
  "https://cdn.dbimg.app/Ga2x2Xql.mp3",
  "https://cdn.dbimg.app/SQHzcTbt.mp3",
  "https://cdn.dbimg.app/QOHmJPU9.mp3",
  "https://cdn.dbimg.app/1Q6vYMgw.mp3",
  "https://cdn.dbimg.app/GG0PNeky.mp3",
  "https://cdn.dbimg.app/ST4gFS0A.mp3",
  "https://cdn.dbimg.app/qHupCNlL.mp3",
  "https://cdn.dbimg.app/TORuMdr9.mp3",
  "https://cdn.dbimg.app/ulCJtcqk.mp3",
  "https://cdn.dbimg.app/Y4piXfNN.mp3",
  "https://cdn.dbimg.app/VBmJvISs.mp3",
  "https://cdn.dbimg.app/3iZAeSzT.mp3",
  "https://cdn.dbimg.app/1fAShjDj.mp3",
  "https://cdn.dbimg.app/K0cbEnnQ.mp3",
  "https://cdn.dbimg.app/jEmyTyqA.mp3"
];

const playlist = RAW_PLAYLIST.map(u => PROXY + encodeURIComponent(u));

const trackDurations = [
  18, 15, 20, 29, 26, 86, 31, 19, 31, 46,
  20, 45, 25, 31, 80, 78, 33, 30, 38, 62,
  68, 174, 123, 102, 71, 104, 119, 28, 33, 99,
  32, 70, 59, 59, 82, 27, 30, 27, 153, 34,
  75, 45, 32, 36, 71, 35, 108, 19, 48, 32,
  59, 99, 94, 72, 24, 60, 3600, 52, 66, 18,
  17, 45, 47, 67, 30, 51, 102, 26, 54, 52,
  33, 31, 33, 45, 33, 260, 1103, 198, 52, 3599
];

if (trackDurations.length !== RAW_PLAYLIST.length) {
  console.warn(`В плейлисте ${RAW_PLAYLIST.length} треков, а длительностей ${trackDurations.length}.`);
  if (trackDurations.length > RAW_PLAYLIST.length) trackDurations.length = RAW_PLAYLIST.length;
}

// ============================================
// ГИФКИ
// ============================================
const STARTER_GIFS = [
  "https://media1.tenor.com/m/pcZVzLAnLPUAAAAd/мел-строй-stroy-меллстрой.gif",
  "https://media1.tenor.com/m/z-bVtSXeqFgAAAAd/mellstroy.gif",
  "https://media1.tenor.com/m/Itn_Fayp4VkAAAAd/мелстрой-я-помылся-смех-мелстрой.gif",
  "https://media1.tenor.com/m/zeBITLNg2HcAAAAd/mellstroy-тёмный-друн.gif",
  "https://media1.tenor.com/m/If8mUatVQaUAAAAd/мелстрой-мелстрой-красный.gif",
  "https://media1.tenor.com/m/TTBejdQST6IAAAAd/мелстрой-танцуем-все.gif",
  "https://media.tenor.com/aTJNTRDC6q0AAAAi/крутящейся-котость-меллстрой.gif",
  "https://media1.tenor.com/m/5k6HonPcjdsAAAAd/mellstroy-мурино.gif",
  "https://media1.tenor.com/m/MwbXRmNkEU0AAAAC/mellstroyomaygad-mellstroy-omaygad.gif",
  "https://media1.tenor.com/m/zvs5qanKqrsAAAAd/mell-mellstroy.gif",
  "https://media1.tenor.com/m/MMxtux-bHBEAAAAd/bravo-wow.gif",
  "https://media1.tenor.com/m/Vnxd8di1CWoAAAAC/mellstroy.gif",
  "https://media1.tenor.com/m/bXjzL5fdskwAAAAd/mellstroy.gif"
];

// ============================================
// НОВОСТИ
// ============================================
const news = [
  "Великолепный тёмный друн 726 почти прошёл Pizza Tower",
  "Маму-птицу освободили от некой организации «И»",
  "Село Молочное признали самым забытым сезоном — его жителей не пригласили на вечеринку сезонов",
  "Fog из Мурино вышел на охоту — все двери закрыты",
  "Fog замечен у хрущёвки на Заводской — жильцы в шоке",
  "Fog украл колонку у бабуина",
  "В муринской хрущёвке нашли портал в другое измерение",
  "Fog и медведь устроили разборку у хрущёвки",
  "В хрущёвке на пятом этаже завёлся свой Fog",
  "В Мурино хрущёвки признали памятниками архитектуры",
  "В хрущёвке нашли дверь, которая ведёт в туман",
  "В Мурино хрущёвки начали светиться по ночам",
  "В хрущёвке нашли старую кассету с ремиксом",
  "В Мурино замечен бабуин с колонкой на плече",
  "Бабуин и Fog подрались у хрущёвки",
  "Бабуин стал диджеем Мурино FM",
  "В Мурино открыли памятник кубику от КамАЗа",
  "Медведь открыл автосервис для КамАЗов",
  "В Мурино нашли следы от старого КамАЗа",
  "Мурино FM признали самым странным радио года",
  "В Мурино объявили выходной в честь радио",
  "Мурино FM стало самым слушаемым в городе",
  "В Мурино прошёл парад медведей с шаурмой",
  "Медведь украл колонку и ушёл в туман",
  "Медведь и бабуин открыли шаурмичную",
  "В центре Мурино произошла великое противостояние фога и меллстроя. Ждём дальнейших подробностей...",
  "В Мурино прошёл чемпионат по поеданию шаурмы",
  "В Мурино открыли шаурмичную в хрущёвке",
  "В Мурино приземлился НЛО, из него вышел диджей",
  "В Мурино нашли клад — сайт volnorez. Ну и старьё",
  "В Мурино открыли музей потерянных носков",
  "В Мурино построили небоскрёб из старых колонок",
  "В Мурино открыли первый в мире музей ремиксов",
  "В Общаге прошёл фестиваль старых кассет",
  "В Мурино прошёл конкурс на лучший ремикс",
  "В Селе Молочном нашли старую кассету с неизвестным треком",
  "В Мурино прошёл фестиваль забытых мелодий",
  "Сезон общага вошёл в топ 3 лучших сезонов по меллстрою",
  "СРОЧНО: мама птица успешно съебалась от интерпола",
  "anonim пожертвовал 50 рублей: Спс за радио",
  "Слухи: маму птицу госпитализировали",
  "Литвин на кондициях могнул свою бабушку",
  "Бабу чай уволили: что будет дальше?",
  "Если хочешь увидеть здесь свой ник и сообщение, отправь любую сумму на Donation Alerts",
  "В Мурино прошёл конкурс на самый громкий ремикс"
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const shuffledNews = shuffleArray(news);

// ============================================
// АУДИО
// ============================================
const audioA = new Audio();
const audioB = new Audio();
audioA.crossOrigin = 'anonymous';
audioB.crossOrigin = 'anonymous';
audioA.preload = 'metadata';
audioB.preload = 'metadata';
audioA.volume = 0.8;
audioB.volume = 0;

let activePlayer = audioA;
let idlePlayer = audioB;
let currentVolume = 0.8;

const FADE_TIME = 1500;
const FADE_STEPS = 30;
const FADE_INTERVAL = FADE_TIME / FADE_STEPS;

let fadeTimer = null;

let audioCtx = null;
let masterGain = null;
let analyser = null;
let freqData = null;
let webAudioOk = false;

function initAudio() {
  if (!audioCtx) {
    let srcA = null;
    let srcB = null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();

      masterGain = audioCtx.createGain();
      masterGain.gain.value = 1;

      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.6;
      freqData = new Uint8Array(analyser.frequencyBinCount);

      srcA = audioCtx.createMediaElementSource(audioA);
      srcB = audioCtx.createMediaElementSource(audioB);
      srcA.connect(masterGain);
      srcB.connect(masterGain);
      masterGain.connect(analyser);
      analyser.connect(audioCtx.destination);

      webAudioOk = true;
    } catch (e) {
      console.warn('Web Audio не запустился:', e);
      webAudioOk = false;
      try { if (srcA) srcA.connect(audioCtx.destination); } catch (e2) {}
      try { if (srcB) srcB.connect(audioCtx.destination); } catch (e2) {}
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}

const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=';
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  for (const a of [audioA, audioB]) {
    a.muted = true;
    a.src = SILENT_WAV;
    const p = a.play();
    if (p && p.then) {
      p.then(() => { a.pause(); a.muted = false; })
       .catch(() => { a.muted = false; });
    } else {
      a.muted = false;
    }
  }
}

const MAX_LOAD_ATTEMPTS = 4;
const durationWarned = new Set();

function sourceFor(trackIndex, attempt) {
  return attempt > 0 ? playlist[trackIndex] + '&_r=' + attempt : playlist[trackIndex];
}

function detachPlayerHandlers(player) {
  if (player._onMeta) player.removeEventListener('loadedmetadata', player._onMeta);
  if (player._onErr) player.removeEventListener('error', player._onErr);
  player._onMeta = null;
  player._onErr = null;
}

function startPlayback(player, trackIndex, startAt, attempt = 0) {
  detachPlayerHandlers(player);

  const state = { trackIndex, attempt, t0: performance.now(), startAt };
  player._state = state;
  player.src = sourceFor(trackIndex, attempt);

  const seekAndPlay = () => {
    if (!isPlaying || player._state !== state) return;

    const real = player.duration;
    if (Number.isFinite(real) && Math.abs(real - trackDurations[trackIndex]) > 3 && !durationWarned.has(trackIndex)) {
      durationWarned.add(trackIndex);
      console.warn(`Трек ${trackIndex + 1}: файл ${real.toFixed(1)} с, в trackDurations ${trackDurations[trackIndex]} с`);
    }

    const want = startAt + (performance.now() - state.t0) / 1000;
    if (want > 0.5) {
      try { player.currentTime = want; } catch (e) {}
    }

    const pr = player.play();
    if (pr && pr.catch) {
      pr.catch((err) => {
        if (err && err.name === 'AbortError') return;
        onPlaybackFail(player, state, err);
      });
    }
  };

  player._onMeta = () => {
    player.removeEventListener('loadedmetadata', player._onMeta);
    seekAndPlay();
  };
  player._onErr = () => onPlaybackFail(player, state, player.error);

  player.addEventListener('loadedmetadata', player._onMeta);
  player.addEventListener('error', player._onErr);
}

function onPlaybackFail(player, state, err) {
  if (!isPlaying || player._state !== state) return;
  console.warn(`Трек ${state.trackIndex + 1}: ошибка (попытка ${state.attempt + 1}):`, err);

  if (err && err.name === 'NotAllowedError') {
    stopTimers();
    isPlaying = false;
    updatePlayIcon(false);
    nowPlaying.textContent = 'браузер заблокировал звук — нажми play';
    return;
  }

  const next = state.attempt + 1;
  if (next >= MAX_LOAD_ATTEMPTS) {
    nowPlaying.textContent = 'трек ' + (state.trackIndex + 1) + ' не загрузился';
    return;
  }

  setTimeout(() => {
    if (!isPlaying || player._state !== state) return;
    const cur = getCurrentTrack();
    if (!cur || cur.index !== state.trackIndex) return;
    startPlayback(player, state.trackIndex, cur.position, next);
  }, 400 * next);
}

function crossfadeTo(newSrc, targetVolume, startAt = 0, trackIndex = currentTrackIndex) {
  if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }

  const fadeOutPlayer = activePlayer;
  const fadeInPlayer = idlePlayer;

  fadeInPlayer.volume = 0;
  startPlayback(fadeInPlayer, trackIndex, startAt, 0);

  let step = 0;
  const fadeOutStart = fadeOutPlayer.volume;

  fadeTimer = setInterval(() => {
    step++;
    const progress = step / FADE_STEPS;

    fadeOutPlayer.volume = Math.max(0, fadeOutStart * (1 - progress));
    fadeInPlayer.volume = Math.min(targetVolume, targetVolume * progress);

    if (step >= FADE_STEPS) {
      clearInterval(fadeTimer);
      fadeTimer = null;
      detachPlayerHandlers(fadeOutPlayer);
      fadeOutPlayer._state = null;
      fadeOutPlayer.pause();
      fadeOutPlayer.volume = 0;
      try { fadeOutPlayer.currentTime = 0; } catch (e) {}

      activePlayer = fadeInPlayer;
      idlePlayer = fadeOutPlayer;
    }
  }, FADE_INTERVAL);
}

// ============================================
// ВИЗУАЛИЗАТОР — только когда играет
// ============================================
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

const BAR_COUNT = 24;
const BREAK_DROP = 0.12;
const PIECE_H = 4;
const GRAVITY = 0.45;
const MAX_PIECES_PER_BAR = 3;

let prevLevels = new Array(BAR_COUNT).fill(0);
let prevRaw = new Array(BAR_COUNT).fill(0);
const pieces = [];

function readSpectrum() {
  if (!webAudioOk || !analyser) return null;

  analyser.getByteFrequencyData(freqData);

  const usable = Math.min(freqData.length, 44);
  const out = new Array(BAR_COUNT);

  for (let i = 0; i < BAR_COUNT; i++) {
    const lo = Math.floor(Math.pow(i / BAR_COUNT, 1.7) * usable);
    const hi = Math.max(lo + 1, Math.floor(Math.pow((i + 1) / BAR_COUNT, 1.7) * usable));

    let sum = 0;
    let max = 0;
    for (let k = lo; k < hi; k++) {
      const v = freqData[k];
      sum += v;
      if (v > max) max = v;
    }
    const avg = sum / (hi - lo);
    const tilt = 0.8 + 0.6 * (i / BAR_COUNT);
    out[i] = Math.min(1, ((avg + max) / 2 / 255) * tilt);
  }
  return out;
}

let visualizerRunning = false;

function drawVisualizer() {
  if (!visualizerRunning) return;
  requestAnimationFrame(drawVisualizer);

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const raw = readSpectrum();
  const barWidth = w / BAR_COUNT;
  const bw = barWidth * 0.7;

  const gradient = ctx.createLinearGradient(0, h, 0, 0);
  gradient.addColorStop(0, '#d44020');
  gradient.addColorStop(1, '#f5a623');

  for (let i = 0; i < BAR_COUNT; i++) {
    const target = raw ? raw[i] : 0;
    const prev = prevLevels[i];

    const level = target >= prev ? target : Math.max(target, prev - 0.035);

    const x = i * barWidth + barWidth * 0.15;

    if (raw && prevRaw[i] - target > BREAK_DROP && prev > 0.2) {
      let count = 0;
      for (const p of pieces) if (p.bar === i) count++;
      if (count < MAX_PIECES_PER_BAR) {
        pieces.push({ bar: i, x, w: bw, y: h - Math.max(2, prev * h * 0.9), vy: 0 });
      }
    }

    const barHeight = Math.max(2, level * h * 0.9);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, h - barHeight, bw, barHeight);

    prevLevels[i] = level;
    prevRaw[i] = target;
  }

  ctx.fillStyle = '#f5a623';
  for (let k = pieces.length - 1; k >= 0; k--) {
    const p = pieces[k];
    p.vy += GRAVITY;
    p.y += p.vy;

    const barTop = h - Math.max(2, prevLevels[p.bar] * h * 0.9);
    if (p.y + PIECE_H >= barTop || p.y > h) {
      pieces.splice(k, 1);
      continue;
    }
    ctx.fillRect(p.x, p.y, p.w, PIECE_H);
  }
}

function startVisualizer() {
  if (visualizerRunning) return;
  visualizerRunning = true;
  requestAnimationFrame(drawVisualizer);
}

function stopVisualizer() {
  visualizerRunning = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  prevLevels = new Array(BAR_COUNT).fill(0);
  prevRaw = new Array(BAR_COUNT).fill(0);
  pieces.length = 0;
}

// стартовая плоская линия
ctx.fillStyle = '#f5a623';
for (let i = 0; i < BAR_COUNT; i++) {
  const barWidth = canvas.width / BAR_COUNT;
  ctx.fillRect(i * barWidth + barWidth * 0.15, canvas.height - 2, barWidth * 0.7, 2);
}

// ============================================
// ФОНОВЫЙ ШУМ — анимированный, но throttled (~8 fps) и в низком разрешении
// ============================================
const bgCanvas = document.getElementById('bgNoise');
const bgCtx = bgCanvas.getContext('2d');
const noiseToggle = document.getElementById('noiseToggle');
let noiseEnabled = true;
let noiseFrameId = null;
let lastNoiseDraw = 0;
const NOISE_INTERVAL = 125; // ~8 fps

function resizeBg() {
  // рисуем в низком разрешении — canvas растягивается через CSS
  const w = Math.min(window.innerWidth, 480);
  const h = Math.min(window.innerHeight, 480);
  bgCanvas.width = w;
  bgCanvas.height = h;
}
resizeBg();

let bgResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(bgResizeTimer);
  bgResizeTimer = setTimeout(resizeBg, 250);
});

let noiseBuffer = null;

function initNoiseBuffer() {
  const w = bgCanvas.width;
  const h = bgCanvas.height;
  const imageData = bgCtx.createImageData(w, h);
  noiseBuffer = new Uint32Array(imageData.data.buffer);
  return imageData;
}

function drawBgNoise(time) {
  if (!noiseEnabled) return;
  noiseFrameId = requestAnimationFrame(drawBgNoise);

  if (time - lastNoiseDraw < NOISE_INTERVAL) return;
  lastNoiseDraw = time;

  const w = bgCanvas.width;
  const h = bgCanvas.height;
  const imageData = bgCtx.createImageData(w, h);
  const buffer = new Uint32Array(imageData.data.buffer);

  for (let i = 0; i < buffer.length; i++) {
    const v = Math.random() * 255 | 0;
    buffer[i] = (255 << 24) | (v << 16) | (v << 8) | v;
  }

  bgCtx.putImageData(imageData, 0, 0);
}

function startNoise() {
  if (noiseFrameId) return;
  lastNoiseDraw = 0;
  noiseFrameId = requestAnimationFrame(drawBgNoise);
}

function stopNoise() {
  if (noiseFrameId) {
    cancelAnimationFrame(noiseFrameId);
    noiseFrameId = null;
  }
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
}

startNoise();

noiseToggle.addEventListener('click', () => {
  noiseEnabled = !noiseEnabled;
  if (noiseEnabled) {
    noiseToggle.classList.remove('off');
    noiseToggle.textContent = '◐';
    startNoise();
  } else {
    noiseToggle.classList.add('off');
    noiseToggle.textContent = '○';
    stopNoise();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopNoise();
  } else {
    if (noiseEnabled) startNoise();
  }
});

// ============================================
// БЕГУЩАЯ СТРОКА
// ============================================
const topNewsTrack = document.getElementById('topNewsTrack');

let newsQueue = [...shuffledNews];
let currentNewsIndex = 0;
let newsCounter = 0;
let weatherNewsPool = [];
let droppNewsQueue = [];

onValue(ref(db, 'radio/droppNews'), (snapshot) => {
  const data = snapshot.val() || {};
  const now = Date.now();
  const fresh = Object.values(data)
    .filter(item => item && item.text && (now - item.at) < 5 * 60 * 1000)
    .sort((a, b) => a.at - b.at);

  droppNewsQueue = fresh.map(item => '🎰 ' + item.text);
});

function showNextNews() {
  newsCounter++;

  let text = null;

  if (droppNewsQueue.length > 0) {
    text = droppNewsQueue.shift();
  }

  if (!text && newsCounter % 6 === 0 && weatherNewsPool.length > 0) {
    text = weatherNewsPool[Math.floor(Math.random() * weatherNewsPool.length)];
  }

  if (!text) {
    if (currentNewsIndex >= newsQueue.length) {
      newsQueue = shuffleArray(news);
      currentNewsIndex = 0;
    }
    text = newsQueue[currentNewsIndex];
    currentNewsIndex++;
  }

  topNewsTrack.innerHTML = '';
  topNewsTrack.classList.remove('slide');
  void topNewsTrack.offsetWidth;

  const span = document.createElement('span');
  span.textContent = text;
  topNewsTrack.appendChild(span);

  topNewsTrack.classList.add('slide');
}

showNextNews();
let newsInterval = setInterval(showNextNews, 30000);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(newsInterval);
    newsInterval = null;
  } else {
    if (!newsInterval) newsInterval = setInterval(showNextNews, 30000);
  }
});

// ============================================
// ЭЛЕМЕНТЫ
// ============================================
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const volume = document.getElementById('volume');
const nowPlaying = document.getElementById('nowPlaying');
const onlineCount = document.getElementById('onlineCount');

let isPlaying = false;
let currentTrackIndex = 0;
let currentTrackUrl = null;
let currentTrackStartedAt = 0;

function updatePlayIcon(playing) {
  if (playing) {
    playIcon.innerHTML = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';
  } else {
    playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
  }
}

// ============================================
// РАДИО
// ============================================
const playlistStartedAtRef = ref(db, 'radio/playlistStartedAt');
const serverOffsetRef = ref(db, '.info/serverTimeOffset');

const SYNC_INTERVAL = 30000;
const SYNC_TOLERANCE = 2;

let playlistStartedAt = null;
let serverOffset = 0;
let pendingPlay = false;
let trackTimer = null;
let syncTimer = null;

const offsetReady = new Promise((resolve) => {
  onValue(serverOffsetRef, (snap) => {
    serverOffset = snap.val() || 0;
    resolve();
  });
});

function serverNow() {
  return Date.now() + serverOffset;
}

function getCurrentTrack() {
  if (!playlistStartedAt) return null;

  const total = trackDurations.reduce((sum, d) => sum + d, 0);
  const elapsed = Math.max(0, (serverNow() - playlistStartedAt) / 1000);
  const lap = Math.floor(elapsed / total);
  let t = elapsed % total;

  for (let i = 0; i < trackDurations.length; i++) {
    if (t < trackDurations[i]) return { index: i, position: t, lap };
    t -= trackDurations[i];
  }
  return { index: 0, position: 0, lap };
}

function stopTimers() {
  clearTimeout(trackTimer);
  clearInterval(syncTimer);
  trackTimer = null;
  syncTimer = null;
}

function scheduleNextTrack(index, position) {
  clearTimeout(trackTimer);
  const remaining = Math.max(0, trackDurations[index] - position);
  trackTimer = setTimeout(onTrackEnd, remaining * 1000 + 50);
}

function onTrackEnd() {
  if (!isPlaying) return;
  const cur = getCurrentTrack();
  if (cur && cur.index === currentTrackIndex) {
    scheduleNextTrack(cur.index, cur.position);
    return;
  }
  tuneIn();
}

function tuneIn() {
  const cur = getCurrentTrack();
  if (!cur) {
    pendingPlay = true;
    updatePlayIcon(true);
    nowPlaying.textContent = 'подключаемся к эфиру...';
    return;
  }

  stopTimers();

  const { index, position } = cur;
  currentTrackIndex = index;
  currentTrackUrl = playlist[index];
  currentTrackStartedAt = serverNow() - position * 1000;

  crossfadeTo(currentTrackUrl, currentVolume, position, index);
  isPlaying = true;
  updatePlayIcon(true);
  nowPlaying.textContent = 'трек ' + (index + 1);

  startVisualizer();
  scheduleNextTrack(index, position);
  syncTimer = setInterval(checkSync, SYNC_INTERVAL);
}

function checkSync() {
  if (!isPlaying) return;
  const cur = getCurrentTrack();
  if (!cur) return;

  if (cur.index !== currentTrackIndex) {
    tuneIn();
    return;
  }

  const p = activePlayer;
  if (!fadeTimer && p.src) {
    if (p.paused && !p.ended) p.play().catch(() => {});
    if (!p.ended && Math.abs(p.currentTime - cur.position) > SYNC_TOLERANCE) {
      p.currentTime = cur.position;
    }
  }
  scheduleNextTrack(cur.index, cur.position);
}

function onPlayerEnded(player) {
  return () => {
    if (!player._state) return;
    if (player === activePlayer && isPlaying) {
      const cur = getCurrentTrack();
      if (cur && cur.index === currentTrackIndex && trackDurations[cur.index] - cur.position > 3) {
        console.warn(`Трек ${cur.index + 1} закончился раньше.`);
      }
      onTrackEnd();
    }
  };
}
audioA.addEventListener('ended', onPlayerEnded(audioA));
audioB.addEventListener('ended', onPlayerEnded(audioB));

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && isPlaying) {
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    checkSync();
  }
});

const WD_GRACE_MS = 10000;
const WD_STUCK_TICKS = 4;
let wdLastTime = -1;
let wdLastBuffered = -1;
let wdStuckTicks = 0;
let wdReloads = 0;
let wdTrack = -1;

setInterval(() => {
  if (document.hidden) return;

  if (audioCtx && audioCtx.state === 'suspended' && isPlaying) {
    audioCtx.resume().catch(() => {});
  }

  if (!isPlaying || fadeTimer) { wdLastTime = -1; wdStuckTicks = 0; return; }

  const p = activePlayer;
  if (!p._state || p.ended) return;

  if (wdTrack !== currentTrackIndex) {
    wdTrack = currentTrackIndex;
    wdReloads = 0;
    wdStuckTicks = 0;
    wdLastTime = -1;
    wdLastBuffered = -1;
  }

  if (performance.now() - p._state.t0 < WD_GRACE_MS) {
    wdLastTime = p.currentTime;
    wdStuckTicks = 0;
    return;
  }

  const bufEnd = p.buffered.length ? p.buffered.end(p.buffered.length - 1) : 0;
  const buffering = bufEnd > wdLastBuffered + 0.5;
  wdLastBuffered = bufEnd;

  const stuck = p.paused || p.currentTime === wdLastTime;
  wdLastTime = p.currentTime;

  if (!stuck || buffering) { wdStuckTicks = 0; return; }

  wdStuckTicks++;
  if (p.paused) p.play().catch(() => {});

  if (wdStuckTicks >= WD_STUCK_TICKS && wdReloads < 6) {
    wdStuckTicks = 0;
    wdReloads++;
    const cur = getCurrentTrack();
    if (cur && cur.index === currentTrackIndex) {
      console.warn(`Трек ${cur.index + 1}: завис, перезагружаю (${wdReloads})`);
      startPlayback(p, cur.index, cur.position, p._state.attempt + 1);
    }
  }
}, 2000);

function initPlaylistStart() {
  offsetReady
    .then(() => runTransaction(playlistStartedAtRef, (current) => current || serverNow()))
    .catch((e) => console.warn('Не удалось записать playlistStartedAt:', e));
}

onValue(playlistStartedAtRef, (snapshot) => {
  const value = snapshot.val();

  if (!value) {
    initPlaylistStart();
    return;
  }

  const changed = playlistStartedAt !== value;
  playlistStartedAt = value;

  if (pendingPlay) {
    pendingPlay = false;
    tuneIn();
  } else if (changed && isPlaying) {
    tuneIn();
  }
});

// ============================================
// ОНЛАЙН
// ============================================
const onlineRef = ref(db, 'online/' + myId);
const onlineListRef = ref(db, 'online');

set(onlineRef, { joinedAt: Date.now() });
onDisconnect(onlineRef).remove();

onValue(onlineListRef, (snapshot) => {
  const data = snapshot.val() || {};
  onlineCount.textContent = Object.keys(data).length;
});

window.addEventListener('beforeunload', () => {
  remove(onlineRef);
});

// ============================================
// ЧАТ + ГИФКИ
// ============================================
const chatRef = ref(db, 'chat');
const recentGifsRef = ref(db, 'radio/recentGifs');

const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const nicknameInput = document.getElementById('nicknameInput');
const nicknameDisplay = document.getElementById('nicknameDisplay');
const emojiBar = document.getElementById('emojiBar');

const gifBtn = document.getElementById('gifBtn');
const gifPanel = document.getElementById('gifPanel');
const gifPanelClose = document.getElementById('gifPanelClose');
const gifPanelGrid = document.getElementById('gifPanelGrid');
const gifUrlInput = document.getElementById('gifUrlInput');
const gifUrlAdd = document.getElementById('gifUrlAdd');

let nickname = localStorage.getItem('murino_nickname') || '';
if (nickname) {
  nicknameInput.value = nickname;
  nicknameDisplay.textContent = nickname;
}

nicknameInput.addEventListener('input', () => {
  nickname = nicknameInput.value.trim();
  localStorage.setItem('murino_nickname', nickname);
  nicknameDisplay.textContent = nickname || 'Гость';
});

emojiBar.addEventListener('click', (e) => {
  if (e.target.classList.contains('emoji-btn')) {
    chatInput.value += e.target.dataset.emoji;
    chatInput.focus();
  }
});

let recentGifs = [];

function isGifUrl(url) {
  return /^https?:\/\/(media\d*\.)?tenor\.com\/.+\.(gif|webp)$/i.test(url);
}

function normalizeGifUrl(url) {
  return url.trim().replace(/&amp;/g, '&');
}

function renderGifGrid() {
  if (!gifPanelGrid) return;
  gifPanelGrid.innerHTML = '';

  recentGifs.forEach(url => {
    const el = document.createElement('img');
    el.className = 'gif-thumb';
    el.src = url;
    el.alt = 'gif';
    el.loading = 'lazy';
    el.title = 'Отправить';
    el.addEventListener('click', () => sendGif(url));
    gifPanelGrid.appendChild(el);
  });

  STARTER_GIFS.forEach(url => {
    if (recentGifs.includes(url)) return;
    const el = document.createElement('img');
    el.className = 'gif-thumb';
    el.src = url;
    el.alt = 'gif';
    el.loading = 'lazy';
    el.title = 'Отправить';
    el.addEventListener('click', () => sendGif(url));
    gifPanelGrid.appendChild(el);
  });
}

function sendGif(url) {
  url = normalizeGifUrl(url);
  if (!isGifUrl(url)) {
    alert('Нужна ссылка с tenor.com, оканчивающаяся на .gif или .webp');
    return;
  }

  push(chatRef, {
    name: nickname || 'Гость',
    gif: url,
    ts: serverTimestamp()
  });

  runTransaction(recentGifsRef, (current) => {
    const list = Array.isArray(current) ? current : [];
    const filtered = list.filter(u => u !== url);
    filtered.unshift(url);
    return filtered.slice(0, 20);
  }).catch(() => {});

  closeGifPanel();
}

function openGifPanel() {
  if (!gifPanel) return;
  gifPanel.classList.add('active');
  renderGifGrid();
}

function closeGifPanel() {
  if (!gifPanel) return;
  gifPanel.classList.remove('active');
}

if (gifBtn) gifBtn.addEventListener('click', openGifPanel);
if (gifPanelClose) gifPanelClose.addEventListener('click', closeGifPanel);

if (gifUrlAdd && gifUrlInput) {
  gifUrlAdd.addEventListener('click', () => {
    const url = normalizeGifUrl(gifUrlInput.value);
    if (!isGifUrl(url)) {
      alert('Нужна ссылка с tenor.com, оканчивающаяся на .gif или .webp');
      return;
    }
    sendGif(url);
    gifUrlInput.value = '';
  });
  gifUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') gifUrlAdd.click();
  });
}

onValue(recentGifsRef, (snapshot) => {
  const data = snapshot.val();
  recentGifs = Array.isArray(data) ? data : [];
  if (gifPanel && gifPanel.classList.contains('active')) renderGifGrid();
});

document.addEventListener('click', (e) => {
  if (!gifPanel || !gifBtn) return;
  if (!gifPanel.classList.contains('active')) return;
  if (gifPanel.contains(e.target) || gifBtn.contains(e.target)) return;
  closeGifPanel();
});

let lastSentAt = 0;
const SPAM_COOLDOWN = 2000;

function updateSendButton() {
  const now = Date.now();
  const remaining = Math.max(0, SPAM_COOLDOWN - (now - lastSentAt));
  if (remaining > 0) {
    chatSend.disabled = true;
    chatSend.textContent = Math.ceil(remaining / 1000) + 'с';
  } else {
    chatSend.disabled = false;
    chatSend.textContent = '→';
  }
}

let sendBtnInterval = setInterval(updateSendButton, 200);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(sendBtnInterval);
    sendBtnInterval = null;
  } else {
    if (!sendBtnInterval) sendBtnInterval = setInterval(updateSendButton, 200);
  }
});

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  const now = Date.now();
  if (now - lastSentAt < SPAM_COOLDOWN) return;

  lastSentAt = now;

  push(chatRef, {
    name: nickname || 'Гость',
    text: text.slice(0, 200),
    ts: serverTimestamp()
  });

  chatInput.value = '';
  updateSendButton();
}

chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

onValue(chatRef, (snapshot) => {
  const data = snapshot.val() || {};
  const messages = Object.values(data)
    .sort((a, b) => (a.ts || 0) - (b.ts || 0))
    .slice(-50);

  chatMessages.innerHTML = '';
  for (const msg of messages) {
    const div = document.createElement('div');
    div.className = 'chat-msg';

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = msg.name || 'Гость';
    div.appendChild(name);

    if (msg.gif) {
      const img = document.createElement('img');
      img.className = 'chat-gif';
      img.src = msg.gif;
      img.alt = 'gif';
      img.loading = 'lazy';
      div.appendChild(img);
    } else {
      const text = document.createElement('span');
      text.textContent = msg.text || '';
      div.appendChild(text);
    }

    const time = document.createElement('span');
    time.className = 'time';
    if (msg.ts) {
      const d = new Date(msg.ts);
      time.textContent = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    }
    div.appendChild(time);

    chatMessages.appendChild(div);
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// ============================================
// КНОПКА PLAY
// ============================================
playBtn.addEventListener('click', () => {
  if (isPlaying || pendingPlay) {
    stopTimers();
    pendingPlay = false;
    activePlayer.pause();
    idlePlayer.pause();
    isPlaying = false;
    updatePlayIcon(false);
    nowPlaying.textContent = 'на паузе';
    stopVisualizer();
  } else {
    initAudio();
    unlockAudio();
    tuneIn();
  }
});

volume.addEventListener('input', () => {
  currentVolume = parseFloat(volume.value);
  activePlayer.volume = currentVolume;
  idlePlayer.volume = 0;
});

audioA.volume = 0.8;
audioB.volume = 0;

// ============================================
// ГОЛОСОВАНИЕ ЗА ПРОПУСК
// ============================================
const skipVoteRef = ref(db, 'radio/skipVote');
const skipBtn = document.getElementById('skipBtn');
const votePopup = document.getElementById('votePopup');
const votePopupClose = document.getElementById('votePopupClose');
const skipVoteBtn = document.getElementById('skipVoteBtn');
const voteInfo = document.getElementById('voteInfo');

let onlineNow = 1;
let lastSkipVoteData = {};

function currentVoteKey() {
  const cur = getCurrentTrack();
  return cur ? `t${cur.index}_${cur.lap}` : null;
}

skipBtn.addEventListener('click', () => {
  votePopup.classList.toggle('active');
});

votePopupClose.addEventListener('click', () => {
  votePopup.classList.remove('active');
});

document.addEventListener('click', (e) => {
  if (!votePopup.contains(e.target) && !skipBtn.contains(e.target)) {
    votePopup.classList.remove('active');
  }
});

onValue(onlineListRef, (snapshot) => {
  const data = snapshot.val() || {};
  onlineNow = Math.max(1, Object.keys(data).length);
  updateVoteUI();
});

function getRequiredVotes() {
  if (onlineNow <= 1) return 1;
  if (onlineNow === 2) return 2;
  if (onlineNow === 3) return 2;
  return Math.ceil(onlineNow * 0.75);
}

function updateVoteUI() {
  const key = currentVoteKey();
  const voteData = (key && lastSkipVoteData[key]) || {};
  const votes = voteData.votes ? Object.keys(voteData.votes).length : 0;
  const required = getRequiredVotes();
  const iVoted = !!(voteData.votes && voteData.votes[myId]);
  const isFinished = !!voteData.finished;

  voteInfo.innerHTML = `голосов: <b>${votes}</b> / ${required}`;

  if (isFinished) {
    skipVoteBtn.classList.add('voted');
    skipVoteBtn.disabled = true;
    skipVoteBtn.querySelector('.vote-text').textContent = 'Пропущено';
  } else if (iVoted) {
    skipVoteBtn.classList.remove('voted');
    skipVoteBtn.disabled = false;
    skipVoteBtn.querySelector('.vote-text').textContent = 'Отменить';
  } else {
    skipVoteBtn.classList.remove('voted');
    skipVoteBtn.disabled = false;
    skipVoteBtn.querySelector('.vote-text').textContent = 'Голосовать';
  }
}

skipVoteBtn.addEventListener('click', () => {
  const key = currentVoteKey();
  if (!key) return;

  const voteData = lastSkipVoteData[key] || {};
  if (voteData.finished) return;

  const iVoted = !!(voteData.votes && voteData.votes[myId]);
  const myVoteRef = ref(db, `radio/skipVote/${key}/votes/${myId}`);

  if (iVoted) {
    remove(myVoteRef);
  } else {
    set(myVoteRef, true);
    set(ref(db, `radio/skipVote/${key}/startedAt`), Date.now());
  }
});

onValue(skipVoteRef, (snapshot) => {
  lastSkipVoteData = snapshot.val() || {};
  updateVoteUI();

  const cur = getCurrentTrack();
  const key = currentVoteKey();
  if (!cur || !key) return;

  const voteData = lastSkipVoteData[key] || {};
  if (voteData.finished) return;

  const voteCount = voteData.votes ? Object.keys(voteData.votes).length : 0;
  const required = getRequiredVotes();

  if (voteCount > 0 && voteCount >= required) {
    const isRecent = Date.now() - (voteData.startedAt || 0) < 5 * 60 * 1000;
    if (isRecent) {
      set(ref(db, `radio/skipVote/${key}/finished`), true);
      forceSkipTrack(cur.index);
    }
  }
});

function forceSkipTrack(votedIndex) {
  offsetReady
    .then(() => runTransaction(playlistStartedAtRef, (current) => {
      if (!current) return current;

      const total = trackDurations.reduce((sum, d) => sum + d, 0);
      const elapsed = Math.max(0, (serverNow() - current) / 1000);
      let t = elapsed % total;
      let idx = 0;
      for (; idx < trackDurations.length; idx++) {
        if (t < trackDurations[idx]) break;
        t -= trackDurations[idx];
      }
      if (idx !== votedIndex) return current;

      const remaining = trackDurations[idx] - t;
      return current - Math.round((remaining + 0.05) * 1000);
    }))
    .catch((e) => console.warn('Не удалось пропустить трек:', e));
}

// ============================================
// РЕАКЦИИ
// ============================================
const reactionsRef = ref(db, 'radio/reactions');
const REACTION_TYPES = ['up', 'down'];
let lastReactionsData = {};

function currentReactionKey() {
  const cur = getCurrentTrack();
  return cur ? `t${cur.index}` : null;
}

function updateReactionsUI() {
  const key = currentReactionKey();
  const trackReactions = (key && lastReactionsData[key]) || {};
  const counts = { up: 0, down: 0 };

  for (const userVotes of Object.values(trackReactions)) {
    for (const type of REACTION_TYPES) {
      if (userVotes[type]) counts[type]++;
    }
  }

  document.querySelectorAll('.reaction-count').forEach(el => {
    el.textContent = counts[el.dataset.count] || 0;
  });

  const mine = trackReactions[myId] || {};
  document.querySelectorAll('.reaction-btn').forEach(btn => {
    btn.classList.toggle('active', !!mine[btn.dataset.reaction]);
  });
}

document.querySelectorAll('.reaction-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = currentReactionKey();
    if (!key) return;

    const type = btn.dataset.reaction;
    const mine = (lastReactionsData[key] && lastReactionsData[key][myId]) || {};

    if (mine[type]) {
      remove(ref(db, `radio/reactions/${key}/${myId}/${type}`));
    } else {
      const opposite = type === 'up' ? 'down' : 'up';
      remove(ref(db, `radio/reactions/${key}/${myId}/${opposite}`));
      set(ref(db, `radio/reactions/${key}/${myId}/${type}`), true);
    }
  });
});

onValue(reactionsRef, (snapshot) => {
  lastReactionsData = snapshot.val() || {};
  updateReactionsUI();
});

// ============================================
// ТОП
// ============================================
let topAllScores = [];

onValue(ref(db, 'radio/reactions'), (snapshot) => {
  const data = snapshot.val() || {};
  const scores = [];

  for (const [trackKey, users] of Object.entries(data)) {
    let upCount = 0, downCount = 0;
    for (const userVotes of Object.values(users)) {
      if (userVotes.up) upCount++;
      if (userVotes.down) downCount++;
    }
    const score = upCount - downCount;
    if (upCount > 0 || downCount > 0) {
      scores.push({ trackKey, score, upCount, downCount });
    }
  }

  scores.sort((a, b) => b.score - a.score);

  const best = scores.filter(s => s.score > 0).slice(0, 5);
  const worst = scores.filter(s => s.score <= 0).sort((a, b) => a.score - b.score).slice(0, 5);

  topAllScores = [...best, ...worst];

  renderTopList('topBestList', best, false, 1);
  renderTopList('topWorstList', worst, true, 6);
});

function renderTopList(elementId, items, isWorst, startRank) {
  const list = document.getElementById(elementId);
  if (!list) return;

  if (items.length === 0) {
    list.innerHTML = '<div class="top-empty">пока нет оценок</div>';
    return;
  }

  const maxAbs = Math.max(...items.map(i => Math.abs(i.score)), 1);
  list.innerHTML = '';

  items.forEach((item, i) => {
    const m = item.trackKey.match(/^t(\d+)$/);
    const trackNum = m ? parseInt(m[1]) + 1 : '?';

    const div = document.createElement('div');
    div.className = 'top-item';

    const rank = document.createElement('span');
    rank.className = 'top-rank';
    rank.textContent = '#' + (startRank + i);

    const label = document.createElement('span');
    label.className = 'top-track';
    label.textContent = 'трек ' + trackNum;

    const bar = document.createElement('div');
    bar.className = 'top-bar-fill';
    const inner = document.createElement('div');
    inner.className = 'top-bar-inner' + (isWorst ? ' down' : '');
    inner.style.width = Math.max(15, (Math.abs(item.score) / maxAbs) * 100) + '%';
    bar.appendChild(inner);

    const score = document.createElement('span');
    score.className = 'top-score';
    score.textContent = (item.score > 0 ? '+' : '') + item.score;

    div.appendChild(rank);
    div.appendChild(label);
    div.appendChild(bar);
    div.appendChild(score);
    list.appendChild(div);
  });
}

// ============================================
// СМЕНА ТРЕКА — ОБНОВЛЕНИЕ UI
// ============================================
let lastVoteKey = null;
let lastReactionKey = null;
let trackUiInterval = setInterval(() => {
  const vk = currentVoteKey();
  const rk = currentReactionKey();

  if (vk !== lastVoteKey) {
    lastVoteKey = vk;
    votePopup.classList.remove('active');
    updateVoteUI();
  }
  if (rk !== lastReactionKey) {
    lastReactionKey = rk;
    updateReactionsUI();
  }
}, 1000);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(trackUiInterval);
    trackUiInterval = null;
  } else {
    if (!trackUiInterval) {
      trackUiInterval = setInterval(() => {
        const vk = currentVoteKey();
        const rk = currentReactionKey();

        if (vk !== lastVoteKey) {
          lastVoteKey = vk;
          votePopup.classList.remove('active');
          updateVoteUI();
        }
        if (rk !== lastReactionKey) {
          lastReactionKey = rk;
          updateReactionsUI();
        }
      }, 1000);
    }
  }
});

// ============================================
// ПОГОДА
// ============================================
const weatherFxCanvas = document.createElement('canvas');
weatherFxCanvas.id = 'weatherFx';
document.body.appendChild(weatherFxCanvas);
const wfxCtx = weatherFxCanvas.getContext('2d');

function resizeWfx() {
  weatherFxCanvas.width = window.innerWidth;
  weatherFxCanvas.height = window.innerHeight;
}
resizeWfx();
window.addEventListener('resize', resizeWfx);

let weatherFxActive = null;
let weatherFxParticles = [];
let lightningTimer = null;
let weatherFxRunning = false;

function initWeatherFx(type) {
  weatherFxActive = type;
  weatherFxParticles = [];

  if (!type) {
    stopWeatherFx();
    return;
  }

  const w = weatherFxCanvas.width;
  const h = weatherFxCanvas.height;

  let count = 0;
  if (type === 'snow') count = Math.floor(w / 15);
  else if (type === 'rain') count = Math.floor(w / 8);
  else if (type === 'storm') count = Math.floor(w / 8);

  for (let i = 0; i < count; i++) {
    const isSnow = type === 'snow';
    weatherFxParticles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: isSnow ? (Math.random() - 0.5) * 0.6 : (Math.random() - 0.5) * 0.4,
      vy: isSnow ? (0.5 + Math.random() * 0.8) : (7 + Math.random() * 5),
      r: isSnow ? (1 + Math.random() * 2) : 1,
      len: isSnow ? 0 : (10 + Math.random() * 8),
      alpha: 0.35 + Math.random() * 0.5,
    });
  }

  if (lightningTimer) clearInterval(lightningTimer);
  if (type === 'storm') {
    lightningTimer = setInterval(() => {
      if (Math.random() < 0.25) flashLightning();
    }, 8000 + Math.random() * 7000);
  }

  startWeatherFx();
}

function stopWeatherFx() {
  weatherFxRunning = false;
  wfxCtx.clearRect(0, 0, weatherFxCanvas.width, weatherFxCanvas.height);
  if (lightningTimer) { clearInterval(lightningTimer); lightningTimer = null; }
}

function startWeatherFx() {
  if (weatherFxRunning) return;
  weatherFxRunning = true;
  requestAnimationFrame(drawWeatherFx);
}

function flashLightning() {
  const flash = document.createElement('div');
  flash.className = 'lightning-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.classList.add('show'), 30);
  setTimeout(() => {
    flash.classList.remove('show');
    setTimeout(() => flash.remove(), 400);
  }, 120);
}

function drawWeatherFx() {
  if (!weatherFxRunning) return;
  requestAnimationFrame(drawWeatherFx);

  if (!weatherFxActive || weatherFxParticles.length === 0) {
    wfxCtx.clearRect(0, 0, weatherFxCanvas.width, weatherFxCanvas.height);
    return;
  }

  const w = weatherFxCanvas.width;
  const h = weatherFxCanvas.height;
  wfxCtx.clearRect(0, 0, w, h);

  const isSnow = weatherFxActive === 'snow';

  for (const p of weatherFxParticles) {
    if (isSnow) {
      wfxCtx.beginPath();
      wfxCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      wfxCtx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      wfxCtx.fill();
    } else {
      wfxCtx.beginPath();
      wfxCtx.moveTo(p.x, p.y);
      wfxCtx.lineTo(p.x + p.vx * 2, p.y + p.len);
      wfxCtx.strokeStyle = `rgba(180, 200, 230, ${p.alpha})`;
      wfxCtx.lineWidth = 1;
      wfxCtx.stroke();
    }

    p.x += p.vx;
    p.y += p.vy;

    if (p.y > h + 20) {
      p.y = -20;
      p.x = Math.random() * w;
    }
    if (p.x < -20) p.x = w + 20;
    if (p.x > w + 20) p.x = -20;
  }
}

function setWeatherFx(code) {
  let type = null;

  if (code === 95 || code === 96 || code === 99) type = 'storm';
  else if ([51,53,55,61,63,65,80,81,82].includes(code)) type = 'rain';
  else if ([71,73,75,77,85,86].includes(code)) type = 'snow';

  if (type !== weatherFxActive) {
    initWeatherFx(type);
  }
}

async function loadMurinoWeather() {
  const lat = 60.051284;
  const lon = 30.438578;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe/Moscow`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const current = data.current;
    const temp = Math.round(current.temperature_2m);
    const code = current.weather_code;
    const wind = Math.round(current.wind_speed_10m);

    const weatherMap = {
      0: { icon: '☀️', desc: 'ясно' },
      1: { icon: '🌤️', desc: 'почти ясно' },
      2: { icon: '⛅', desc: 'переменная облачность' },
      3: { icon: '☁️', desc: 'пасмурно' },
      45: { icon: '🌫️', desc: 'туман' },
      48: { icon: '🌫️', desc: 'изморозь' },
      51: { icon: '🌦️', desc: 'слабая морось' },
      53: { icon: '🌦️', desc: 'морось' },
      55: { icon: '🌧️', desc: 'сильная морось' },
      61: { icon: '🌧️', desc: 'слабый дождь' },
      63: { icon: '🌧️', desc: 'дождь' },
      65: { icon: '🌧️', desc: 'сильный дождь' },
      71: { icon: '🌨️', desc: 'слабый снег' },
      73: { icon: '🌨️', desc: 'снег' },
      75: { icon: '❄️', desc: 'сильный снег' },
      77: { icon: '🌨️', desc: 'снежная крупа' },
      80: { icon: '🌦️', desc: 'ливень' },
      81: { icon: '🌧️', desc: 'сильный ливень' },
      82: { icon: '⛈️', desc: 'очень сильный ливень' },
      85: { icon: '🌨️', desc: 'снегопад' },
      86: { icon: '❄️', desc: 'сильный снегопад' },
      95: { icon: '⛈️', desc: 'гроза' },
      96: { icon: '⛈️', desc: 'гроза с градом' },
      99: { icon: '⛈️', desc: 'сильная гроза с градом' },
    };

    const weather = weatherMap[code] || { icon: '🌡️', desc: 'погода' };

    document.getElementById('weatherIcon').textContent = weather.icon;
    document.getElementById('weatherTemp').textContent = `${temp}°C`;
    document.getElementById('weatherDesc').textContent = weather.desc;

    weatherNewsPool = [
      `В Мурино сейчас ${weather.desc}, ${temp > 0 ? '+' : ''}${temp}°C`,
      `Погода в Мурино: ${weather.desc}, ветер ${wind} м/с`,
      `${temp > 0 ? '+' : ''}${temp}°C в Мурино — ${weather.desc}`,
      `На улицах Мурино ${weather.desc}, ${temp > 0 ? '+' : ''}${temp}°C. Одевайтесь по погоде`,
      `Синоптики сообщают: в Мурино ${weather.desc}, ${temp > 0 ? '+' : ''}${temp}°C`,
    ];

    setWeatherFx(code);
  } catch (e) {
    console.warn('Не удалось загрузить погоду:', e);
    document.getElementById('weatherDesc').textContent = 'ошибка загрузки';
  }
}

loadMurinoWeather();

let weatherInterval = setInterval(loadMurinoWeather, 30 * 60 * 1000);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (weatherInterval) { clearInterval(weatherInterval); weatherInterval = null; }
    stopWeatherFx();
  } else {
    if (!weatherInterval) weatherInterval = setInterval(loadMurinoWeather, 30 * 60 * 1000);
    loadMurinoWeather();
  }
});

// ============================================
// ИЗМЕРЕНИЕ ДЛИТЕЛЬНОСТЕЙ (dev)
// ============================================
window.measureRealDurations = async () => {
  const real = [];

  for (let i = 0; i < playlist.length; i++) {
    const d = await new Promise((resolve) => {
      const a = new Audio();
      a.crossOrigin = 'anonymous';
      a.preload = 'metadata';
      let finished = false;
      const done = (v) => {
        if (finished) return;
        finished = true;
        a.src = '';
        resolve(v);
      };
      a.addEventListener('loadedmetadata', () => {
        done(Number.isFinite(a.duration) ? Math.round(a.duration * 100) / 100 : null);
      });
      a.addEventListener('error', () => done(null));
      setTimeout(() => done(null), 20000);
      a.src = playlist[i];
    });
    real.push(d);
    console.log(`измерено ${i + 1}/${playlist.length}`);
  }

  console.log(JSON.stringify(real));

  const bad = real
    .map((r, i) => ({ track: i + 1, real: r, table: trackDurations[i] }))
    .filter(x => x.real === null || Math.abs(x.real - x.table) > 3);
  console.table(bad);

  return real;
};
