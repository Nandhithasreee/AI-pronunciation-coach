// ===== STATE =====
const AUTH_STORAGE_KEY = 'ppro_accounts';
const USER_STORAGE_KEY = 'ppro_user';
const HISTORY_STORAGE_KEY = 'ppro_history';

let currentUser = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null');
let accounts    = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || '[]');
let history     = [];

function normalizeIdentifier(value) {
  return (value || '').trim().toLowerCase();
}
function getUserHistoryKey(user) {
  const base = (user?.email || user?.username || 'guest').toString().trim().toLowerCase();
  return `ppro_history_${base.replace(/[^a-z0-9]/g, '_') || 'guest'}`;
}
function loadUserHistory() {
  if (!currentUser) {
    history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    return;
  }
  const stored = localStorage.getItem(getUserHistoryKey(currentUser));
  history = stored ? JSON.parse(stored) : [];
}
function saveHistory() {
  if (currentUser) {
    localStorage.setItem(getUserHistoryKey(currentUser), JSON.stringify(history));
  } else {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }
}
function saveUser(u) {
  currentUser = u;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
  if (u) loadUserHistory(); else history = [];
}
function saveAccounts() {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(accounts));
}
function getAccountByIdentifier(identifier) {
  const key = normalizeIdentifier(identifier);
  if (!key) return null;
  return accounts.find(acc => normalizeIdentifier(acc.email) === key || normalizeIdentifier(acc.username) === key) || null;
}
function buildSessionUser(account) {
  return { id: account.id, name: account.name, email: account.email, username: account.username };
}

loadUserHistory();

const BADGES = [
  { id:'bronze', name:'Bronze Speaker',        icon:'🥉', req: h => h.filter(x => x.score >= 60).length >= 50 },
  { id:'silver', name:'Silver Speaker',        icon:'🥈', req: h => h.filter(x => x.score >= 60).length >= 200 },
  { id:'gold',   name:'Gold Speaker',          icon:'🥇', req: h => h.filter(x => x.score >= 60).length >= 500 },
  { id:'streak', name:'Consistency Champion',  icon:'⚡', req: h => getStreak(h) >= 7 },
  { id:'ace',    name:'Accuracy Expert',       icon:'🎯', req: h => h.length > 0 && h.reduce((a,b) => a + b.score, 0) / h.length >= 95 },
];

const PRONOUNCE_MAP = {
  spinach:'SPIN-itch', entrepreneur:'ON-truh-pruh-NUR', schedule:'SKED-jool',
  colonel:'KUR-nul', february:'FEB-roo-er-ee', wednesday:'WENZ-day',
  library:'LY-brer-ee', temperature:'TEM-pruh-chur', vegetable:'VEJ-tuh-bul',
  comfortable:'KUMF-ter-bul', nuclear:'NOO-klee-er', jewelry:'JOOL-ree',
  mischievous:'MIS-chuh-vus', pronunciation:'pruh-NUN-see-AY-shun',
  algorithm:'AL-guh-rith-um', particularly:'per-TIK-yuh-ler-lee',
  deteriorate:'duh-TEER-ee-uh-rayt', ambiguous:'am-BIG-yoo-us',
  black:'BLAK', white:'WYTE', through:'THROO', thought:'THAWT',
  though:'THOH', tough:'TUF',
};

// ===== STORAGE HELPERS =====
function saveHistory() {
  if (currentUser) {
    localStorage.setItem(getUserHistoryKey(currentUser), JSON.stringify(history));
  } else {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }
}
function saveUser(u) {
  currentUser = u;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
  if (u) loadUserHistory(); else history = [];
}

// ===== STREAK CALCULATOR =====
function getStreak(h) {
  if (!h.length) return 0;
  const days = [...new Set(h.map(x => x.date))].sort().reverse();
  if (days[0] !== new Date().toDateString()) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i-1]) - new Date(days[i])) / (1000 * 86400);
    if (diff === 1) streak++; else break;
  }
  return streak;
}

// ===== PAGE TRANSITIONS =====
function showPage(id) {
  const current = document.querySelector('.page.active');
  if (current) {
    current.classList.add('exit');
    setTimeout(() => {
      current.classList.remove('active', 'exit');
      current.style.display = 'none';
      doShow(id);
    }, 280);
  } else {
    doShow(id);
  }
}
function doShow(id) {
  const p = document.getElementById(id);
  p.style.display = 'flex';
  requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('active')));
  if (id === 'dashPage') renderDashboard();
}

// ===== THEME =====
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('ppro_theme', isDark ? 'light' : 'dark');
}
// Apply saved theme on load
(function () {
  const t = localStorage.getItem('ppro_theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
})();

// ===== TOAST =====
function toast(msg, type = 'success') {
  const icons = {
    success: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#43E97B" stroke-width="2"/><path d="M8 12l3 3 5-5" stroke="#43E97B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error:   '<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#FF6584" stroke-width="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="#FF6584" stroke-width="2" stroke-linecap="round"/></svg>',
    warning: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#FFB347" stroke-width="2" stroke-linecap="round"/></svg>',
  };
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = (icons[type] || '') + msg;
  c.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(40px)';
    t.style.transition = 'all 0.28s';
    setTimeout(() => t.remove(), 280);
  }, 3000);
}

// ===== AUTH HELPERS =====
function showTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((el, i) =>
    el.classList.toggle('active', (i === 0 && tab === 'signin') || (i === 1 && tab === 'signup'))
  );
  document.getElementById('signinForm').style.display  = tab === 'signin' ? 'block' : 'none';
  document.getElementById('signupForm').style.display  = tab === 'signup' ? 'block' : 'none';
}
function showForgot() {
  document.getElementById('authForms').style.display    = 'none';
  document.getElementById('forgotForm').style.display   = 'block';
  document.getElementById('forgotFormFields').style.display = 'block';
  document.getElementById('resetSuccess').style.display = 'none';
}
function showForms() {
  document.getElementById('authForms').style.display  = 'block';
  document.getElementById('forgotForm').style.display = 'none';
  showTab('signin');
}
function togglePw(id) {
  const el = document.getElementById(id);
  el.type = el.type === 'password' ? 'text' : 'password';
}
function checkPwStrength(v) {
  const bar = document.getElementById('pwBar');
  let s = 0;
  if (v.length >= 6)  s += 25;
  if (v.length >= 10) s += 25;
  if (/[A-Z]/.test(v)) s += 25;
  if (/[0-9!@#$]/.test(v)) s += 25;
  bar.style.width      = s + '%';
  bar.style.background = s <= 25 ? '#FF6584' : s <= 50 ? '#FFB347' : s <= 75 ? '#6C63FF' : '#43E97B';
}
function showErr(id, show, message = '') {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message;
    el.classList.toggle('show', show);
  }
  const inputId = id.replace('Err', '');
  const input = document.getElementById(inputId);
  if (input) input.classList.toggle('error', show);
}
function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

// ===== AUTH HANDLERS =====
function handleSignin(e) {
  e.preventDefault();
  const identifier = document.getElementById('siEmail').value.trim();
  const pw          = document.getElementById('siPassword').value;
  let ok = true;
  if (!identifier) { showErr('siEmailErr', true, 'Please enter your email or username.'); ok = false; } else showErr('siEmailErr', false);
  if (!pw)         { showErr('siPwErr', true, 'Please enter your password.'); ok = false; } else showErr('siPwErr', false);
  if (!ok) return;

  const account = getAccountByIdentifier(identifier);
  if (!account) {
    showErr('siEmailErr', true, 'No account found for this email or username.');
    return;
  }
  if (account.password !== pw) {
    showErr('siPwErr', true, 'Password is incorrect. Use Forgot Password to reset it.');
    return;
  }

  saveUser(buildSessionUser(account));
  toast('Welcome back! Signed in successfully.');
  goToLanding();
}
function handleSignup(e) {
  e.preventDefault();
  const name     = document.getElementById('suName').value.trim();
  const email    = document.getElementById('suEmail').value.trim();
  const username = document.getElementById('suUsername').value.trim();
  const pw       = document.getElementById('suPassword').value;
  const confirm  = document.getElementById('suConfirm').value;
  const terms    = document.getElementById('terms').checked;
  let ok = true;
  if (!name)              { showErr('suNameErr', true, 'Full name is required.'); ok = false; } else showErr('suNameErr', false);
  if (!validateEmail(email)) { showErr('suEmailErr', true, 'Enter a valid email address.'); ok = false; } else showErr('suEmailErr', false);
  if (!username)          { showErr('suUsernameErr', true, 'Username is required.'); ok = false; } else showErr('suUsernameErr', false);
  if (pw.length < 6)      { showErr('suPwErr', true, 'Password must be at least 6 characters.'); ok = false; } else showErr('suPwErr', false);
  if (pw !== confirm)     { showErr('suConfirmErr', true, 'Passwords do not match.'); ok = false; } else showErr('suConfirmErr', false);
  if (!terms)             { showErr('suTermsErr', true, 'Please accept the terms.'); ok = false; } else showErr('suTermsErr', false);
  if (!ok) return;

  const emailExists = accounts.some(acc => normalizeIdentifier(acc.email) === normalizeIdentifier(email));
  const usernameExists = accounts.some(acc => normalizeIdentifier(acc.username) === normalizeIdentifier(username));
  if (emailExists) {
    showErr('suEmailErr', true, 'An account with this email already exists.');
    return;
  }
  if (usernameExists) {
    showErr('suUsernameErr', true, 'This username is already taken.');
    return;
  }

  const newAccount = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password: pw,
  };
  accounts.push(newAccount);
  saveAccounts();
  saveUser(buildSessionUser(newAccount));
  toast('Account created! Welcome to PronouncePro AI.');
  goToLanding();
}
function handleGoogle() {
  const googleAccount = {
    id: `google_${Date.now()}`,
    name: 'Google User',
    email: 'google@user.com',
    username: 'googleuser',
    password: 'googleuser',
  };
  if (!accounts.some(acc => normalizeIdentifier(acc.email) === normalizeIdentifier(googleAccount.email))) {
    accounts.push(googleAccount);
    saveAccounts();
  }
  saveUser(buildSessionUser(googleAccount));
  toast('Signed in with Google.');
  goToLanding();
}
function handleReset(e) {
  e.preventDefault();
  const identifier = document.getElementById('fpIdentifier').value.trim();
  const pw         = document.getElementById('fpPw').value;
  const confirm    = document.getElementById('fpConfirm').value;
  let ok = true;
  if (!identifier) { showErr('fpIdentifierErr', true, 'Please enter your email or username.'); ok = false; } else showErr('fpIdentifierErr', false);
  if (pw.length < 6)  { showErr('fpPwErr', true, 'Password must be at least 6 characters.'); ok = false; } else showErr('fpPwErr', false);
  if (pw !== confirm) { showErr('fpConfirmErr', true, 'Passwords do not match.'); ok = false; } else showErr('fpConfirmErr', false);
  if (!ok) return;

  const account = getAccountByIdentifier(identifier);
  if (!account) {
    showErr('fpIdentifierErr', true, 'No account found for this email or username.');
    return;
  }

  account.password = pw;
  saveAccounts();
  document.getElementById('forgotFormFields').style.display = 'none';
  document.getElementById('resetSuccess').style.display     = 'block';
  toast('Password reset successful!');
}
function handleLogout() {
  saveUser(null);
  showPage('authPage');
  toast('Signed out.', 'warning');
}
function goToLanding() {
  if (currentUser) {
    document.getElementById('profileName').textContent   = currentUser.name  || 'User';
    document.getElementById('profileEmail').textContent  = currentUser.email || '';
    document.getElementById('profileAvatar').textContent = (currentUser.name || 'U')[0].toUpperCase();
  }
  showPage('landingPage');
}

// Auto-login if session exists
(function () { if (currentUser) { loadUserHistory(); goToLanding(); } })();

// ===== LEVENSHTEIN DISTANCE =====
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m+1 }, (_, i) =>
    Array.from({ length: n+1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}
function calcScore(expected, spoken) {
  const maxLen = Math.max(expected.length, spoken.length);
  if (!maxLen) return 100;
  return Math.max(0, Math.round((1 - levenshtein(expected.toLowerCase(), spoken.toLowerCase()) / maxLen) * 100));
}
function getFeedback(score) {
  if (score >= 95) return { label:'Excellent Pronunciation', icon:'🎉', tier:'excellent', color:'#1a9a52' };
  if (score >= 80) return { label:'Good Pronunciation',      icon:'👍', tier:'good',      color:'#6C63FF' };
  if (score >= 60) return { label:'Needs Improvement',       icon:'💪', tier:'improve',   color:'#b07200' };
  return               { label:'Practice Again',            icon:'🔁', tier:'retry',     color:'#c0365a' };
}
function getScoreColor(score) {
  if (score >= 95) return '#43E97B';
  if (score >= 80) return '#6C63FF';
  if (score >= 60) return '#FFB347';
  return '#FF6584';
}

// ===== EASY PRONUNCIATION GUIDE =====
function getEasyPronunciation(word) {
  return PRONOUNCE_MAP[word.toLowerCase()] ||
    word.toUpperCase().match(/.{1,3}/g).join('-');
}

// ===== LETTER COMPARISON =====
function buildLetterComparison(target, spoken) {
  const t = target.toLowerCase(), s = spoken.toLowerCase();
  let html = '';
  for (let i = 0; i < t.length; i++) {
    let cls = 'lc-correct';
    if (i >= s.length)    cls = 'lc-missing';
    else if (t[i] !== s[i]) cls = 'lc-wrong';
    html += `<span class="lc-char ${cls}">${t[i]}</span>`;
  }
  return html;
}

// ===== SCORE UI =====
function showScoreUI(score, spoken, target) {
  const box  = document.getElementById('scoreBox');
  const arc  = document.getElementById('scoreArc');
  const num  = document.getElementById('scoreNum');
  const fl   = document.getElementById('scoreFeedbackLabel');
  const sl   = document.getElementById('scoreSubLabel');
  const lcw  = document.getElementById('lcWord');
  const phb  = document.getElementById('pronounceHintBox');
  const phbv = document.getElementById('phbVal');

  box.classList.add('show');
  const color = getScoreColor(score);
  const fd    = getFeedback(score);
  const circumference = 188.5;

  arc.style.strokeDashoffset = circumference - (score / 100) * circumference;
  arc.style.stroke            = color;
  num.textContent             = score;
  num.style.color             = color;

  fl.innerHTML  = `<span style="font-size:1.1em;">${fd.icon}</span> <span style="color:${fd.color}">${fd.label}</span>`;
  sl.textContent = `Pronunciation Score: ${score}% similarity to "${target}"`;

  lcw.innerHTML = buildLetterComparison(target, spoken);
  phb.classList.add('show');
  phbv.textContent = getEasyPronunciation(target);
}

// ===== CONFETTI & APPLAUSE =====
function playApplause() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < 24; i++) {
      setTimeout(() => {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
        const d   = buf.getChannelData(0);
        for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * 0.35;
        const s = ctx.createBufferSource(), g = ctx.createGain();
        s.buffer = buf;
        g.gain.setValueAtTime(0.35, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
        s.connect(g); g.connect(ctx.destination); s.start();
      }, i * 55);
    }
  } catch (e) {}
}
function createConfetti() {
  const colors = ['#ff6b6b','#4ecdc4','#45b7d1','#f9ca24','#6c5ce7','#a29bfe','#fd79a8','#fdcb6e'];
  const shapes = ['2px','50%','0'];
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < 45; i++) {
      const c     = document.createElement('div');
      c.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      c.style.cssText = `background:${color};border-radius:${shape};top:${15 + Math.random() * 55}vh;`;
      if (side === 0) {
        c.style.left      = '0';
        c.style.animation = `confL ${1.6 + Math.random()}s ease-out ${Math.random() * 0.35}s forwards`;
      } else {
        c.style.right     = '0';
        c.style.animation = `confR ${1.6 + Math.random()}s ease-out ${Math.random() * 0.35}s forwards`;
      }
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3000);
    }
  }
  playApplause();
}

// ===== SPEECH SYNTHESIS =====
function speak(text) {
  return new Promise(res => {
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.onend = res;
    s.speak(u);
  });
}

// ===== DICTIONARY API =====
async function fetchPronunciation(word) {
  try {
    const res  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    let audioUrl = '';
    for (const entry of data)
      for (const ph of entry.phonetics || [])
        if (ph.audio) { audioUrl = ph.audio; break; }

    const pa = document.getElementById('practiceAudio');
    if (audioUrl) {
      pa.src = audioUrl; pa.style.display = 'block';
      await pa.play().catch(() => {});
    } else {
      pa.style.display = 'none';
      await speak(word);
    }
  } catch (e) {
    document.getElementById('practiceAudio').style.display = 'none';
    await speak(word);
  }
}

// ===== SPEECH RECOGNITION =====
const SPEAK_BTN_INNER =
  `<svg width="20" height="20" fill="none" viewBox="0 0 24 24">
    <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4z" stroke="currentColor" stroke-width="2"/>
    <path d="M19 10a7 7 0 01-14 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="8"  y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg> Speak Now`;

async function startRecognition() {
  const target = document.getElementById('targetWord').value.trim().toLowerCase();
  if (!target) { toast('Please enter a word first.', 'warning'); return; }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast('Speech recognition not supported.', 'error'); return; }

  const rec = new SR();
  rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;

  const btn = document.getElementById('speakBtn');
  const out = document.getElementById('practiceOutput');
  const la  = document.getElementById('listenAnim');
  const pb  = document.getElementById('pronounceBanner');
  const pbv = document.getElementById('pronounceBannerVal');
  const box = document.getElementById('scoreBox');
  const pa  = document.getElementById('practiceAudio');

  btn.disabled  = true;
  btn.innerHTML = '<svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.3"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg> Listening...';
  la.classList.remove('hide');
  out.innerHTML = '';
  box.classList.remove('show');
  pb.classList.remove('show');
  pa.style.display = 'none';

  rec.start();

  rec.onresult = async (event) => {
    const spoken = event.results[0][0].transcript.trim().toLowerCase();
    la.classList.add('hide');

    const score = calcScore(target, spoken);

    out.innerHTML = (spoken === target || score === 100)
      ? `<span style="color:var(--accent);font-weight:800;">You said: "${spoken}"</span>`
      : `<div class="spoken-result">You said: "${spoken}"</div><div class="spoken-expected">Expected: "${target}"</div>`;

    // Pronounced-as banner
    pbv.textContent = getEasyPronunciation(target);
    pb.classList.add('show');

    showScoreUI(score, spoken, target);

    // Save to history
    const now = new Date();
    history.unshift({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      word: target, spoken, score,
      date: now.toDateString(), time: now.toLocaleTimeString(),
      tier: getFeedback(score).tier,
    });
    saveHistory();

    if (score === 100 || spoken === target) {
      createConfetti();
      const mc = document.getElementById('mainContainer');
      mc.classList.add('success-pop');
      setTimeout(() => mc.classList.remove('success-pop'), 600);
      toast('Perfect pronunciation!');
      await speak('Excellent! You nailed it!');
    } else if (score >= 80) {
      toast('Good pronunciation! Keep it up.', 'success');
      await speak('Good job! Almost perfect.');
      setTimeout(() => fetchPronunciation(target), 500);
    } else {
      toast(`Score: ${score}%. Keep practicing!`, 'warning');
      await speak(`Not quite. Let me show you how to say ${target}`);
      setTimeout(() => fetchPronunciation(target), 500);
    }

    btn.disabled  = false;
    btn.innerHTML = SPEAK_BTN_INNER;
  };

  rec.onerror = async (ev) => {
    la.classList.add('hide');
    out.innerHTML = `<span style="color:var(--error)">Error: ${ev.error}</span>`;
    toast('Could not hear you. Try again.', 'error');
    await speak('Sorry, I did not catch that.');
    btn.disabled  = false;
    btn.innerHTML = SPEAK_BTN_INNER;
  };

  rec.onend = () => {
    la.classList.add('hide');
    if (btn.innerHTML.includes('Listening')) {
      btn.disabled  = false;
      btn.innerHTML = SPEAK_BTN_INNER;
    }
  };
}

// Enter key shortcut
document.getElementById('targetWord').addEventListener('keypress', e => {
  if (e.key === 'Enter') startRecognition();
});

// ===== REFRESH PRACTICE =====
function refreshPractice() {
  document.getElementById('targetWord').value       = '';
  document.getElementById('practiceOutput').innerHTML = '';
  document.getElementById('scoreBox').classList.remove('show');
  document.getElementById('pronounceBanner').classList.remove('show');
  document.getElementById('practiceAudio').style.display = 'none';
  document.getElementById('listenAnim').classList.add('hide');
  document.getElementById('pronounceHintBox').classList.remove('show');

  const btn     = document.getElementById('speakBtn');
  btn.disabled  = false;
  btn.innerHTML = SPEAK_BTN_INNER;

  document.getElementById('targetWord').focus();
  toast('Ready for a new word!', 'success');
}

// ===== DASHBOARD =====
function renderDashboard() {
  const total   = history.length;
  const avg     = total > 0 ? Math.round(history.reduce((a,b) => a + b.score, 0) / total) : 0;
  const days    = new Set(history.map(x => x.date)).size;
  const streak  = getStreak(history);
  const best    = total > 0 ? Math.max(...history.map(x => x.score)) : 0;

  document.getElementById('statTotal').textContent   = total;
  document.getElementById('statAvg').textContent     = avg + '%';
  document.getElementById('statSessions').textContent= days;
  document.getElementById('statStreak').textContent  = streak;
  document.getElementById('statBest').textContent    = best + '%';

  if (currentUser) {
    document.getElementById('profileName').textContent   = currentUser.name  || 'User';
    document.getElementById('profileEmail').textContent  = currentUser.email || '';
    document.getElementById('profileAvatar').textContent = (currentUser.name || 'U')[0].toUpperCase();
  }

  const bg = document.getElementById('badgeGrid');
  bg.innerHTML = '';
  BADGES.forEach(b => {
    const earned = b.req(history);
    bg.innerHTML += `<div class="badge-item ${earned ? 'earned' : 'locked'}">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
    </div>`;
  });

  drawCharts();
  renderHistory();
}

// ===== CHARTS =====
function drawCharts() {
  const isDark    = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.055)';
  const textColor = isDark ? '#9090b0' : '#999';

  const last10 = history.slice(0, 10).reverse();
  drawLine('trendChart',  last10.map((_, i) => `#${i+1}`), last10.map(x => x.score), '#6C63FF', gridColor, textColor);

  const dayLabels = [], dayCounts = [];
  for (let i = 6; i >= 0; i--) {
    const d  = new Date(); d.setDate(d.getDate() - i);
    dayLabels.push(d.toLocaleDateString('en', { weekday:'short' }));
    dayCounts.push(history.filter(x => x.date === d.toDateString()).length);
  }
  drawBar('dailyChart', dayLabels, dayCounts, '#a78bfa', gridColor, textColor);

  const wkLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const wkData   = wkLabels.map((_, i) => {
    const d   = new Date(); const day = d.getDay();
    const diff = i + 1 - day;
    const td  = new Date(d); td.setDate(d.getDate() + diff - (diff > 0 ? 7 : 0));
    const h   = history.filter(x => x.date === td.toDateString());
    return h.length ? Math.round(h.reduce((a,b) => a + b.score, 0) / h.length) : 0;
  });
  drawBar('weeklyChart', wkLabels, wkData, '#FF6584', gridColor, textColor);

  const excellent = history.filter(x => x.score >= 95).length;
  const good      = history.filter(x => x.score >= 80 && x.score < 95).length;
  const improve   = history.filter(x => x.score >= 60 && x.score < 80).length;
  const retry     = history.filter(x => x.score < 60).length;
  drawPie('pieChart', ['Excellent','Good','Improve','Retry'], [excellent,good,improve,retry],
    ['#43E97B','#6C63FF','#FFB347','#FF6584'], textColor);
}

function drawLine(id, labels, data, color, gridColor, textColor) {
  const canvas = document.getElementById(id); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 320, H = 150;
  canvas.width = W; canvas.height = H; ctx.clearRect(0,0,W,H);
  if (!data.length) { ctx.fillStyle = textColor; ctx.font = '13px Plus Jakarta Sans'; ctx.textAlign = 'center'; ctx.fillText('No data yet', W/2, H/2); return; }
  const pad = { t:18, r:18, b:28, l:38 };
  const cw  = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const xp  = i => pad.l + i / (labels.length - 1 || 1) * cw;
  const yp  = v => pad.t + ch - (v / 100) * ch;
  [0,25,50,75,100].forEach(v => {
    ctx.strokeStyle = gridColor; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
    ctx.beginPath(); ctx.moveTo(pad.l, yp(v)); ctx.lineTo(pad.l + cw, yp(v)); ctx.stroke();
    ctx.fillStyle = textColor; ctx.font = '10px Plus Jakarta Sans'; ctx.textAlign = 'right';
    ctx.fillText(v + '%', pad.l - 5, yp(v) + 4);
  });
  ctx.setLineDash([]);
  const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch);
  grad.addColorStop(0, color + '50'); grad.addColorStop(1, color + '00');
  ctx.beginPath();
  data.forEach((v,i) => i === 0 ? ctx.moveTo(xp(i), yp(v)) : ctx.lineTo(xp(i), yp(v)));
  ctx.lineTo(xp(data.length-1), H - pad.b); ctx.lineTo(xp(0), H - pad.b); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();
  ctx.beginPath();
  data.forEach((v,i) => i === 0 ? ctx.moveTo(xp(i), yp(v)) : ctx.lineTo(xp(i), yp(v)));
  ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
  data.forEach((v,i) => {
    ctx.beginPath(); ctx.arc(xp(i), yp(v), 4, 0, Math.PI*2);
    ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke();
  });
  labels.forEach((l,i) => { ctx.fillStyle = textColor; ctx.font = '10px Plus Jakarta Sans'; ctx.textAlign = 'center'; ctx.fillText(l, xp(i), H-7); });
}

function drawBar(id, labels, data, color, gridColor, textColor) {
  const canvas = document.getElementById(id); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 320, H = 150;
  canvas.width = W; canvas.height = H; ctx.clearRect(0,0,W,H);
  const pad  = { t:18, r:14, b:28, l:36 };
  const cw   = W - pad.l - pad.r, ch = H - pad.t - pad.b;
  const maxV = Math.max(...data, 1);
  const gap  = cw / labels.length;
  const barW = gap * 0.58;
  [0, Math.round(maxV/2), maxV].forEach(v => {
    const y = pad.t + ch - (v / maxV) * ch;
    ctx.strokeStyle = gridColor; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + cw, y); ctx.stroke();
    ctx.fillStyle = textColor; ctx.font = '10px Plus Jakarta Sans'; ctx.textAlign = 'right';
    ctx.fillText(v, pad.l - 4, y + 4);
  });
  ctx.setLineDash([]);
  data.forEach((v, i) => {
    const x = pad.l + i * gap + gap/2 - barW/2;
    const h = Math.max(v / maxV * ch, 2);
    const y = pad.t + ch - h;
    const grad = ctx.createLinearGradient(0, y, 0, y+h);
    grad.addColorStop(0, color); grad.addColorStop(1, color + '88');
    ctx.fillStyle = grad;
    const r = Math.min(5, h/2);
    ctx.beginPath();
    ctx.moveTo(x+r, y); ctx.lineTo(x+barW-r, y); ctx.quadraticCurveTo(x+barW, y, x+barW, y+r);
    ctx.lineTo(x+barW, y+h); ctx.lineTo(x, y+h); ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = textColor; ctx.font = '10px Plus Jakarta Sans'; ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW/2, H-7);
  });
}

function drawPie(id, labels, data, colors, textColor) {
  const canvas = document.getElementById(id); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 320, H = 150;
  canvas.width = W; canvas.height = H; ctx.clearRect(0,0,W,H);
  const total = data.reduce((a,b) => a+b, 0);
  if (!total) { ctx.fillStyle = textColor; ctx.font = '13px Plus Jakarta Sans'; ctx.textAlign = 'center'; ctx.fillText('No data yet', W/2, H/2); return; }
  const cx = W * 0.36, cy = H/2, r = Math.min(cx, cy) * 0.8;
  let angle = -Math.PI / 2;
  data.forEach((v, i) => {
    if (!v) return;
    const sweep = v / total * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, angle, angle + sweep); ctx.closePath();
    ctx.fillStyle = colors[i]; ctx.fill(); ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke();
    angle += sweep;
  });
  labels.forEach((l, i) => {
    const lx = W * 0.7, ly = H * 0.16 + i * 27;
    ctx.fillStyle = colors[i]; ctx.fillRect(lx, ly-9, 13, 13);
    ctx.fillStyle = textColor; ctx.font = '11px Plus Jakarta Sans'; ctx.textAlign = 'left';
    ctx.fillText(`${l} (${data[i]})`, lx + 18, ly + 1);
  });
}

function getHistoryEntryKey(item, index) {
  return item.id || `${item.word}-${item.spoken}-${item.date}-${item.time}-${index}`;
}
function deleteHistoryEntry(entryKey) {
  history = history.filter((item, index) => getHistoryEntryKey(item, index) !== entryKey);
  saveHistory();
  renderDashboard();
  toast('History entry deleted.', 'warning');
}

// ===== HISTORY TABLE =====
function renderHistory() {
  const q      = document.getElementById('histSearch').value.toLowerCase();
  const sort   = document.getElementById('histSort').value;
  const filter = document.getElementById('histFilter').value;

  let items = [...history];
  if (q)           items = items.filter(x => x.word.includes(q) || x.spoken.includes(q));
  if (filter !== 'all') items = items.filter(x => x.tier === filter);
  if (sort === 'highest') items.sort((a,b) => b.score - a.score);
  else if (sort === 'lowest') items.sort((a,b) => a.score - b.score);

  const body = document.getElementById('historyBody');
  if (!items.length) {
    body.innerHTML = '<div class="no-history">No practice history yet. Start practicing to see your results here.</div>';
    return;
  }
  body.innerHTML = `
    <table class="history-table">
      <thead><tr><th>Word</th><th>You Said</th><th>Score</th><th>Result</th><th>Date</th><th>Time</th><th>Action</th></tr></thead>
      <tbody>${items.slice(0,50).map((x, index) => {
        const fd = getFeedback(x.score);
        const entryKey = getHistoryEntryKey(x, index);
        return `<tr>
          <td><strong style="color:var(--text);font-weight:700;">${x.word}</strong></td>
          <td>${x.spoken}</td>
          <td><span class="score-badge sb-${x.tier}">${x.score}%</span></td>
          <td><span class="score-badge sb-${x.tier}">${fd.label}</span></td>
          <td style="color:var(--text3)">${x.date}</td>
          <td style="color:var(--text3)">${x.time}</td>
          <td><button type="button" class="history-delete-btn" onclick="deleteHistoryEntry('${entryKey.replace(/'/g, "\\'")}' )">Delete</button></td>
        </tr>`;
      }).join('')}</tbody>
    </table>`;
}

// Redraw charts when theme changes
new MutationObserver(() => {
  if (document.getElementById('dashPage').classList.contains('active')) drawCharts();
}).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });