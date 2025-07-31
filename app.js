// GenZ Crosswords - Main Application Logic

class CrosswordApp {
    constructor() {
        this.themes = {};
        this.currentTheme = 'Day 1';
        this.currentPuzzle = null;
        this.selectedCell = null;
        this.selectedWord = null;
        this.timer = 0;
        this.timerInterval = null;
        this.isCompleted = false;
        this.settings = {
            showTimer: true,
            allowHints: true,
            soundEffects: true,
            autoCheck: true
        };
        
        this.init();
    }

    async init() {
        await this.loadThemes();
        this.setupEventListeners();
        this.initializeTheme();
        this.startTimer();
        this.updateSampleWords();
    }

    async loadThemes() {
        // Load themes from the provided data
        this.themes = {
            "Day 1": {
                theme: "Urban Dictionary Essentials",
                description: "Basic slang terms every millennial and Gen Z should know",
                sample_words: ["RIZZ", "BUSSIN", "SLAY", "STAN", "SIMP", "VIBES", "FIRE", "CRINGE", "ICONIC", "FLEX"],
                puzzle: this.generatePuzzle(["RIZZ", "BUSSIN", "SLAY", "STAN", "SIMP", "VIBES", "FIRE", "CRINGE", "ICONIC", "FLEX"])
            },
            "Day 2": {
                theme: "TikTok Culture",
                description: "Terms and trends from the TikTok universe",
                sample_words: ["SKIBIDI", "GYATT", "SIGMA", "OHIO", "RIZZLER", "BRAIN", "ROT", "DEMURE", "MINDFUL", "EDGING"],
                puzzle: this.generatePuzzle(["SKIBIDI", "GYATT", "SIGMA", "OHIO", "RIZZLER", "BRAIN", "ROT", "DEMURE", "MINDFUL", "EDGING"])
            },
            "Day 3": {
                theme: "Social Media Slang",
                description: "Instagram, Twitter, and social media terminology",
                sample_words: ["SNATCHED", "PERIODT", "NOFLOP", "BLESSED", "MOOD", "SAVAGE", "LOWKEY", "HIGHKEY", "FACTS", "LMAO"],
                puzzle: this.generatePuzzle(["SNATCHED", "PERIODT", "NOFLOP", "BLESSED", "MOOD", "SAVAGE", "LOWKEY", "HIGHKEY", "FACTS", "LMAO"])
            },
            "Day 4": {
                theme: "Gen Z Gaming",
                description: "Gaming culture and esports terminology",
                sample_words: ["NOOB", "CLUTCH", "TOXIC", "CARRY", "THROW", "SMASH", "RAGEQUIT", "NERF", "BUFF", "RESPAWN"],
                puzzle: this.generatePuzzle(["NOOB", "CLUTCH", "TOXIC", "CARRY", "THROW", "SMASH", "RAGEQUIT", "NERF", "BUFF", "RESPAWN"])
            },
            "Day 5": {
                theme: "Millennial Nostalgia",
                description: "Things that defined the millennial experience",
                sample_words: ["FOMO", "YOLO", "SELFIE", "HASHTAG", "VIRAL", "MEME", "PODCAST", "NETFLIX", "UBER", "WIFI"],
                puzzle: this.generatePuzzle(["FOMO", "YOLO", "SELFIE", "HASHTAG", "VIRAL", "MEME", "PODCAST", "NETFLIX", "UBER", "WIFI"])
            }
        };

        // Generate remaining themes (simplified for demo)
        const remainingThemes = [
            { key: "Day 6", theme: "Dating & Relationships", words: ["GHOSTING", "BREADCRUMBING", "CATFISH", "SWIPE", "MATCH", "SLIDE", "THIRST", "TRAP", "SOFT", "LAUNCH"] },
            { key: "Day 7", theme: "Pop Culture Icons", words: ["TAYLOR", "SWIFT", "ARIANA", "GRANDE", "BILLIE", "EILISH", "DOJA", "CAT", "LIZZO", "HARRY"] },
            { key: "Day 8", theme: "Aesthetic Vibes", words: ["VSCO", "SOFT", "GIRL", "DARK", "ACADEMIA", "COTTAGECORE", "BADDIE", "CLEAN", "GRUNGE", "INDIE"] },
            { key: "Day 9", theme: "Food & Drink Trends", words: ["BOBA", "MATCHA", "AVOCADO", "TOAST", "KOMBUCHA", "OATMILK", "SMOOTHIE", "BOWL", "ACAI", "DETOX"] },
            { key: "Day 10", theme: "Streaming & Entertainment", words: ["NETFLIX", "CHILL", "BINGE", "WATCH", "SPOTIFY", "WRAPPED", "TIKTOK", "ALGO", "FYPAGE", "VIRAL"] }
        ];

        remainingThemes.forEach(theme => {
            this.themes[theme.key] = {
                theme: theme.theme,
                description: `${theme.theme} related terms and slang`,
                sample_words: theme.words,
                puzzle: this.generatePuzzle(theme.words)
            };
        });
    }

    generatePuzzle(words) {
        // Generate a simple crossword puzzle from the given words
        const puzzle = {
            size: { rows: 15, cols: 15 },
            across: {},
            down: {},
            grid: Array(15).fill().map(() => Array(15).fill(null))
        };

        // Simple algorithm to place words in the grid
        const placements = [
            { word: words[0], row: 1, col: 1, direction: 'across', number: 1 },
            { word: words[1], row: 1, col: 1, direction: 'down', number: 1 },
            { word: words[2], row: 3, col: 0, direction: 'across', number: 3 },
            { word: words[3], row: 5, col: 2, direction: 'across', number: 5 },
            { word: words[4], row: 7, col: 1, direction: 'across', number: 7 },
            { word: words[5], row: 2, col: 4, direction: 'down', number: 2 },
            { word: words[6], row: 4, col: 6, direction: 'down', number: 4 },
            { word: words[7], row: 0, col: 8, direction: 'down', number: 6 },
            { word: words[8], row: 9, col: 3, direction: 'across', number: 9 },
            { word: words[9], row: 11, col: 5, direction: 'across', number: 11 }
        ];

        // Place words in the grid and create clues
        placements.forEach(placement => {
            const { word, row, col, direction, number } = placement;
            
            if (direction === 'across') {
                for (let i = 0; i < word.length; i++) {
                    if (col + i < 15) {
                        puzzle.grid[row][col + i] = word[i];
                    }
                }
                puzzle.across[number] = {
                    clue: this.generateClue(word),
                    answer: word,
                    row: row,
                    col: col
                };
            } else {
                for (let i = 0; i < word.length; i++) {
                    if (row + i < 15) {
                        puzzle.grid[row + i][col] = word[i];
                    }
                }
                puzzle.down[number] = {
                    clue: this.generateClue(word),
                    answer: word,
                    row: row,
                    col: col
                };
            }
        });

        return puzzle;
    }

    generateClue(word) {
        // Generate contextual clues based on the word
        const clues = {
            'RIZZ': 'Charisma or charm, short for charisma',
            'BUSSIN': 'Extremely good or delicious',
            'SLAY': 'To do something exceptionally well',
            'STAN': 'To support someone obsessively',
            'SIMP': 'Someone who does too much for someone they like',
            'VIBES': 'The atmosphere or feeling',
            'FIRE': 'Excellent or amazing',
            'CRINGE': 'Embarrassing or awkward',
            'ICONIC': 'Legendary or memorable',
            'FLEX': 'To show off',
            'SKIBIDI': 'Nonsensical word from viral videos',
            'GYATT': 'Expression of attraction',
            'SIGMA': 'Independent, alpha-like personality',
            'OHIO': 'Weird or strange (as in "only in Ohio")',
            'RIZZLER': 'Someone with a lot of rizz',
            'BRAIN': 'Intelligence or smart thinking',
            'ROT': 'Mindless content consumption',
            'DEMURE': 'Modest and reserved',
            'MINDFUL': 'Being aware and present',
            'EDGING': 'Being on the edge of something',
            'FOMO': 'Fear of missing out',
            'YOLO': 'You only live once',
            'NOOB': 'Beginner or inexperienced player',
            'CLUTCH': 'Performing well under pressure',
            'TOXIC': 'Harmful or negative behavior',
            'GHOSTING': 'Suddenly cutting off all communication',
            'TAYLOR': 'Pop superstar Swift',
            'SWIFT': 'Quick or the pop star\'s last name',
            'BOBA': 'Bubble tea drink',
            'NETFLIX': 'Popular streaming platform'
        };

        return clues[word] || `Slang term: ${word}`;
    }

    setupEventListeners() {
        // Theme selector
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.switchTheme(e.target.value);
        });

        // Game controls
        document.getElementById('checkBtn').addEventListener('click', () => this.checkAnswers());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearGrid());

        // Modal controls
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeModal('completionModal'));
        document.getElementById('shareBtn').addEventListener('click', () => this.shareResults());
        document.getElementById('newPuzzleBtn').addEventListener('click', () => this.newPuzzle());

        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.openModal('settingsModal'));
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeModal('settingsModal'));

        // Help
        document.getElementById('helpBtn').addEventListener('click', () => this.openModal('helpModal'));
        document.getElementById('closeHelpBtn').addEventListener('click', () => this.closeModal('helpModal'));

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Settings checkboxes
        document.getElementById('timerToggle').addEventListener('change', (e) => {
            this.settings.showTimer = e.target.checked;
            this.updateTimerDisplay();
        });

        document.getElementById('hintsToggle').addEventListener('change', (e) => {
            this.settings.allowHints = e.target.checked;
        });

        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.settings.soundEffects = e.target.checked;
        });

        document.getElementById('autoCheck').addEventListener('change', (e) => {
            this.settings.autoCheck = e.target.checked;
        });
    }

    initializeTheme() {
        this.currentPuzzle = this.themes[this.currentTheme].puzzle;
        this.createGrid();
        this.displayClues();
        this.updateThemeInfo();
    }

    switchTheme(themeKey) {
        this.currentTheme = themeKey;
        this.currentPuzzle = this.themes[themeKey].puzzle;
        this.isCompleted = false;
        this.resetTimer();
        this.createGrid();
        this.displayClues();
        this.updateThemeInfo();
        this.updateSampleWords();
        this.playSound('switch');
    }

    createGrid() {
        const gridContainer = document.getElementById('crosswordGrid');
        gridContainer.innerHTML = '';

        // Create 15x15 grid
        for (let row = 0; row < 15; row++) {
            for (let col = 0; col < 15; col++) {
                const cell = document.createElement('div');
                cell.className = 'crossword-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                // Determine if cell should be black or white
                const isLetterCell = this.currentPuzzle.grid[row][col] !== null;
                
                if (isLetterCell) {
                    cell.classList.add('white');
                    cell.contentEditable = true;
                    cell.addEventListener('click', (e) => this.selectCell(e));
                    cell.addEventListener('input', (e) => this.handleCellInput(e));
                    cell.addEventListener('focus', (e) => this.selectCell(e));
                    
                    // Add number if it's the start of a word
                    const number = this.getCellNumber(row, col);
                    if (number) {
                        const numberSpan = document.createElement('span');
                        numberSpan.className = 'number';
                        numberSpan.textContent = number;
                        cell.appendChild(numberSpan);
                    }
                } else {
                    cell.classList.add('black');
                }

                gridContainer.appendChild(cell);
            }
        }
    }

    getCellNumber(row, col) {
        // Check if this cell is the start of an across or down word
        for (const [number, data] of Object.entries(this.currentPuzzle.across)) {
            if (data.row === row && data.col === col) {
                return number;
            }
        }
        for (const [number, data] of Object.entries(this.currentPuzzle.down)) {
            if (data.row === row && data.col === col) {
                return number;
            }
        }
        return null;
    }

    selectCell(e) {
        // Remove previous selection
        document.querySelectorAll('.crossword-cell').forEach(cell => {
            cell.classList.remove('selected', 'word-highlight');
        });

        const cell = e.target;
        this.selectedCell = cell;
        cell.classList.add('selected');
        
        // Highlight the word this cell belongs to
        this.highlightCurrentWord(cell);
        
        // Focus the cell for typing
        cell.focus();
    }

    highlightCurrentWord(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Find which word this cell belongs to
        let wordInfo = null;
        
        // Check across words
        for (const [number, data] of Object.entries(this.currentPuzzle.across)) {
            if (data.row === row && col >= data.col && col < data.col + data.answer.length) {
                wordInfo = { direction: 'across', ...data, number };
                break;
            }
        }
        
        // Check down words if not found in across
        if (!wordInfo) {
            for (const [number, data] of Object.entries(this.currentPuzzle.down)) {
                if (data.col === col && row >= data.row && row < data.row + data.answer.length) {
                    wordInfo = { direction: 'down', ...data, number };
                    break;
                }
            }
        }
        
        if (wordInfo) {
            this.selectedWord = wordInfo;
            this.highlightWord(wordInfo);
            this.highlightClue(wordInfo.number, wordInfo.direction);
        }
    }

    highlightWord(wordInfo) {
        if (wordInfo.direction === 'across') {
            for (let i = 0; i < wordInfo.answer.length; i++) {
                const cell = document.querySelector(`[data-row="${wordInfo.row}"][data-col="${wordInfo.col + i}"]`);
                if (cell) cell.classList.add('word-highlight');
            }
        } else {
            for (let i = 0; i < wordInfo.answer.length; i++) {
                const cell = document.querySelector(`[data-row="${wordInfo.row + i}"][data-col="${wordInfo.col}"]`);
                if (cell) cell.classList.add('word-highlight');
            }
        }
    }

    highlightClue(number, direction) {
        // Remove previous clue highlights
        document.querySelectorAll('.clue-item').forEach(item => {
            item.classList.remove('active');
        });

        // Highlight current clue
        const clueItem = document.querySelector(`.clue-item[data-number="${number}"][data-direction="${direction}"]`);
        if (clueItem) {
            clueItem.classList.add('active');
            clueItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    handleCellInput(e) {
        const cell = e.target;
        const input = e.data ? e.data.toUpperCase() : '';
        
        if (input && /[A-Z]/.test(input)) {
            cell.textContent = input;
            this.moveToNextCell();
            this.updateProgress();
            
            if (this.settings.autoCheck) {
                this.checkCurrentWord();
            }
        } else if (e.inputType === 'deleteContentBackward') {
            cell.textContent = '';
            this.moveToPreviousCell();
            this.updateProgress();
        }
    }

    moveToNextCell() {
        if (!this.selectedCell || !this.selectedWord) return;
        
        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        
        let nextRow = row;
        let nextCol = col;
        
        if (this.selectedWord.direction === 'across') {
            nextCol = col + 1;
            if (nextCol >= this.selectedWord.col + this.selectedWord.answer.length) return;
        } else {
            nextRow = row + 1;
            if (nextRow >= this.selectedWord.row + this.selectedWord.answer.length) return;
        }
        
        const nextCell = document.querySelector(`[data-row="${nextRow}"][data-col="${nextCol}"]`);
        if (nextCell && nextCell.classList.contains('white')) {
            this.selectCell({ target: nextCell });
        }
    }

    moveToPreviousCell() {
        if (!this.selectedCell || !this.selectedWord) return;
        
        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        
        let prevRow = row;
        let prevCol = col;
        
        if (this.selectedWord.direction === 'across') {
            prevCol = col - 1;
            if (prevCol < this.selectedWord.col) return;
        } else {
            prevRow = row - 1;
            if (prevRow < this.selectedWord.row) return;
        }
        
        const prevCell = document.querySelector(`[data-row="${prevRow}"][data-col="${prevCol}"]`);
        if (prevCell && prevCell.classList.contains('white')) {
            this.selectCell({ target: prevCell });
        }
    }

    handleKeyPress(e) {
        if (!this.selectedCell) return;
        
        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.moveToCell(row - 1, col);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.moveToCell(row + 1, col);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.moveToCell(row, col - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.moveToCell(row, col + 1);
                break;
            case 'Backspace':
                e.preventDefault();
                this.selectedCell.textContent = '';
                this.moveToPreviousCell();
                this.updateProgress();
                break;
            case 'Delete':
                e.preventDefault();
                this.selectedCell.textContent = '';
                this.updateProgress();
                break;
            default:
                if (e.key.length === 1 && /[A-Za-z]/.test(e.key)) {
                    e.preventDefault();
                    this.selectedCell.textContent = e.key.toUpperCase();
                    this.moveToNextCell();
                    this.updateProgress();
                }
        }
    }

    moveToCell(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell && cell.classList.contains('white')) {
            this.selectCell({ target: cell });
        }
    }

    displayClues() {
        const acrossClues = document.getElementById('acrossClues');
        const downClues = document.getElementById('downClues');
        
        acrossClues.innerHTML = '';
        downClues.innerHTML = '';
        
        // Display across clues
        for (const [number, data] of Object.entries(this.currentPuzzle.across)) {
            const clueItem = document.createElement('div');
            clueItem.className = 'clue-item';
            clueItem.dataset.number = number;
            clueItem.dataset.direction = 'across';
            clueItem.innerHTML = `
                <span class="clue-number">${number}</span>
                <span class="clue-text">${data.clue}</span>
            `;
            clueItem.addEventListener('click', () => this.selectWordFromClue(number, 'across'));
            acrossClues.appendChild(clueItem);
        }
        
        // Display down clues
        for (const [number, data] of Object.entries(this.currentPuzzle.down)) {
            const clueItem = document.createElement('div');
            clueItem.className = 'clue-item';
            clueItem.dataset.number = number;
            clueItem.dataset.direction = 'down';
            clueItem.innerHTML = `
                <span class="clue-number">${number}</span>
                <span class="clue-text">${data.clue}</span>
            `;
            clueItem.addEventListener('click', () => this.selectWordFromClue(number, 'down'));
            downClues.appendChild(clueItem);
        }
    }

    selectWordFromClue(number, direction) {
        const wordData = direction === 'across' ? this.currentPuzzle.across[number] : this.currentPuzzle.down[number];
        const firstCell = document.querySelector(`[data-row="${wordData.row}"][data-col="${wordData.col}"]`);
        if (firstCell) {
            this.selectCell({ target: firstCell });
        }
    }

    updateThemeInfo() {
        const themeData = this.themes[this.currentTheme];
        document.getElementById('currentTheme').textContent = themeData.theme;
        document.getElementById('themeDescription').textContent = themeData.description;
    }

    updateSampleWords() {
        const sampleWordsContainer = document.getElementById('sampleWords');
        const themeData = this.themes[this.currentTheme];
        
        sampleWordsContainer.innerHTML = '';
        themeData.sample_words.forEach(word => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'sample-word';
            wordSpan.textContent = word;
            sampleWordsContainer.appendChild(wordSpan);
        });
    }

    startTimer() {
        this.timer = 0;
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    resetTimer() {
        clearInterval(this.timerInterval);
        this.startTimer();
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer').textContent = display;
    }

    updateProgress() {
        const totalCells = this.getTotalCells();
        const filledCells = this.getFilledCells();
        const progress = Math.round((filledCells / totalCells) * 100);
        document.getElementById('progress').textContent = `${progress}%`;
        
        if (progress === 100 && this.settings.autoCheck) {
            setTimeout(() => this.checkCompletion(), 500);
        }
    }

    getTotalCells() {
        return document.querySelectorAll('.crossword-cell.white').length;
    }

    getFilledCells() {
        return document.querySelectorAll('.crossword-cell.white').length - 
               document.querySelectorAll('.crossword-cell.white:empty').length;
    }

    checkAnswers() {
        let allCorrect = true;
        
        // Check across words
        for (const [number, data] of Object.entries(this.currentPuzzle.across)) {
            const isCorrect = this.checkWord(data, 'across');
            if (!isCorrect) allCorrect = false;
        }
        
        // Check down words
        for (const [number, data] of Object.entries(this.currentPuzzle.down)) {
            const isCorrect = this.checkWord(data, 'down');
            if (!isCorrect) allCorrect = false;
        }
        
        if (allCorrect) {
            this.completePuzzle();
        }
        
        this.playSound('check');
    }

    checkCurrentWord() {
        if (!this.selectedWord) return;
        
        const data = this.selectedWord.direction === 'across' ? 
            this.currentPuzzle.across[this.selectedWord.number] : 
            this.currentPuzzle.down[this.selectedWord.number];
        
        this.checkWord(data, this.selectedWord.direction);
    }

    checkWord(data, direction) {
        let userAnswer = '';
        
        if (direction === 'across') {
            for (let i = 0; i < data.answer.length; i++) {
                const cell = document.querySelector(`[data-row="${data.row}"][data-col="${data.col + i}"]`);
                userAnswer += cell ? cell.textContent.trim() : '';
            }
        } else {
            for (let i = 0; i < data.answer.length; i++) {
                const cell = document.querySelector(`[data-row="${data.row + i}"][data-col="${data.col}"]`);
                userAnswer += cell ? cell.textContent.trim() : '';
            }
        }
        
        const isCorrect = userAnswer === data.answer;
        
        // Update cell styling
        if (direction === 'across') {
            for (let i = 0; i < data.answer.length; i++) {
                const cell = document.querySelector(`[data-row="${data.row}"][data-col="${data.col + i}"]`);
                if (cell) {
                    cell.classList.remove('correct', 'incorrect');
                    if (userAnswer.length === data.answer.length) {
                        cell.classList.add(isCorrect ? 'correct' : 'incorrect');
                    }
                }
            }
        } else {
            for (let i = 0; i < data.answer.length; i++) {
                const cell = document.querySelector(`[data-row="${data.row + i}"][data-col="${data.col}"]`);
                if (cell) {
                    cell.classList.remove('correct', 'incorrect');
                    if (userAnswer.length === data.answer.length) {
                        cell.classList.add(isCorrect ? 'correct' : 'incorrect');
                    }
                }
            }
        }
        
        return isCorrect;
    }

    checkCompletion() {
        const totalCells = this.getTotalCells();
        const filledCells = this.getFilledCells();
        
        if (filledCells === totalCells) {
            this.checkAnswers();
        }
    }

    completePuzzle() {
        this.isCompleted = true;
        this.stopTimer();
        this.showCompletionModal();
        this.showConfetti();
        this.playSound('complete');
    }

    showCompletionModal() {
        const modal = document.getElementById('completionModal');
        document.getElementById('finalTime').textContent = document.getElementById('timer').textContent;
        document.getElementById('finalTheme').textContent = this.themes[this.currentTheme].theme;
        this.openModal('completionModal');
    }

    showConfetti() {
        const confetti = document.getElementById('confetti');
        confetti.classList.remove('hidden');
        
        // Create confetti pieces
        for (let i = 0; i < 50; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.animationDelay = Math.random() * 2 + 's';
            piece.style.backgroundColor = this.getRandomColor();
            confetti.appendChild(piece);
        }
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.classList.add('hidden');
            confetti.innerHTML = '';
        }, 4000);
    }

    getRandomColor() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    showHint() {
        if (!this.settings.allowHints || !this.selectedWord) return;
        
        const data = this.selectedWord.direction === 'across' ? 
            this.currentPuzzle.across[this.selectedWord.number] : 
            this.currentPuzzle.down[this.selectedWord.number];
        
        // Find first empty cell in the word
        let hintGiven = false;
        
        if (this.selectedWord.direction === 'across') {
            for (let i = 0; i < data.answer.length; i++) {
                const cell = document.querySelector(`[data-row="${data.row}"][data-col="${data.col + i}"]`);
                if (cell && !cell.textContent.trim()) {
                    cell.textContent = data.answer[i];
                    cell.classList.add('pulse');
                    hintGiven = true;
                    break;
                }
            }
        } else {
            for (let i = 0; i < data.answer.length; i++) {
                const cell = document.querySelector(`[data-row="${data.row + i}"][data-col="${data.col}"]`);
                if (cell && !cell.textContent.trim()) {
                    cell.textContent = data.answer[i];
                    cell.classList.add('pulse');
                    hintGiven = true;
                    break;
                }
            }
        }
        
        if (hintGiven) {
            this.updateProgress();
            this.playSound('hint');
        }
    }

    clearGrid() {
        document.querySelectorAll('.crossword-cell.white').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('correct', 'incorrect', 'pulse');
        });
        this.updateProgress();
        this.playSound('clear');
    }

    shareResults() {
        const text = `I completed the "${this.themes[this.currentTheme].theme}" crossword in ${document.getElementById('timer').textContent}! 🎉\n\nPlay Slang Squares Crosswords - Urban Dictionary & Slang Puzzles`;
        
        if (navigator.share) {
            navigator.share({
                title: 'GenZ Crosswords',
                text: text,
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                alert('Results copied to clipboard!');
            });
        }
    }

    newPuzzle() {
        this.closeModal('completionModal');
        const themeKeys = Object.keys(this.themes);
        const currentIndex = themeKeys.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        const nextTheme = themeKeys[nextIndex];
        
        document.getElementById('themeSelect').value = nextTheme;
        this.switchTheme(nextTheme);
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    toggleDarkMode() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-color-scheme', newTheme);
        
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        // Save preference
        localStorage.setItem('theme', newTheme);
    }

    playSound(type) {
        if (!this.settings.soundEffects) return;
        
        // Create audio context for sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const frequencies = {
            'switch': 440,
            'check': 523,
            'hint': 659,
            'clear': 349,
            'complete': 880
        };
        
        oscillator.frequency.value = frequencies[type] || 440;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CrosswordApp();
});
