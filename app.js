/* =========================================================
   Slang Squares – Complete Crossword Engine
   Progressive Hint System • Streak Tracking • PWA-Ready
   ========================================================= */

class CrosswordApp {
  /* ----------  GLOBAL STATE  ---------- */
  themes              = {};
  currentThemeKey     = 'Day 1';
  currentPuzzle       = null;

  /* ----------  RUNTIME STATE  ---------- */
  selectedCell        = null;
  selectedDirection   = 'across';
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
    this.refreshHintPanels();
    this.updateStreakDisplay();
  }

  /* =========================================================
     LOAD THEMES & PUZZLE
     ========================================================= */
  async loadThemes () {
    try {
      const res = await fetch('/crossword_themes.json');
      this.themes = await res.json();
    } catch (error) {
      console.error('Failed to load themes:', error);
      // Fallback themes
      this.themes = {
        'Day 1': {
          theme: 'Urban Dictionary Essentials',
          description: 'Basic slang terms every millennial and Gen Z should know',
          sample_words: ['RIZZ', 'BUSSIN', 'SLAY', 'STAN', 'SIMP', 'VIBES', 'FIRE', 'CRINGE', 'ICONIC', 'FLEX']
        }
      };
    }
  }

  async loadTheme (key) {
    this.currentThemeKey = key;
    const themeObj = this.themes[key];
    
    try {
      const puzzle = await fetch(`/puzzles/${key.replace(' ', '_')}.json`)
        .then(r => r.json())
        .catch(() => fetch('/sample_crossword.json').then(r => r.json()));
      
      this.currentPuzzle = puzzle;
      this.renderPuzzle(themeObj, this.currentPuzzle);
      this.refreshHintPanels(true);
    } catch (error) {
      console.error('Failed to load puzzle:', error);
      this.generateFallbackPuzzle(themeObj);
    }
  }

  generateFallbackPuzzle(themeObj) {
    // Create a simple fallback puzzle if loading fails
    const fallbackPuzzle = {
      theme: themeObj?.theme || 'Urban Dictionary Essentials',
      size: { rows: 15, cols: 15 },
      grid: this.createEmptyGrid(15, 15),
      across: {
        "1": { clue: "Charisma or charm", answer: "RIZZ", row: 1, col: 1 },
        "5": { clue: "Extremely good", answer: "BUSSIN", row: 1, col: 6 },
        "8": { clue: "Do something well", answer: "SLAY", row: 3, col: 1 }
      },
      down: {
        "1": { clue: "The atmosphere", answer: "VIBES", row: 1, col: 1 },
        "2": { clue: "Excellent", answer: "FIRE", row: 1, col: 2 },
        "3": { clue: "Embarrassing", answer: "CRINGE", row: 1, col: 3 }
      }
    };
    
    // Fill the grid with the words
    this.fillGridWithWords(fallbackPuzzle);
    
    this.currentPuzzle = fallbackPuzzle;
    this.renderPuzzle(themeObj, this.currentPuzzle);
    this.refreshHintPanels(true);
  }

  createEmptyGrid(rows, cols) {
    const grid = [];
    for (let i = 0; i < rows; i++) {
      grid[i] = [];
      for (let j = 0; j < cols; j++) {
        grid[i][j] = '#';
      }
    }
    return grid;
  }

  fillGridWithWords(puzzle) {
    // Place across words
    Object.values(puzzle.across || {}).forEach(clue => {
      const {answer, row, col} = clue;
      for (let i = 0; i < answer.length; i++) {
        if (col + i < puzzle.size.cols) {
          puzzle.grid[row][col + i] = answer[i];
        }
      }
    });

    // Place down words
    Object.values(puzzle.down || {}).forEach(clue => {
      const {answer, row, col} = clue;
      for (let i = 0; i < answer.length; i++) {
        if (row + i < puzzle.size.rows) {
          puzzle.grid[row + i][col] = answer[i];
        }
      }
    });
  }

  /* =========================================================
     RENDER 15×15 GRID & CLUES
     ========================================================= */
  renderPuzzle (theme = {}, data) {
    const gridEl = document.getElementById('crosswordGrid');
    const acrossEl = document.getElementById('cluesAcross');
    const downEl = document.getElementById('cluesDown');
    
    if (!gridEl) {
      console.error('Missing crosswordGrid element');
      return;
    }

    // Clear existing content
    gridEl.innerHTML = '';
    if (acrossEl) acrossEl.innerHTML = '';
    if (downEl) downEl.innerHTML = '';

    // Update theme info
    const titleEl = document.getElementById('puzzle-title');
    const descEl = document.getElementById('puzzle-description');
    if (titleEl) titleEl.textContent = theme.theme || 'Crossword Puzzle';
    if (descEl) descEl.textContent = theme.description || 'Complete the puzzle';

    // Ensure we have puzzle data
    if (!data || !data.grid) {
      console.error('No puzzle data or grid found');
      return;
    }

    // Build grid cells
    const {rows, cols} = data.size || {rows: 15, cols: 15};
    gridEl.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    gridEl.style.gridTemplateRows = `repeat(${rows}, 30px)`;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'crossword-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        
        const cellValue = data.grid[r] && data.grid[r][c];
        
        if (cellValue === '#') {
          cell.classList.add('black');
        } else {
          cell.classList.add('white');
          
          const input = document.createElement('input');
          input.type = 'text';
          input.maxLength = 1;
          input.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: transparent;
            text-align: center;
            text-transform: uppercase;
            font-size: 14px;
            font-weight: bold;
            outline: none;
          `;
          
          input.addEventListener('input', (e) => this.handleInput(e, cell));
          input.addEventListener('keydown', (e) => this.handleKeydown(e, cell));
          input.addEventListener('click', () => this.selectCell(cell));
          
          cell.appendChild(input);
        }
        
        gridEl.appendChild(cell);
      }
    }

    // Add clue numbers
    this.addClueNumbers(data);

    // Render clues
    if (acrossEl && data.across) this.renderClues(data.across, acrossEl, 'across');
    if (downEl && data.down) this.renderClues(data.down, downEl, 'down');
  }

  addClueNumbers(data) {
    // Add numbers to starting positions of words
    const addNumber = (clues, direction) => {
      Object.entries(clues || {}).forEach(([num, clue]) => {
        const cell = document.querySelector(`[data-row="${clue.row}"][data-col="${clue.col}"]`);
        if (cell && cell.classList.contains('white')) {
          let numberEl = cell.querySelector('.clue-number');
          if (!numberEl) {
            numberEl = document.createElement('span');
            numberEl.className = 'clue-number';
            numberEl.style.cssText = `
              position: absolute;
              top: 2px;
              left: 2px;
              font-size: 10px;
              font-weight: normal;
              color: #333;
              z-index: 10;
            `;
            cell.style.position = 'relative';
            cell.appendChild(numberEl);
          }
          numberEl.textContent = num;
        }
      });
    };

    addNumber(data.across, 'across');
    addNumber(data.down, 'down');
  }

  renderClues(clues, container, direction) {
    Object.entries(clues || {}).forEach(([num, clue]) => {
      const li = document.createElement('li');
      li.className = 'clue-item';
      li.dataset.num = num;
      li.dataset.dir = direction;
      li.innerHTML = `<span class="clue-number">${num}</span> <span class="clue-text">${clue.clue}</span>`;
      li.onclick = () => this.jumpToWord(clue, direction);
      container.appendChild(li);
    });
  }

  /* =========================================================
     INPUT HANDLERS
     ========================================================= */
  selectCell(cell) {
    document.querySelectorAll('.crossword-cell').forEach(c => {
      c.classList.remove('selected');
    });
    cell.classList.add('selected');
    this.selectedCell = cell;
    this.tier3SmartHintUI();
  }

  handleInput(e, cell) {
    const input = e.target;
    const value = input.value.toUpperCase();
    
    if (/[A-Z]/.test(value)) {
      input.value = value;
      
      if (this.settings.autoCheck) {
        this.validateCell(cell);
      }
      
      this.moveToNextCell(cell);
    } else {
      input.value = '';
    }
  }

  handleKeydown(e, cell) {
    const input = cell.querySelector('input');
    
    switch (e.key) {
      case 'Backspace':
        if (!input.value) {
          this.moveToPrevCell(cell);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.moveCell(cell, 0, 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.moveCell(cell, 0, -1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.moveCell(cell, 1, 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.moveCell(cell, -1, 0);
        break;
    }
  }

  moveCell(currentCell, rowDelta, colDelta) {
    const currentRow = parseInt(currentCell.dataset.row);
    const currentCol = parseInt(currentCell.dataset.col);
    const newRow = currentRow + rowDelta;
    const newCol = currentCol + colDelta;
    
    const nextCell = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
    if (nextCell && nextCell.classList.contains('white')) {
      this.selectCell(nextCell);
      nextCell.querySelector('input').focus();
    }
  }

  moveToNextCell(cell) {
    this.moveCell(cell, 0, 1) || this.moveCell(cell, 1, 0);
  }

  moveToPrevCell(cell) {
    this.moveCell(cell, 0, -1) || this.moveCell(cell, -1, 0);
  }

  jumpToWord(clue, direction) {
    const cell = document.querySelector(`[data-row="${clue.row}"][data-col="${clue.col}"]`);
    if (cell) {
      this.selectCell(cell);
      cell.querySelector('input').focus();
      
      // Highlight the word
      this.highlightWord(clue, direction);
    }
  }

  highlightWord(clue, direction) {
    // Clear previous highlights
    document.querySelectorAll('.crossword-cell').forEach(c => {
      c.classList.remove('word-highlight');
    });

    // Highlight current word
    const {answer, row, col} = clue;
    for (let i = 0; i < answer.length; i++) {
      let targetRow = row;
      let targetCol = col;
      
      if (direction === 'across') {
        targetCol += i;
      } else {
        targetRow += i;
      }
      
      const cell = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);
      if (cell) {
        cell.classList.add('word-highlight');
      }
    }
  }

  /* =========================================================
     VALIDATION & COMPLETION
     ========================================================= */
  validateCell(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const input = cell.querySelector('input');
    const userValue = input.value.toUpperCase();
    
    if (!this.currentPuzzle.grid || !this.currentPuzzle.grid[row]) return;
    
    const correctValue = this.currentPuzzle.grid[row][col];
    
    if (userValue && userValue === correctValue) {
      cell.classList.add('correct');
      cell.classList.remove('incorrect');
      
      this.game.correctAnswers++;
      this.refreshHintPanels();
      
      if (this.checkPuzzleCompletion()) {
        this.endGame();
      }
    } else if (userValue) {
      cell.classList.add('incorrect');
      cell.classList.remove('correct');
    }
  }

  validateAll() {
    document.querySelectorAll('.crossword-cell.white').forEach(cell => {
      this.validateCell(cell);
    });
  }

  checkPuzzleCompletion() {
    const totalCells = document.querySelectorAll('.crossword-cell.white').length;
    const correctCells = document.querySelectorAll('.crossword-cell.correct').length;
    
    const progress = Math.round((correctCells / totalCells) * 100);
    const progressEl = document.getElementById('progress');
    if (progressEl) progressEl.textContent = `${progress}%`;
    
    return correctCells === totalCells && totalCells > 0;
  }

  endGame() {
    clearInterval(this.timerID);
    this.isCompleted = true;
    this.updateStreak(true);
    
    // Update completion modal
    const timeEl = document.getElementById('completionTime');
    const themeEl = document.getElementById('completionTheme');
    const hintsEl = document.getElementById('completionHints');
    const streakEl = document.getElementById('completionStreak');
    
    if (timeEl) timeEl.textContent = this.fmtTime(this.timerSecs);
    if (themeEl) themeEl.textContent = this.themes[this.currentThemeKey]?.theme || 'Unknown';
    if (hintsEl) hintsEl.textContent = this.game.hintsUsed;
    if (streakEl) streakEl.textContent = this.game.streak;
    
    // Show completion modal
    const modal = document.getElementById('completeModal');
    if (modal) modal.classList.remove('hidden');
    
    this.showAchievement('🎉 Puzzle Complete!', `Finished in ${this.fmtTime(this.timerSecs)}`);
  }

  /* =========================================================
     PROGRESSIVE HINTS
     ========================================================= */
  tier1Hints() {
    const t1 = document.getElementById('tier1Hints');
    if (!t1) return;
    
    const theme = this.themes[this.currentThemeKey];
    if (theme) {
      t1.innerHTML = `
        <div class="theme-vibe">✨ ${theme.description}</div>
        <div class="category-breadcrumb">💭 Think ${theme.theme.toLowerCase()}...</div>
      `;
    }
  }

  tier2Reveals() {
    const box = document.getElementById('tier2Hints');
    if (!box) return;
    
    const theme = this.themes[this.currentThemeKey];
    if (!theme || !theme.sample_words) return;
    
    const {sample_words} = theme;
    const c = this.game.correctAnswers;
    let words = [];
    
    if (c >= 3) words.push(...sample_words.slice(0, 2));
    if (c >= 5) words.push(...sample_words.slice(2, 4));
    if (c >= 8) words.push(...sample_words.slice(4, 6));
    
    this.game.revealedWords = words;
    
    box.innerHTML = `
      <h4>Earned Words <span class="progress-badge">${c}/15</span></h4>
      <div class="revealed-words">
        ${words.map(w => `<span class="revealed-word">${w}</span>`).join('')}
      </div>
      <div class="next-unlock">${this.nextUnlockText(c)}</div>
    `;
  }

  nextUnlockText(c) {
    if (c < 3) return `${3 - c} more for first reveal`;
    if (c < 5) return `${5 - c} more for next reveal`;
    if (c < 8) return `${8 - c} more to unlock all`;
    return 'All unlocked!';
  }

  tier3SmartHintUI() {
    const btn = document.getElementById('smartHintBtn');
    if (!btn) return;
    
    const remaining = this.game.maxHints - this.game.hintsUsed;
    const countSpan = btn.querySelector('.hint-count') || btn.querySelector('span');
    
    if (countSpan) countSpan.textContent = remaining;
    
    btn.disabled = remaining <= 0 || !this.selectedCell;
    
    if (btn.disabled) {
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    } else {
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    }
  }

  useSmartHint() {
    if (this.game.hintsUsed >= this.game.maxHints) return;
    if (!this.selectedCell) return;
    
    const input = this.selectedCell.querySelector('input');
    if (input.value) return; // Cell already filled
    
    const row = parseInt(this.selectedCell.dataset.row);
    const col = parseInt(this.selectedCell.dataset.col);
    
    if (!this.currentPuzzle.grid || !this.currentPuzzle.grid[row]) return;
    
    const correctLetter = this.currentPuzzle.grid[row][col];
    if (correctLetter && correctLetter !== '#') {
      input.value = correctLetter;
      this.selectedCell.classList.add('hinted');
      
      this.game.hintsUsed++;
      this.tier3SmartHintUI();
      this.showAchievement('💡 Hint Used', 'Letter revealed!');
      
      if (this.settings.autoCheck) {
        this.validateCell(this.selectedCell);
      }
    }
  }

  refreshHintPanels(reset = false) {
    if (reset) {
      this.game.correctAnswers = 0;
      this.game.hintsUsed = 0;
      document.querySelectorAll('.crossword-cell').forEach(cell => {
        cell.classList.remove('correct', 'incorrect', 'hinted');
      });
    }
    
    this.tier1Hints();
    this.tier2Reveals();
    this.tier3SmartHintUI();
    this.updateStreakDisplay();
  }

  /* =========================================================
     STREAK MANAGEMENT
     ========================================================= */
  updateStreak(completed = false) {
    if (!completed) return;
    
    const today = new Date().toDateString();
    const lastPlay = this.game.lastPlay;
    
    if (lastPlay === today) return; // Already played today
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastPlay === yesterday.toDateString()) {
      this.game.streak++;
    } else {
      this.game.streak = 1;
    }
    
    localStorage.setItem('sqStreak', this.game.streak);
    localStorage.setItem('sqLastPlay', today);
    
    // Bonus hints for streaks
    this.game.maxHints = 3 + Math.floor(this.game.streak / 7);
    
    this.showStreakCelebration();
    this.updateStreakDisplay();
  }

  showStreakCelebration() {
    if (this.game.streak > 1) {
      this.showAchievement(`🔥 ${this.game.streak}-Day Streak!`, 'Keep the momentum going!');
    }
  }

  updateStreakDisplay() {
    const streakEl = document.getElementById('streakCount');
    const hintsEl = document.getElementById('availableHints');
    
    if (streakEl) streakEl.textContent = this.game.streak;
    if (hintsEl) hintsEl.textContent = this.game.maxHints - this.game.hintsUsed;
  }

  /* =========================================================
     TIMER & UTILITIES
     ========================================================= */
  startTimer() {
    if (!this.settings.showTimer) return;
    
    this.timerID = setInterval(() => {
      this.timerSecs++;
      const timerEl = document.getElementById('timer');
      if (timerEl) timerEl.textContent = this.fmtTime(this.timerSecs);
    }, 1000);
  }

  fmtTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  clearAll() {
    document.querySelectorAll('.crossword-cell input').forEach(input => {
      input.value = '';
    });
    
    document.querySelectorAll('.crossword-cell').forEach(cell => {
      cell.classList.remove('correct', 'incorrect', 'hinted', 'word-highlight');
    });
    
    this.game.correctAnswers = 0;
    this.refreshHintPanels();
  }

  showAchievement(title, subtitle = '') {
    const container = document.getElementById('achievements-container') || document.body;
    
    const toast = document.createElement('div');
    toast.className = 'achievement-popup';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      max-width: 300px;
    `;
    toast.innerHTML = `
      <div><strong>${title}</strong></div>
      ${subtitle ? `<div style="font-size: 0.9em; opacity: 0.9;">${subtitle}</div>` : ''}
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }

  /* =========================================================
     UI BINDINGS
     ========================================================= */
  bindUI() {
    // Theme selector
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
      // Populate theme options
      Object.keys(this.themes).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        themeSelect.appendChild(option);
      });
      
      themeSelect.addEventListener('change', (e) => {
        this.loadTheme(e.target.value);
      });
    }

    // Game controls
    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) {
      checkBtn.addEventListener('click', () => this.validateAll());
    }

    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAll());
    }

    const smartHintBtn = document.getElementById('smartHintBtn');
    if (smartHintBtn) {
      smartHintBtn.addEventListener('click', () => this.useSmartHint());
    }

    // Modal controls
    const closeComplete = document.getElementById('closeComplete');
    if (closeComplete) {
      closeComplete.addEventListener('click', () => {
        document.getElementById('completeModal')?.classList.add('hidden');
      });
    }

    const tryAnotherBtn = document.getElementById('tryAnotherBtn');
    if (tryAnotherBtn) {
      tryAnotherBtn.addEventListener('click', () => {
        document.getElementById('completeModal')?.classList.add('hidden');
        this.clearAll();
        // Load random theme
        const themes = Object.keys(this.themes);
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        if (themeSelect) themeSelect.value = randomTheme;
        this.loadTheme(randomTheme);
      });
    }

    // Settings and help modals
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    
    if (settingsBtn && settingsModal) {
      settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    }
    
    if (closeSettings && settingsModal) {
      closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));
    }

    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelp = document.getElementById('closeHelp');
    
    if (helpBtn && helpModal) {
      helpBtn.addEventListener('click', () => helpModal.classList.remove('hidden'));
    }
    
    if (closeHelp && helpModal) {
      closeHelp.addEventListener('click', () => helpModal.classList.add('hidden'));
    }

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal') && !e.target.classList.contains('hidden')) {
        e.target.classList.add('hidden');
      }
    });
  }
}

/* =========================================================
   SOCIAL SHARING
   ========================================================= */
function shareResults() {
  const app = window.crosswordApp;
  if (!app) return;
  
  const theme = app.themes[app.currentThemeKey]?.theme || 'Crossword';
  const time = app.fmtTime(app.timerSecs);
  const hints = app.game.hintsUsed;
  const streak = app.game.streak;
  
  const shareText = `🔥 Just completed "${theme}" in ${time}! Used ${hints} hints, ${streak}-day streak! Play SlangSquares: slang-squares.vercel.app`;
  
  if (navigator.share) {
    navigator.share({
      title: 'SlangSquares Results',
      text: shareText,
      url: 'https://slang-squares.vercel.app'
    });
  } else {
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Results copied to clipboard!');
    });
  }
}

/* =========================================================
   BOOTSTRAP
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  window.crosswordApp = new CrosswordApp();
});
