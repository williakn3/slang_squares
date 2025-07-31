// Slang Squares – Main Application Logic with Progressive Hint System

class CrosswordApp {
  constructor() {
    /* -------------- CORE STATE -------------- */
    this.themes = {};
    this.currentTheme = 'Day 1';
    this.currentPuzzle = null;

    /* -------------- UI/Gameplay State -------------- */
    this.selectedCell = null;
    this.selectedWord = null;
    this.timer = 0;
    this.timerInterval = null;
    this.isCompleted = false;

    /* -------------- SETTINGS -------------- */
    this.settings = {
      showTimer: true,
      allowHints: true,
      soundEffects: true,
      autoCheck: true
    };

    /* -------------- PROGRESSIVE HINT STATE -------------- */
    this.gameState = {
      correctAnswers: 0,
      hintsUsed: 0,
      maxHints: 3,
      revealedWords: [],
      currentStreak: this.getStoredStreak(),
      lastPlayDate: this.getLastPlayDate()
    };

    this.init();
  }

  /* ==================== INITIALISATION ==================== */
  async init() {
    await this.loadThemes();
    this.setupEventListeners();
    this.initializeTheme();
    this.startTimer();
    this.updateProgressiveHints();
    this.updateStreakDisplay();
  }

  /* ==================== STREAK MANAGEMENT ==================== */
  getStoredStreak() {
    return parseInt(localStorage.getItem('slangSquaresStreak') || '0');
  }
  getLastPlayDate() {
    return localStorage.getItem('slangSquaresLastPlay') || '';
  }
  updateStreak(completed = false) {
    const today = new Date().toDateString();
    const lastPlay = this.getLastPlayDate();

    if (!completed) return;
    if (lastPlay === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastPlay === yesterday.toDateString()) {
      this.gameState.currentStreak++;
    } else {
      this.gameState.currentStreak = 1;
    }

    localStorage.setItem('slangSquaresStreak', this.gameState.currentStreak);
    localStorage.setItem('slangSquaresLastPlay', today);

    /* Reward: +1 max hint every 7-day streak */
    this.gameState.maxHints = 3 + Math.floor(this.gameState.currentStreak / 7);
    this.showStreakCelebration();
    this.updateStreakDisplay();
  }
  showStreakCelebration() {
    if (this.gameState.currentStreak > 1) {
      this.showAchievement(`🔥 ${this.gameState.currentStreak}-day streak!`, 'Extra hint unlocked!');
    }
  }
  updateStreakDisplay() {
    const streak = document.getElementById('streakCount');
    const hints = document.getElementById('availableHints');
    if (streak) streak.textContent = this.gameState.currentStreak;
    if (hints) hints.textContent = this.gameState.maxHints - this.gameState.hintsUsed;
  }

  /* ==================== PROGRESSIVE HINTS ==================== */
  updateProgressiveHints() {
    this.tier1Hints();
    this.tier2Reveals();
    this.tier3SmartHintUI();
  }

  /* ---- Tier 1: Subtle Theme Hints ---- */
  tier1Hints() {
    const target = document.getElementById('tier1Hints');
    if (!target) return;

    const { theme } = this.themes[this.currentTheme];
    const hintMap = {
      'Urban Dictionary Essentials': ['Street smarts & social currency', 'Think TikTok favourites…'],
      'TikTok Culture': ['Viral vibes & brain-rot energy', 'Think memes that broke the internet…']
    };
    const [vibe, breadcrumb] = hintMap[theme] || ['Modern culture essentials', 'Think current trends…'];

    target.innerHTML = `
      <div class="theme-vibe">✨ ${vibe}</div>
      <div class="category-breadcrumb">💭 ${breadcrumb}</div>
    `;
  }

  /* ---- Tier 2: Earned Word Reveals ---- */
  tier2Reveals() {
    const box = document.getElementById('tier2Hints');
    if (!box) return;

    const { sample_words } = this.themes[this.currentTheme];
    const c = this.gameState.correctAnswers;
    let words = [];
    if (c >= 3) words.push(...sample_words.slice(0, 2));
    if (c >= 5) words.push(...sample_words.slice(2, 4));
    if (c >= 8) words.push(...sample_words.slice(4));

    this.gameState.revealedWords = words;

    box.innerHTML = `
      <h4>Earned Words <span class="progress-badge">${c}/10</span></h4>
      <div class="revealed-words">
        ${words.map(w => `<span class="revealed-word">${w}</span>`).join('')}
      </div>
      <div class="next-unlock">${this.nextUnlockText(c)}</div>
    `;
  }
  nextUnlockText(c) {
    if (c < 3) return `${3 - c} more for first reveal!`;
    if (c < 5) return `${5 - c} more for next reveal!`;
    if (c < 8) return `${8 - c} more to unlock all!`;
    return 'All words unlocked! 🔥';
  }

  /* ---- Tier 3: Smart Hint Button ---- */
  tier3SmartHintUI() {
    const box = document.getElementById('tier3Hints');
    if (!box) return;

    const remaining = this.gameState.maxHints - this.gameState.hintsUsed;
    box.innerHTML = `
      <button id="smartHintBtn" class="smart-hint-btn ${remaining ? '' : 'disabled'}" ${remaining ? '' : 'disabled'}>
        💡 Smart Hint <span class="hint-count">${remaining}</span>
      </button>
      <div class="hint-recharge">+1 hint every 7-day streak</div>
    `;
    const btn = document.getElementById('smartHintBtn');
    if (btn) btn.onclick = () => this.useSmartHint();
  }
  useSmartHint() {
    if (!this.selectedWord) return;
    if (this.gameState.hintsUsed >= this.gameState.maxHints) return;

    const data =
      this.selectedWord.direction === 'across'
        ? this.currentPuzzle.across[this.selectedWord.number]
        : this.currentPuzzle.down[this.selectedWord.number];

    const reveal = (row, col, letter) => {
      const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      if (cell && !cell.textContent.trim()) {
        cell.textContent = letter;
        cell.classList.add('hint-revealed', 'pulse');
        return true;
      }
      return false;
    };

    let given = false;
    if (this.selectedWord.direction === 'across') {
      for (let i = 0; i < data.answer.length; i++)
        if (reveal(data.row, data.col + i, data.answer[i])) {
          given = true;
          break;
        }
    } else {
      for (let i = 0; i < data.answer.length; i++)
        if (reveal(data.row + i, data.col, data.answer[i])) {
          given = true;
          break;
        }
    }
    if (given) {
      this.gameState.hintsUsed++;
      this.updateProgressiveHints();
      this.updateProgress();
      this.playSound('hint');
      this.showAchievement('💡 Smart hint used!', 'Keep going!');
    }
  }

  /* ==================== ACHIEVEMENT POP-UPS ==================== */
  showAchievement(title, subtitle, dur = 2500) {
    const pop = document.createElement('div');
    pop.className = 'achievement-popup';
    pop.innerHTML = `<strong>${title}</strong><span>${subtitle}</span>`;
    document.body.appendChild(pop);
    requestAnimationFrame(() => pop.classList.add('show'));
    setTimeout(() => {
      pop.classList.remove('show');
      setTimeout(() => pop.remove(), 300);
    }, dur);
  }

  /* ==================== WORD CHECK OVERRIDE ==================== */
  checkWord(data, dir) {
    let answer = '';
    if (dir === 'across') {
      for (let i = 0; i < data.answer.length; i++)
        answer += (document.querySelector(`[data-row="${data.row}"][data-col="${data.col + i}"]`)?.textContent || '');
    } else {
      for (let i = 0; i < data.answer.length; i++)
        answer += (document.querySelector(`[data-row="${data.row + i}"][data-col="${data.col}"]`)?.textContent || '');
    }
    const correct = answer === data.answer;
    if (correct && answer.length === data.answer.length) {
      const prev = this.gameState.correctAnswers;
      this.gameState.correctAnswers++;
      if ([3, 5, 8].includes(this.gameState.correctAnswers) && this.gameState.correctAnswers > prev) {
        this.playSound('check');
        this.showAchievement('🎉 Milestone!', 'New words revealed!');
      }
      this.updateProgressiveHints();
    }
    return correct;
  }

  /* ==================== REMAINING METHODS ==================== */
  // ... keep all your existing methods (generatePuzzle, createGrid, etc.)
  // Just ensure any calls to updateSampleWords() are removed,
  // and call this.updateProgressiveHints() instead.

  /* ==================== THEME LOADER (UNCHANGED) ==================== */
  async loadThemes() {
    /* same as your existing loader … omitted for brevity */
  }

  /* ====== ensure init() and other functions call updateProgressiveHints ====== */
}

/* ====== START THE APP ====== */
document.addEventListener('DOMContentLoaded', () => new CrosswordApp());
