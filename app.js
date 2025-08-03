/* =========================================================
   Slang Squares – Main Crossword Engine
   Progressive Hint System • Streak Tracking • PWA-Ready
   ========================================================= */

class CrosswordApp {
  /* ----------  GLOBAL STATE  ---------- */
  themes              = {};             // loaded from JSON file
  currentThemeKey     = 'Day 1';
  currentPuzzle       = null;

  /* ----------  RUNTIME STATE  ---------- */
  selectedCell        = null;
  selectedDirection   = 'across';       // or 'down'
  timerSecs           = 0;
  timerID             = null;
  isCompleted         = false;

  /* ----------  SETTINGS  ---------- */
  settings = {
    showTimer : true,
    allowHints: true,
    soundFX   : true,
    autoCheck : true
  };

  /* ----------  PROGRESSIVE HINT STATE  ---------- */
  game = {
    correctAnswers : 0,
    hintsUsed      : 0,
    maxHints       : 3,
    revealedWords  : [],
    streak         : parseInt(localStorage.getItem('sqStreak') || '0', 10),
    lastPlay       : localStorage.getItem('sqLastPlay') || ''
  };

  /* =========================================================
     INIT
     ========================================================= */
  constructor () {
    this.bootstrap();
  }

  async bootstrap () {
    await this.loadThemes();
    this.bindUI();
    this.loadTheme(this.currentThemeKey);
    this.startTimer();
    this.refreshHintPanels(true); // reset counts
    this.updateStreakDisplay();
  }

  /* ==================== STREAK MANAGEMENT ==================== */
  getStoredStreak() {
    return parseInt(localStorage.getItem('sqStreak') || '0', 10);
  }
  getLastPlayDate() {
    return localStorage.getItem('sqLastPlay') || '';
  }
  updateStreak(completed = false) {
    const today = new Date().toDateString();
    const lastPlay = this.getLastPlayDate();

    if (!completed) return;
    if (lastPlay === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastPlay === yesterday.toDateString()) {
      this.game.streak++;
    } else {
      this.game.streak = 1;
    }

    localStorage.setItem('sqStreak', this.game.streak);
    localStorage.setItem('sqLastPlay', today);

    this.game.maxHints = 3 + Math.floor(this.game.streak / 7);
    this.showStreakCelebration();
    this.updateStreakDisplay();
  }
  showStreakCelebration() {
    if (this.game.streak > 1) {
      this.showAchievement(`🔥 ${this.game.streak}-day streak!`, 'Extra hint unlocked!');
    }
  }
  updateStreakDisplay() {
    const streakEl = document.getElementById('streakCount');
    const hintsEl = document.getElementById('availableHints');
    if (streakEl) streakEl.textContent = this.game.streak;
    if (hintsEl) hintsEl.textContent = this.game.maxHints - this.game.hintsUsed;
  }

  /* ==================== PROGRESSIVE HINTS ==================== */
  updateProgressiveHints() {
    this.tier1Hints();
    this.tier2Reveals();
    this.tier3SmartHintUI();
  }

  tier1Hints() {
    const t1 = document.getElementById('tier1Hints');
    if (!t1) return;
    const theme = this.themes[this.currentThemeKey];
    const hintMap = {
      'Urban Dictionary Essentials': ['Street smarts & social currency', 'Think TikTok favourites…'],
      'TikTok Culture': ['Viral vibes & brain-rot energy', 'Think memes that broke the internet…']
    };
    const [vibe, breadcrumb] = hintMap[theme.theme] || ['Modern culture', 'Current trends…'];
    t1.innerHTML = `<div class="theme-vibe">✨ ${vibe}</div><div class="category-breadcrumb">💭 ${breadcrumb}</div>`;
  }

  tier2Reveals() {
    const box = document.getElementById('tier2Hints');
    if (!box) return;
    const { sample_words } = this.themes[this.currentThemeKey];
    const c = this.game.correctAnswers;
    let words = [];
    if (c >= 3) words.push(...sample_words.slice(0, 2));
    if (c >= 5) words.push(...sample_words.slice(2, 4));
    if (c >= 8) words.push(...sample_words.slice(4));
    this.game.revealedWords = words;
    box.innerHTML = `
      <h4>Earned Words <span>${c}/10</span></h4>
      <div>${words.map(w => `<span class="pill">${w}</span>`).join('')}</div>
      <small>${this.nextUnlockText(c)}</small>`;
  }
  nextUnlockText(c) {
    if (c < 3) return `${3 - c} to first reveal!`;
    if (c < 5) return `${5 - c} to next reveal!`;
    if (c < 8) return `${8 - c} to unlock all!`;
    return 'All unlocked! 🔥';
  }

  tier3SmartHintUI() {
    const btn = document.getElementById('smartHintBtn');
    if (!btn) return;
    const remaining = this.game.maxHints - this.game.hintsUsed;
    btn.disabled = remaining <= 0 || !this.selectedCell;
    btn.querySelector('span').textContent = remaining;
  }
  useSmartHint() {
    if (this.game.hintsUsed >= this.game.maxHints || !this.selectedCell) return;
    const r = parseInt(this.selectedCell.dataset.row, 10);
    const c = parseInt(this.selectedCell.dataset.col, 10);
    const answer = this.currentPuzzle.grid[r][c].toUpperCase();
    const inp = this.selectedCell.querySelector('input');
    if (inp.value) return;
    inp.value = answer;
    this.game.hintsUsed++;
    this.tier3SmartHintUI();
    this.showAchievement('💡 Hint used', 'First letter revealed');
  }

  refreshHintPanels(reset = false) {
    if (reset) {
      this.game.correctAnswers = 0;
      this.game.hintsUsed = 0;
    }
    this.tier1Hints();
    this.tier2Reveals();
    this.tier3SmartHintUI();
    this.updateStreakDisplay();
  }

  /* ===================================== */
  /* -------------  TIMER  -------------- */
  /* ===================================== */
  startTimer() {
    if (!this.settings.showTimer) return;
    this.timerID = setInterval(() => {
      this.timerSecs++;
      document.getElementById('timer').textContent = this.fmtTime(this.timerSecs);
    }, 1000);
  }
  fmtTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2,'0');
    const ss = (s % 60).toString().padStart(2,'0');
    return `${m}:${ss}`;
  }

  /* =========================================================
     UI & Event Binding
     ========================================================= */
  bindUI() {
    document.getElementById('themeSelect')?.addEventListener('change', e => this.loadTheme(e.target.value));
    document.getElementById('checkBtn')?.addEventListener('click', () => this.validateAll());
    document.getElementById('clearBtn')?.addEventListener('click', () => this.clearAll());
    document.getElementById('smartHintBtn')?.addEventListener('click', () => this.useSmartHint());
  }

  /* ====================  MAIN GAME SETUP =================== */
  // You should call generatePuzzle(), attach event listeners, etc.
  // Placeholder for your existing logic or initialization code.
  // For brevity, omitted here, but essential functions exist or will be adapted.
}

/* ====================  START APP  ==================== */
document.addEventListener('DOMContentLoaded', () => new CrosswordApp());
