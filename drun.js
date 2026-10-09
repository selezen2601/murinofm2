import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, runTransaction, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtzE3NVFHFVYqDJprioaCjEhJu-RrBPAg",
  authDomain: "murino-fm-f887c.firebaseapp.com",
  databaseURL: "https://murino-fm-f887c-default-rtdb.firebaseio.com",
  projectId: "murino-fm-f887c",
  storageBucket: "murino-fm-f887c.firebasestorage.app",
  messagingSenderId: "579166745258",
  appId: "1:579166745258:web:9b406191155d8c018a96d3"
};

let app;
if (getApps().length === 0) app = initializeApp(firebaseConfig);
else app = getApps()[0];
const db = getDatabase(app);

let myId = localStorage.getItem('murino_myId');
if (!myId) {
  myId = 'u_' + Math.random().toString(36).slice(2, 10);
  localStorage.setItem('murino_myId', myId);
}

function getNickname() {
  return localStorage.getItem('murino_nickname') || 'Гость';
}

let serverOffset = 0;
onValue(ref(db, '.info/serverTimeOffset'), (snap) => {
  serverOffset = snap.val() || 0;
});
const serverNow = () => Date.now() + serverOffset;

const LOCATIONS = [
  { id: 'mytishchi',   name: 'Мытищи',             rarity: 0, weight: 1,  label: 'обычная' },
  { id: 'verhniy',     name: 'Верхний Новгород',   rarity: 1, weight: 2,  label: 'необычная' },
  { id: 'nijniy',      name: 'Нижний Новгород',    rarity: 2, weight: 4,  label: 'редкая' },
  { id: 'krasnoyarsk', name: 'Красноярск',         rarity: 3, weight: 8,  label: 'эпическая' },
  { id: 'obshaga',     name: 'Общага',             rarity: 4, weight: 16, label: 'легендарная' },
  { id: 'molochnoe',   name: 'Село Молочное',      rarity: 5, weight: 32, label: 'мифическая' },
  { id: 'murino',      name: 'Мурино',             rarity: 6, weight: 64, label: 'божественная' },
];

const RARITY_COLORS = [
  '#8a8a8a', '#3aa850', '#3a7bd5', '#8e44ad', '#e67e22', '#c0392b', '#f1c40f',
];

const MIN_RATED_TRACKS = 10;
const MAX_BET_ITEMS = 5;

let myInventory = {};
let ratedTracksCount = 0;
let betItems = [];
let selectedTarget = null;
let isSpinning = false;
let lastDailyBonus = 0;
let inventoryLoaded = false;
let dailyLoaded = false;
let dailyClaiming = false;
let permanentlyUnlocked = localStorage.getItem('murino_drun_unlocked') === '1';
let starterClaimed = localStorage.getItem('murino_drun_starter_claimed') === '1';

let currentMode = 'upgrade';
let exchangeFrom = null;
let exchangeTo = null;

const btn = document.getElementById('drungaderBtn');
const modal = document.getElementById('drungaderModal');
const closeBtn = document.getElementById('drungaderClose');
const lockedEl = document.getElementById('drungaderLocked');
const gameEl = document.getElementById('drungaderGame');
const invEl = document.getElementById('drunInventory');
const betEl = document.getElementById('drunBet');
const targetsEl = document.getElementById('drunTargets');
const spinBtn = document.getElementById('drunSpin');
const chanceEl = document.getElementById('drunChance');
const messageEl = document.getElementById('drunMessage');
const lockNeedEl = document.getElementById('drunLockedNeed');
const lockDoneEl = document.getElementById('drunLockedDone');
const lockBarEl = document.getElementById('drunLockedBar');
const betSumEl = document.getElementById('drunBetSum');
const wheelCanvas = document.getElementById('drunWheel');
const wheelCtx = wheelCanvas.getContext('2d');

const modeUpgradeBtn = document.getElementById('drunModeUpgrade');
const modeExchangeBtn = document.getElementById('drunModeExchange');
const ctxMenu = document.getElementById('drunContextMenu');

lockNeedEl.textContent = MIN_RATED_TRACKS;
document.getElementById('drunLockedTotal').textContent = MIN_RATED_TRACKS;

btn.addEventListener('click', () => {
  modal.classList.add('active');
  updateUILock();
  checkDailyBonus();
  checkStarterBonus();
});

closeBtn.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

const unlockedRef = ref(db, 'drungader/unlocked/' + myId);
const inventoryRef = ref(db, 'drungader/inventory/' + myId);
const dailyRef = ref(db, 'drungader/daily/' + myId);

onValue(ref(db, 'radio/reactions'), (snapshot) => {
  const all = snapshot.val() || {};
  const rated = new Set();
  for (const [trackKey, users] of Object.entries(all)) {
    const mine = users && users[myId];
    if (mine && (mine.up || mine.down)) rated.add(trackKey);
  }
  ratedTracksCount = rated.size;
  updateUILock();
});

onValue(unlockedRef, (snapshot) => {
  if (snapshot.val()) {
    permanentlyUnlocked = true;
    localStorage.setItem('murino_drun_unlocked', '1');
  }
  updateUILock();
});

onValue(inventoryRef, (snapshot) => {
  myInventory = snapshot.val() || {};
  inventoryLoaded = true;

  betItems = betItems.filter(id => myInventory[id] > 0);

  if (selectedTarget) {
    const t = LOCATIONS.find(l => l.id === selectedTarget);
    const betSum = getBetSum();
    if (!t || t.weight <= betSum) selectedTarget = null;
  }

  if (exchangeFrom && !(myInventory[exchangeFrom] > 0)) exchangeFrom = null;

  if (!isSpinning) {
    renderInventory();
    renderBet();
    renderTargets();
    renderExchange();
  }
  checkDailyBonus();
  checkStarterBonus();
});

onValue(dailyRef, (snapshot) => {
  lastDailyBonus = snapshot.val() || 0;
  dailyLoaded = true;
  checkDailyBonus();
});

function updateUILock() {
  if (ratedTracksCount >= MIN_RATED_TRACKS && !permanentlyUnlocked) {
    permanentlyUnlocked = true;
    localStorage.setItem('murino_drun_unlocked', '1');
    set(unlockedRef, true).catch(() => {});
    checkStarterBonus();
  }

  if (permanentlyUnlocked) {
    lockedEl.style.display = 'none';
    gameEl.style.display = 'grid';
  } else {
    lockedEl.style.display = 'flex';
    gameEl.style.display = 'none';
    lockDoneEl.textContent = ratedTracksCount;
    lockBarEl.style.width = Math.min(100, (ratedTracksCount / MIN_RATED_TRACKS) * 100) + '%';
  }
}

function checkStarterBonus() {
  if (!inventoryLoaded) return;
  if (!permanentlyUnlocked) return;
  if (starterClaimed) return;

  starterClaimed = true;
  localStorage.setItem('murino_drun_starter_claimed', '1');

  runTransaction(inventoryRef, (inv) => {
    const next = inv ? { ...inv } : {};
    next.mytishchi = (next.mytishchi || 0) + 1;
    return next;
  })
    .then((res) => {
      if (res.committed && messageEl) {
        messageEl.textContent = '🎁 Стартовый бонус: +1 Мытищи';
        messageEl.style.color = '#3aa850';
      }
    })
    .catch((e) => console.warn('Стартовый бонус:', e));
}

function checkDailyBonus() {
  if (!inventoryLoaded || !dailyLoaded || dailyClaiming || isSpinning) return;
  if (Object.keys(myInventory).length > 0) return;

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  if (now - lastDailyBonus < DAY) return;

  dailyClaiming = true;
  runTransaction(inventoryRef, (inv) => {
    if (inv && Object.keys(inv).length > 0) return inv;
    return { mytishchi: 1 };
  })
    .then((res) => { if (res.committed) return set(dailyRef, now); })
    .catch((e) => console.warn('Ежедневный бонус:', e))
    .finally(() => { dailyClaiming = false; });
}
setInterval(checkDailyBonus, 60 * 1000);

function renderInventory() {
  invEl.innerHTML = '';
  const owned = LOCATIONS.filter(loc => myInventory[loc.id] > 0);

  if (owned.length === 0) {
    invEl.innerHTML = '<div class="drungader-empty">пусто</div>';
    return;
  }

  owned.forEach(loc => {
    const count = myInventory[loc.id];
    const inBet = betItems.filter(id => id === loc.id).length;
    const available = count - inBet;

    const el = document.createElement('div');
    el.className = 'drungader-item' + (available <= 0 ? ' disabled' : '');
    el.style.borderColor = RARITY_COLORS[loc.rarity];
    el.innerHTML = `
      <span class="drungader-item-name" style="color:${RARITY_COLORS[loc.rarity]}">${loc.name}</span>
      <span class="drungader-item-count">×${available}</span>
    `;

    el.addEventListener('click', () => {
      if (currentMode !== 'upgrade') return;
      if (available <= 0) return;
      if (betItems.length >= MAX_BET_ITEMS) return;
      betItems.push(loc.id);
      renderInventory();
      renderBet();
      renderTargets();
    });

    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (available <= 0) return;
      openContextMenu(e.pageX, e.pageY, loc.id);
    });

    invEl.appendChild(el);
  });
}

function openContextMenu(x, y, locId) {
  ctxMenu.innerHTML = `
    <div class="drun-ctx-item" data-action="upgrade">В апгрейд</div>
    <div class="drun-ctx-item" data-action="exchange">Обменять</div>
  `;
  ctxMenu.style.left = x + 'px';
  ctxMenu.style.top = y + 'px';
  ctxMenu.classList.add('active');

  ctxMenu.querySelectorAll('.drun-ctx-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      closeContextMenu();

      if (action === 'upgrade') {
        if (betItems.length >= MAX_BET_ITEMS) return;
        betItems.push(locId);
        currentMode = 'upgrade';
        updateModeUI();
        renderInventory();
        renderBet();
        renderTargets();
      } else if (action === 'exchange') {
        currentMode = 'exchange';
        exchangeFrom = locId;
        exchangeTo = null;
        updateModeUI();
        renderExchange();
      }
    });
  });
}

function closeContextMenu() {
  ctxMenu.classList.remove('active');
}

document.addEventListener('click', (e) => {
  if (!ctxMenu.contains(e.target)) closeContextMenu();
});

function updateModeUI() {
  if (modeUpgradeBtn) modeUpgradeBtn.classList.toggle('active', currentMode === 'upgrade');
  if (modeExchangeBtn) modeExchangeBtn.classList.toggle('active', currentMode === 'exchange');

  const upgradePanel = document.getElementById('drunUpgradePanel');
  const exchangePanel = document.getElementById('drunExchangePanel');

  if (upgradePanel) upgradePanel.style.display = currentMode === 'upgrade' ? 'flex' : 'none';
  if (exchangePanel) exchangePanel.style.display = currentMode === 'exchange' ? 'flex' : 'none';
}

if (modeUpgradeBtn) {
  modeUpgradeBtn.addEventListener('click', () => {
    currentMode = 'upgrade';
    updateModeUI();
    renderInventory();
  });
}
if (modeExchangeBtn) {
  modeExchangeBtn.addEventListener('click', () => {
    currentMode = 'exchange';
    updateModeUI();
    renderInventory();
    renderExchange();
  });
}

function getBetSum() {
  return betItems.reduce((sum, id) => {
    const loc = LOCATIONS.find(l => l.id === id);
    return sum + (loc ? loc.weight : 0);
  }, 0);
}

function renderBet() {
  betEl.innerHTML = '';

  if (betItems.length === 0) {
    betEl.innerHTML = '<div class="drungader-empty">кликни по локации слева</div>';
    if (betSumEl) betSumEl.textContent = 'сумма: 0';
    return;
  }

  betItems.forEach((id, index) => {
    const loc = LOCATIONS.find(l => l.id === id);
    if (!loc) return;

    const el = document.createElement('div');
    el.className = 'drungader-item in-bet';
    el.style.borderColor = RARITY_COLORS[loc.rarity];
    el.innerHTML = `
      <span class="drungader-item-name" style="color:${RARITY_COLORS[loc.rarity]}">${loc.name}</span>
      <span class="drungader-item-remove">✕</span>
    `;
    el.querySelector('.drungader-item-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      betItems.splice(index, 1);
      renderInventory();
      renderBet();
      renderTargets();
    });
    betEl.appendChild(el);
  });

  if (betSumEl) betSumEl.textContent = 'сумма: ' + getBetSum();
}

function renderTargets() {
  targetsEl.innerHTML = '';

  const betSum = getBetSum();
  const possible = LOCATIONS.filter(l => l.weight > betSum);

  if (possible.length === 0) {
    targetsEl.innerHTML = '<div class="drungader-empty">нет доступных целей</div>';
    return;
  }

  possible.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'drungader-item' + (selectedTarget === loc.id ? ' selected' : '');
    el.style.borderColor = RARITY_COLORS[loc.rarity];
    el.innerHTML = `
      <span class="drungader-item-name" style="color:${RARITY_COLORS[loc.rarity]}">${loc.name}</span>
      <span class="drungader-item-chance">${getChance(betSum, loc.rarity)}%</span>
    `;
    el.addEventListener('click', () => {
      selectedTarget = loc.id;
      updateChance();
      renderTargets();
    });
    targetsEl.appendChild(el);
  });

  updateChance();
}

function getChance(betWeight, targetRarity) {
  const targetLoc = LOCATIONS.find(l => l.rarity === targetRarity);
  if (!targetLoc) return 0;

  const ratio = betWeight / targetLoc.weight;
  const chance = ratio * 100;

  return Math.max(0.5, Math.min(99, chance));
}

function updateChance() {
  const betSum = getBetSum();

  if (betItems.length === 0 || !selectedTarget) {
    chanceEl.textContent = '0%';
    spinBtn.disabled = true;
    return;
  }

  const targetLoc = LOCATIONS.find(l => l.id === selectedTarget);
  if (!targetLoc) {
    chanceEl.textContent = '0%';
    spinBtn.disabled = true;
    return;
  }

  const chance = getChance(betSum, targetLoc.rarity);
  chanceEl.textContent = (chance < 1 ? chance.toFixed(2) : Math.round(chance)) + '%';
  spinBtn.disabled = false;
}

function calcExchangeCount(fromLoc, toLoc) {
  let count = Math.floor(fromLoc.weight / toLoc.weight);
  if (toLoc.id === 'mytishchi') count *= 2;
  if (count <= 0) count = 1;
  return count;
}

function renderExchange() {
  const fromEl = document.getElementById('drunExchangeFrom');
  const toEl = document.getElementById('drunExchangeTo');
  const rateEl = document.getElementById('drunExchangeRate');
  const confirmBtn = document.getElementById('drunExchangeConfirm');

  if (!fromEl || !toEl) return;

  if (!exchangeFrom) {
    fromEl.innerHTML = '<div class="drungader-empty">правый клик → Обменять</div>';
  } else {
    const loc = LOCATIONS.find(l => l.id === exchangeFrom);
    fromEl.innerHTML = `
      <div class="drungader-item selected" style="border-color:${RARITY_COLORS[loc.rarity]}">
        <span class="drungader-item-name" style="color:${RARITY_COLORS[loc.rarity]}">${loc.name}</span>
        <span class="drungader-item-count">×${myInventory[loc.id]}</span>
      </div>
    `;
  }

  if (!exchangeFrom) {
    toEl.innerHTML = '<div class="drungader-empty">выбери что отдать</div>';
  } else {
    const fromLoc = LOCATIONS.find(l => l.id === exchangeFrom);
    const possible = LOCATIONS.filter(l => l.weight < fromLoc.weight);

    if (possible.length === 0) {
      toEl.innerHTML = '<div class="drungader-empty">некуда менять</div>';
    } else {
      toEl.innerHTML = '';
      possible.forEach(loc => {
        const count = calcExchangeCount(fromLoc, loc);

        const el = document.createElement('div');
        el.className = 'drungader-item' + (exchangeTo === loc.id ? ' selected' : '');
        el.style.borderColor = RARITY_COLORS[loc.rarity];
        el.innerHTML = `
          <span class="drungader-item-name" style="color:${RARITY_COLORS[loc.rarity]}">${loc.name}</span>
          <span class="drungader-item-chance">×${count}</span>
        `;
        el.addEventListener('click', () => {
          exchangeTo = loc.id;
          renderExchange();
        });
        toEl.appendChild(el);
      });
    }
  }

  if (exchangeFrom && exchangeTo) {
    const fromLoc = LOCATIONS.find(l => l.id === exchangeFrom);
    const toLoc = LOCATIONS.find(l => l.id === exchangeTo);
    const count = calcExchangeCount(fromLoc, toLoc);
    if (rateEl) rateEl.innerHTML = `1 <b>${fromLoc.name}</b> → <b>${count}</b> × ${toLoc.name}`;
    if (confirmBtn) confirmBtn.disabled = false;
  } else {
    if (rateEl) rateEl.textContent = '—';
    if (confirmBtn) confirmBtn.disabled = true;
  }
}

const exchangeConfirmBtn = document.getElementById('drunExchangeConfirm');
if (exchangeConfirmBtn) {
  exchangeConfirmBtn.addEventListener('click', () => {
    if (!exchangeFrom || !exchangeTo) return;

    const fromLoc = LOCATIONS.find(l => l.id === exchangeFrom);
    const toLoc = LOCATIONS.find(l => l.id === exchangeTo);
    if (!fromLoc || !toLoc) return;
    if (!(myInventory[fromLoc.id] > 0)) return;

    const count = calcExchangeCount(fromLoc, toLoc);
    if (count <= 0) return;

    runTransaction(inventoryRef, (inv) => {
      if (!inv || !(inv[fromLoc.id] > 0)) return inv;
      const next = { ...inv };
      next[fromLoc.id] -= 1;
      if (next[fromLoc.id] <= 0) delete next[fromLoc.id];
      next[toLoc.id] = (next[toLoc.id] || 0) + count;
      return next;
    })
      .then((res) => {
        if (!res.committed) {
          messageEl.textContent = 'Не удалось обменять';
          messageEl.style.color = '#c0392b';
          return;
        }
        messageEl.textContent = `Обмен: ${fromLoc.name} → ${count} × ${toLoc.name}`;
        messageEl.style.color = '#3aa850';

        exchangeFrom = null;
        exchangeTo = null;
        renderExchange();
        renderInventory();
      })
      .catch((e) => {
        console.warn('Обмен:', e);
        messageEl.textContent = 'Ошибка обмена';
        messageEl.style.color = '#c0392b';
      });
  });
}

function drawWheel(winPercent) {
  const w = wheelCanvas.width, h = wheelCanvas.height;
  const cx = w / 2, cy = h / 2, r = w / 2 - 10;

  wheelCtx.clearRect(0, 0, w, h);

  wheelCtx.beginPath();
  wheelCtx.moveTo(cx, cy);
  wheelCtx.arc(cx, cy, r, 0, Math.PI * 2);
  wheelCtx.fillStyle = '#2a1f14';
  wheelCtx.fill();

  const winAngle = (winPercent / 100) * Math.PI * 2;
  wheelCtx.beginPath();
  wheelCtx.moveTo(cx, cy);
  wheelCtx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + winAngle);
  wheelCtx.closePath();
  wheelCtx.fillStyle = '#3aa850';
  wheelCtx.fill();

  wheelCtx.beginPath();
  wheelCtx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  wheelCtx.fillStyle = '#f5eedc';
  wheelCtx.fill();
  wheelCtx.strokeStyle = '#2a1f14';
  wheelCtx.lineWidth = 3;
  wheelCtx.stroke();

  wheelCtx.beginPath();
  wheelCtx.arc(cx, cy, r, 0, Math.PI * 2);
  wheelCtx.strokeStyle = '#2a1f14';
  wheelCtx.lineWidth = 3;
  wheelCtx.stroke();
}

drawWheel(0);

function animateSpin(chance, win, onDone) {
  const winDeg = (chance / 100) * 360;
  const stopDeg = win
    ? Math.random() * winDeg
    : winDeg + Math.random() * (360 - winDeg);

  const totalRotation = 360 * 5 + stopDeg;
  const startAngle = -90;
  const duration = 3000;
  const startTime = performance.now();
  const marker = document.getElementById('drunMarker');

  function animate(time) {
    const t = Math.min(1, (time - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const angle = startAngle + totalRotation * eased;
    const rad = (angle * Math.PI) / 180;
    const cx = 140, cy = 140, r = 120;
    const x = cx + Math.cos(rad) * r;
    const y = cy + Math.sin(rad) * r;
    marker.style.left = (x / 280) * 100 + '%';
    marker.style.top = (y / 280) * 100 + '%';
    if (t < 1) requestAnimationFrame(animate);
    else onDone();
  }
  requestAnimationFrame(animate);
}

spinBtn.addEventListener('click', () => {
  if (currentMode !== 'upgrade') return;
  if (isSpinning) return;
  if (betItems.length === 0 || !selectedTarget) return;

  const targetLoc = LOCATIONS.find(l => l.id === selectedTarget);
  if (!targetLoc) return;

  const betSum = getBetSum();
  if (targetLoc.weight <= betSum) return;

  const betCounts = {};
  betItems.forEach(id => betCounts[id] = (betCounts[id] || 0) + 1);
  for (const [id, cnt] of Object.entries(betCounts)) {
    if (!(myInventory[id] >= cnt)) {
      betItems = [];
      selectedTarget = null;
      updateChance();
      renderInventory();
      renderBet();
      renderTargets();
      return;
    }
  }

  const chance = getChance(betSum, targetLoc.rarity);
  const win = Math.random() * 100 < chance;

  const consolation = (!win && betSum >= 4)
    ? (() => {
        let best = null;
        for (const loc of LOCATIONS) {
          if (loc.weight * 2 <= betSum && (!best || loc.weight > best.weight)) {
            best = loc;
          }
        }
        return best;
      })()
    : null;

  isSpinning = true;
  spinBtn.disabled = true;
  messageEl.textContent = '';
  drawWheel(chance);

  runTransaction(inventoryRef, (inv) => {
    if (!inv) return inv;
    const next = { ...inv };
    for (const [id, cnt] of Object.entries(betCounts)) {
      if (!(next[id] >= cnt)) return;
    }
    for (const [id, cnt] of Object.entries(betCounts)) {
      next[id] -= cnt;
      if (next[id] <= 0) delete next[id];
    }
    const gain = win ? targetLoc : consolation;
    if (gain) next[gain.id] = (next[gain.id] || 0) + 1;
    return next;
  })
    .then((res) => {
      if (!res.committed) {
        isSpinning = false;
        messageEl.textContent = 'Ставка недоступна';
        messageEl.style.color = '#c0392b';
        renderInventory(); renderBet(); renderTargets(); updateChance();
        return;
      }
      animateSpin(chance, win, () => finishSpin(win, betCounts, targetLoc, consolation));
    })
    .catch((e) => {
      console.warn('Крутка:', e);
      isSpinning = false;
      messageEl.textContent = 'Ошибка, попробуй ещё раз';
      messageEl.style.color = '#c0392b';
      renderInventory(); renderBet(); renderTargets(); updateChance();
    });
});

function finishSpin(win, betCounts, targetLoc, consolation) {
  if (win) {
    messageEl.textContent = `🎉 Выигрыш! Получено: ${targetLoc.name}`;
    messageEl.style.color = '#3aa850';
    if (targetLoc.rarity >= 2) {
      writeDroppNews(`${getNickname()} выбил ${targetLoc.name}!`);
    }
  } else if (consolation) {
    messageEl.textContent = `Утешительный: ${consolation.name}`;
    messageEl.style.color = '#e67e22';
  } else {
    messageEl.textContent = 'Проигрыш. Ничего не получено.';
    messageEl.style.color = '#c0392b';
  }

  isSpinning = false;
  betItems = [];
  selectedTarget = null;

  renderInventory();
  renderBet();
  renderTargets();
  updateChance();
  checkDailyBonus();
  checkStarterBonus();
}

function writeDroppNews(text) {
  push(ref(db, 'radio/droppNews'), { text, at: serverNow() })
    .catch((e) => console.warn('News:', e));
}

updateModeUI();
