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

let myId = localStorage.getItem('murino_myId');
if (!myId) {
  myId = 'u_' + Math.random().toString(36).slice(2, 10);
  localStorage.setItem('murino_myId', myId);
}

// ============================================
// ПЛЕЙЛИСТ (81 трек, dbimg.app через прокси)
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
  47, 59, 99, 94, 72, 24, 60, 3600, 52, 66,
  18, 17, 45, 47, 67, 30, 51, 102, 26, 54,
  52, 33, 31, 33, 45, 33, 260, 1103, 198, 52, 3599
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
  "Fog украл колонку у бабуина и ушёл в туман",
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
  "В Мурино нашли гигантскую шаурму весом 20 кг",
  "В Мурино прошёл чемпионат по поеданию шаурмы",
  "В Мурино открыли шаурмичную в хрущёвке",
  "В Мурино приземлился НЛО, из него вышел диджей",
  "В Мурино нашли клад — 15 звёзд и старый пульт",
  "В Мурино открыли музей потерянных носков",
  "В Мурино построили небоскрёб из старых колонок",
  "В Мурино открыли первый в мире музей ремиксов",
  "В Мурино прошёл фестиваль старых кассет",
  "В Мурино прошёл конкурс на лучший ремикс",
  "В Мурино нашли старую кассету с неизвестным треком",
  "В Мурино прошёл фестиваль забытых мелодий",
  "Сезон общага вошёл в топ 3 лучших сезонов по меллстрою",
  "СРОЧНО: мама птица успешно съебалась от интерпола",
  "anonim пожертвовал 50 рублей. похлопаем герою",
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
// ДВА АУДИО (crossOrigin нужен для визуализатора)
// ============================================
const audioA = new Audio();
const audioB = new Audio();
audioA.crossOrigin = "anonymous";
audioB.crossOrigin = "anonymous";
audioA.volume = 0.8;
audioB.volume = 0;

let activePlayer = audioA;
let idlePlayer = audioB;
let currentVolume = 0.8;

const FADE_TIME = 1500;
const FADE_STEPS = 30;
const FADE_INTERVAL = FADE_TIME / FADE_STEPS;

let fadeTimer = null;

function crossfadeTo(newSrc, targetVolume, startAt = 0) {
  if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }

  const fadeOutPlayer = activePlayer;
  const fadeInPlayer = idlePlayer;

  fadeInPlayer.src = newSrc;
  fadeInPlayer.volume = 0;

  const onMeta = () => {
    fadeInPlayer.removeEventListener('loadedmetadata', onMeta);
    if (!isPlaying) return;
    fadeInPlayer.currentTime = startAt;
    fadeInPlayer.play().catch(() => {});
  };
  fadeInPlayer.addEventListener('loadedmetadata', onMeta);

  if (fadeInPlayer.readyState >= 1) {
    fadeInPlayer.currentTime = startAt;
    fadeInPlayer.play().catch(() => {});
  }

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
      fadeOutPlayer.pause();
      fadeOutPlayer.volume = 0;
      fadeOutPlayer.currentTime = 0;

      activePlayer = fadeInPlayer;
      idlePlayer = fadeOutPlayer;
    }
  }, FADE_INTERVAL);
}

// ============================================
// ВИЗУАЛИЗАТОР (Web Audio API, настоящий)
// ============================================
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

const BAR_COUNT = 24;
const MAX_PIECES = 8;
const GRAVITY = 0.4;
const PIECE_HEIGHT = 4;

let pieces = [];
let prevLevels = new Array(BAR_COUNT).fill(0);

function initPieces() {
  pieces = [];
  for (let i = 0; i < BAR_COUNT; i++) pieces.push([]);
}

let audioCtx, analyser, dataArray;

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;

    const srcA = audioCtx.createMediaElementSource(audioA);
    const srcB = audioCtx.createMediaElementSource(audioB);
    const merger = audioCtx.createGain();

    srcA.connect(merger);
    srcB.connect(merger);
    merger.connect(analyser);
    analyser.connect(audioCtx.destination);

    dataArray = new Uint8Array(analyser.frequencyBinCount);
    initPieces();
    drawVisualizer();
  } catch (e) {
    console.warn('Аудио-контекст не запустился:', e);
  }
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);
  if (!analyser) return;

  analyser.getByteFrequencyData(dataArray);

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const barWidth = w / BAR_COUNT;
  const step = Math.floor(dataArray.length / BAR_COUNT);

  const levels = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    let sum = 0;
    for (let j = 0; j < step; j++) sum += dataArray[i * step + j];
    levels[i] = (sum / step) / 255;
  }

  for (let i = 0; i < BAR_COUNT; i++) {
    const barPieces = pieces[i];
    const barX = i * barWidth + barWidth * 0.15;
    const bw = barWidth * 0.7;

    for (let k = barPieces.length - 1; k >= 0; k--) {
      const piece = barPieces[k];
      piece.y += piece.vy;
      piece.vy += GRAVITY;

      if (piece.y > h) {
        barPieces.splice(k, 1);
        continue;
      }

      const gradient = ctx.createLinearGradient(0, h, 0, 0);
      gradient.addColorStop(0, '#d44020');
      gradient.addColorStop(1, '#f5a623');
      ctx.fillStyle = gradient;
      ctx.fillRect(barX, piece.y, bw, PIECE_HEIGHT);
    }
  }

  for (let i = 0; i < BAR_COUNT; i++) {
    const level = levels[i];
    const barHeight = Math.max(2, level * h * 0.9);

    const x = i * barWidth + barWidth * 0.15;
    const y = h - barHeight;
    const bw = barWidth * 0.7;

    const gradient = ctx.createLinearGradient(0, h, 0, 0);
    gradient.addColorStop(0, '#d44020');
    gradient.addColorStop(1, '#f5a623');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, bw, barHeight);

    const prev = prevLevels[i];
    const diff = prev - level;

    if (diff > 0.08) {
      const topY = h - prev * h * 0.9;
      pieces[i].push({
        y: topY,
        vy: -1 - Math.random() * 1.5,
      });

      if (pieces[i].length > MAX_PIECES) {
        pieces[i].shift();
      }
    }

    prevLevels[i] = level;
  }
}

// ============================================
// ФОНОВЫЙ ШУМ
// ============================================
const bgCanvas = document.getElementById('bgNoise');
const bgCtx = bgCanvas.getContext('2d');
const noiseToggle = document.getElementById('noiseToggle');
let noiseEnabled = true;
let noiseFrameId = null;

function resizeBg() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
resizeBg();
window.addEventListener('resize', resizeBg);

function drawBgNoise() {
  if (!noiseEnabled) return;
  const w = bgCanvas.width;
  const h = bgCanvas.height;
  const imageData = bgCtx.createImageData(w, h);
  const buffer = new Uint32Array(imageData.data.buffer);

  for (let i = 0; i < buffer.length; i++) {
    const v = Math.random() * 255 | 0;
    buffer[i] = (255 << 24) | (v << 16) | (v << 8) | v;
  }

  bgCtx.putImageData(imageData, 0, 0);
  noiseFrameId = requestAnimationFrame(drawBgNoise);
}
drawBgNoise();

noiseToggle.addEventListener('click', () => {
  noiseEnabled = !noiseEnabled;
  if (noiseEnabled) {
    noiseToggle.classList.remove('off');
    noiseToggle.textContent = '◐';
    drawBgNoise();
  } else {
    noiseToggle.classList.add('off');
    noiseToggle.textContent = '○';
    cancelAnimationFrame(noiseFrameId);
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
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
setInterval(showNextNews, 30000);

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

  crossfadeTo(currentTrackUrl, currentVolume, position);
  isPlaying = true;
  updatePlayIcon(true);
  nowPlaying.textContent = 'трек ' + (index + 1);

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
    if (player === activePlayer && isPlaying) onTrackEnd();
  };
}
audioA.addEventListener('ended', onPlayerEnded(audioA));
audioB.addEventListener('ended', onPlayerEnded(audioB));

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && isPlaying) checkSync();
});

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
// ЧАТ
// ============================================
const chatRef = ref(db, 'chat');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const nicknameInput = document.getElementById('nicknameInput');
const nicknameDisplay = document.getElementById('nicknameDisplay');
const emojiBar = document.getElementById('emojiBar');

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
setInterval(updateSendButton, 200);

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

    const text = document.createElement('span');
    text.textContent = msg.text;

    const time = document.createElement('span');
    time.className = 'time';
    if (msg.ts) {
      const d = new Date(msg.ts);
      time.textContent = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    }

    div.appendChild(name);
    div.appendChild(text);
    div.appendChild(time);
    chatMessages.appendChild(div);
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// ============================================
// КНОПКА PLAY
// ============================================
playBtn.addEventListener('click', () => {
  initAudio();
  if (isPlaying || pendingPlay) {
    stopTimers();
    pendingPlay = false;
    activePlayer.pause();
    idlePlayer.pause();
    isPlaying = false;
    updatePlayIcon(false);
    nowPlaying.textContent = 'на паузе';
  } else {
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
// ГОЛОСОВАНИЕ ЗА ПРОПУСК ТРЕКА
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
// РЕАКЦИИ 👍 / 👎
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
// ТОП ЛУЧШИХ (1-5) И ХУДШИХ (6-10)
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
// СМЕНА ТРЕКА — ОБНОВЛЯЕМ UI
// ============================================
let lastVoteKey = null;
let lastReactionKey = null;
setInterval(() => {
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

// ============================================
// ПОГОДА + ПОГОДНЫЕ ЭФФЕКТЫ
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

function initWeatherFx(type) {
  weatherFxActive = type;
  weatherFxParticles = [];

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
drawWeatherFx();

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
setInterval(loadMurinoWeather, 30 * 60 * 1000);

// ============================================
// СЕКРЕТНАЯ ПАСХАЛКА
// ============================================
const logoEl = document.getElementById('logoEl');
const secretRoom = document.getElementById('secretRoom');
const secretText = document.getElementById('secretText');
const secretExit = document.getElementById('secretExit');
const treeWrap = document.getElementById('treeWrap');
const ptenecScreen = document.getElementById('ptenecScreen');

const treeFinished = localStorage.getItem('murino_tree_finished');

if (!treeFinished) {
  let visits = parseInt(localStorage.getItem('murino_visits') || '0');
  visits++;
  localStorage.setItem('murino_visits', visits.toString());

  const isThirdVisit = visits >= 3;
  const luckyRoll = Math.random() < 0.3;

  if (isThirdVisit && luckyRoll) {
    const clicksNeeded = Math.floor(Math.random() * 91) + 10;
    let clicksDone = 0;

    logoEl.classList.add('clickable');

    logoEl.addEventListener('click', () => {
      if (clicksDone >= clicksNeeded) return;
      clicksDone++;

      logoEl.style.transform = 'rotate(-1.5deg) scale(1.08)';
      setTimeout(() => {
        logoEl.style.transform = 'rotate(-1.5deg) scale(1)';
      }, 100);

      if (clicksDone >= clicksNeeded) {
        secretRoom.classList.add('active');
        logoEl.classList.remove('clickable');
        logoEl.style.textShadow = '';
        document.body.style.overflow = 'hidden';
      }
    });
  }
}

let treeClicks = 0;
if (treeWrap) {
  treeWrap.addEventListener('click', () => {
    treeClicks++;

    if (treeClicks === 1) {
      secretText.textContent = 'чтож, тут друн\nон дал вам чйцо';
      secretText.style.display = 'block';
    } else if (treeClicks === 2) {
      secretText.textContent = 'чтож, тут нету друна';
    }
  });
}

if (secretExit) {
  secretExit.addEventListener('click', () => {
    secretRoom.classList.remove('active');
    ptenecScreen.classList.add('active');
    localStorage.setItem('murino_tree_finished', '1');
  });
}
