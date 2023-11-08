class GameView {
  #gamevm
  #uiBoard
  #difficultyPopup
  
  constructor(gamevm) {
    this.#gamevm = gamevm
    this.#uiBoard = []

    this.#difficultyPopup = new DifficultyPopupView(this.createNewGame, this.handleModelStateUpdated)
    document.addEventListener('DOMContentLoaded', this.kickStartInitProcess)
  }

  kickStartInitProcess = () => {
    this.difficulty = localStorage.getItem('difficulty')?.toLocaleLowerCase()
    this.collectBoard()
    this.renderUI()

    this.registerEventHandler()
    this.bindViewModel()
  }

  collectBoard() {
    this.#uiBoard = []
    const rows = document.getElementsByClassName('game__row')
    for (const row of rows) {
      const columns = row.children
      for (let i = 0; i < 3; i++) {
        const cells = []
        for (let j = 0; j < 3; j++) {
          for (let k = 0; k < 3; k++ ) {
            const ele = columns[j].children[i * 3 + k]
            cells.push(ele)
          }
        }
        this.#uiBoard.push(cells)
      }
    }
  }

  renderUI() {
    this.renderStatus()
    this.renderActiveCell(null)
    this.renderActions()

    if (this.#gamevm.Paused) this.renderPausedGame()
    else this.renderResumedGame()
  }

  renderAvailableUndo = () => {
    const avaiUndo = this.#gamevm.AvailableUndo
    const [undoBtn] = document.getElementsByClassName('actions__item')

    undoBtn.children[0].innerText = avaiUndo
  }

  renderAvailableHints = () => {
    const avaiHints = this.#gamevm.AvailableHints
    const [undoBtn, eraseBtn, noteBtn, hintBtn] = document.getElementsByClassName('actions__item')

    hintBtn.children[0].innerText = avaiHints
  }

  renderActions = () => {
    this.renderAvailableUndo()
    this.renderAvailableHints()
  }

  renderTime = () => {
    const [hour, minute, second] = this.#gamevm.Duration
    const timeEle = document.getElementById('status-time').children[0]
    let time = ""

    if (hour) {
      time = String(hour).padStart(2, '0')
      time += ":"
    }
    time += String(minute).padStart(2, '0')
    time += ":"
    time = time + String(second).padStart(2, '0')

    timeEle.children[1].innerText = time
  }

  renderDifficulty() {
    const diffEle = document.getElementById('status-difficulty')
    diffEle.children[1].innerText = this.#gamevm.Difficulty
  }

  renderScore() {
    const scoreEle = document.getElementById('status-score')
    scoreEle.children[1].innerText = this.#gamevm.Score
  }

  renderMistakeStatus = () => {
    const mistakes = this.#gamevm.Mistakes
    const allowedMistakes = this.#gamevm.AllowedMistakes
    const mistakeEle = document.getElementById('status-mistake')

    mistakeEle.children[1].innerText = `${mistakes}/${allowedMistakes}`
  }

  renderStatus = () => {
    this.renderDifficulty(this.difficulty)
    this.renderScore(1000)
    this.renderMistakeStatus()
    this.renderTime([23, 10, 58])
  }

  renderCell = () => {
    const [row, col] = this.#gamevm.ActiveCell
    const cellValue = this.#gamevm.ActiveSudokuBoard[row][col]
    const cellElement = this.#uiBoard[row][col]

    cellElement.innerText = cellValue
    if (cellValue) {
      cellElement.classList.remove('hide')
    } else {
      cellElement.classList.add('hide')
    }
  }

  renderBoard = (sudokuBoard) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        this.#uiBoard[i][j].innerText = sudokuBoard[i][j] || '_' 
        if (!sudokuBoard[i][j]) this.#uiBoard[i][j].classList.add('hide')
        else this.#uiBoard[i][j].classList.remove('hide')
      }
    }
  }

  renderActiveCell = (prevValue) => {
    const [row, col] = this.#gamevm.ActiveCell
    if (prevValue) {
      const [prevRow = 0, prevCol = 0] = prevValue ?? []
      this.removeSelectedCell([prevRow, prevCol])
    }
    this.activeSelectedCell([row, col])
  }

  renderPausedGame = () => {
    const timeControlBlock = document.getElementById('status-time').children[1]
    timeControlBlock.children[0].src = 'imgs/play.svg'
    timeControlBlock.children[0].alt = 'Resume'

    const gamePauseScreen = document.getElementById('game-paused')
    gamePauseScreen.classList.remove('hide')

    const board = [...new Array(9)].map(_ => new Array(9))
    this.removeSelectedCell(this.#gamevm.ActiveCell)
    this.renderBoard(board)
  }

  renderResumedGame = () => {
    const timeControlBlock = document.getElementById('status-time').children[1]
    timeControlBlock.children[0].src = 'imgs/pause.svg'
    timeControlBlock.children[0].alt = 'Pause'

    const gamePauseScreen = document.getElementById('game-paused')
    gamePauseScreen.classList.add('hide')

    const board = this.#gamevm.ActiveSudokuBoard
    this.activeSelectedCell(this.#gamevm.ActiveCell)
    this.renderBoard(board)
  }

  // ===================================
  // event handlers

  registerEventHandler = () => {
    this.registerKeyPressedHandler()
    this.registerCellPressedHandler()
    this.registerNewGameHandler()
    this.registerBackBtnPressedHandler()
    this.registerBackToHomeBtnPressedHandler()
    this.registerNumpadPressedHandler()
    this.registerActionPressedHandler()
    this.registerTimeControlPressed()
  }

  timeControlPressed = () => {
    if (this.#gamevm.Paused) {
      this.#gamevm.ResumeGame()
      return
    }
    this.#gamevm.PauseGame()
  }

  registerTimeControlPressed = () => {
    const timeBlock = document.getElementById('status-time')
    timeBlock.onclick = after(this.timeControlPressed, 500)

    const gamePauseScreen = document.getElementById('game-paused')
    gamePauseScreen.onclick = after(this.timeControlPressed, 500)
  }

  erasePressed = () => {
    this.#gamevm.UpdateCell(0)
  }

  undoPressed = () => {
    this.#gamevm.Undo()
  }

  hintPressed = () => {
    this.#gamevm.Hint()
  }

  notePressed = () => {
    this.#gamevm.ToggleNoteMode()
  }

  registerActionPressedHandler() {
    const actions = document.getElementById('actions')
    const [undoBtn, eraseBtn, noteBtn, hintBtn] = actions.children

    //undo
    undoBtn.onclick = after(this.undoPressed, 250)

    // erase
    eraseBtn.onclick = after(this.erasePressed, 250)

    //note
    noteBtn.onclick = after(this.notePressed, 250)

    // hint
    hintBtn.onclick = after(this.hintPressed, 250)
  }

  numpadPressed = (evt) => {
    const { currentTarget } = evt;
    this.#gamevm.UpdateCell(parseInt(currentTarget.dataset.value))
  }

  registerNumpadPressedHandler = () => {
    const numpad = document.getElementById('numbers')
    for (const child of numpad.children) {
      child.addEventListener('click', after(this.numpadPressed, 250))
    }
  }

  registerKeyPressedHandler = () => {
    document.addEventListener('keydown', after(this.handleCellKeyboardInput, 250))
    document.addEventListener('keydown', after(this.handlePauseKeyboardInput, 250))
    document.addEventListener('keydown', after(this.handleHintKeyboardInput, 250))
    document.addEventListener('keydown', this.handleMovementKeyboardInput)
  }

  handleHintKeyboardInput = (evt) => {
    const {keyCode} = evt;

    if (keyCode !== 0) {
      return
    }
    this.hintPressed()
  }

  handlePauseKeyboardInput = (evt) => {
    const {keyCode} = evt;

    if (keyCode !== 32) {
      return
    }
    this.timeControlPressed()
  }

  handleMovementKeyboardInput = (evt) => {
    const { keyCode } = evt;

    if (keyCode < 37 || keyCode > 40) {
      return
    }

    let [row, col] = this.#gamevm.ActiveCell
    if (keyCode === 38) row = Math.max(0, row - 1)
    if (keyCode === 40) row = Math.min(8, row + 1)
    if (keyCode === 37) col = Math.max(0, col - 1)
    if (keyCode === 39) col = Math.min(8, col + 1)
    this.#gamevm.SelectCell(row, col)
  }

  handleCellKeyboardInput = (evt) => {
    const { keyCode } = evt;

    if (keyCode === 8 || keyCode === 46) { // backspace and delete
      this.#gamevm.UpdateCell(0)
    }

    if (keyCode < 49 || keyCode > 57) return
    this.#gamevm.UpdateCell(keyCode - 48)
  }

  registerCellPressedHandler = () => {
    this.#uiBoard.forEach(row => row.forEach(ele => ele.addEventListener('click', this.activeCell)))
  }

  activeCell = (evt) => {
    const celEle = evt.currentTarget
    const colEle = celEle.parentElement
    const rowEle = colEle.parentElement

    const cel = parseInt(celEle.dataset.cell)
    const col = (parseInt(colEle.dataset.col) - 1) * 3 + (cel % 3 ? cel % 3 : 3) - 1
    const row = (parseInt(rowEle.dataset.row) - 1) * 3 + Math.ceil(cel / 3.0) - 1

    this.#gamevm.SelectCell(row, col)
  }

  registerNewGameHandler = () => {
    const header = document.getElementById('header')
    const newGameEle = header.children[1]
    newGameEle.onclick = this.#difficultyPopup.toggleDifficultyMenu
  }

  registerBackBtnPressedHandler = () => {
    const diffiPopup = document.getElementById('difficulty-popup')
    const backBtn = diffiPopup.children.item(diffiPopup.children.length - 1)
    backBtn.onclick = this.#difficultyPopup.toggleDifficultyMenu
  }

  backToHome() {
    // push pause game event
    window.location = 'index.html'
  }

  registerBackToHomeBtnPressedHandler = () => {
    const header = document.getElementById('header')
    header.children[0].onclick = this.backToHome
  }

  createNewGame = (evt) => {
    const ele = evt.currentTarget
    const difficulty = ele.dataset.difficulty
    if (difficulty === 'restart') {
      // push restart game command
    } else {
      localStorage.setItem('difficulty', difficulty)
      // push new game command
    }
  }

  handleModelStateUpdated = (modalStatus) => {
    if (modalStatus === 'on') {
      // push pause game command
    }
    else {
      // push resume game command
    }
  }

  // ===================================
  // bind view model to view -> update on vm will reflect on view

  bindViewModel = () => {
    this.#gamevm.AddPropertyChangedListener('ActiveCell', this.renderActiveCell)
    this.#gamevm.AddPropertyChangedListener('Duration', this.renderTime)
    this.#gamevm.AddPropertyChangedListener('ActiveCellValue', this.renderCell)
    this.#gamevm.AddPropertyChangedListener('Mistakes', this.renderMistakeStatus)
    this.#gamevm.AddPropertyChangedListener('Paused', this.renderPausedGame)
    this.#gamevm.AddPropertyChangedListener('Resumed', this.renderResumedGame)
    this.#gamevm.AddPropertyChangedListener('AvailableHints', this.renderAvailableHints)
    this.#gamevm.AddPropertyChangedListener('AvailableUndo', this.renderAvailableUndo)

  }

  // ===================================
  // helpers
  removeSelectedCell = ([row, col]) => {
    this.#uiBoard[row][col].classList.remove('selected')
    for (const ele of this.#uiBoard[row]) {
      ele.classList.remove('activated')
    }
    for (let i = 0; i < 9; i++) {
      const ele = this.#uiBoard[i][col]
      ele.classList.remove('activated')
    }
  
    const baseRow = Math.floor(row / 3) * 3
    const baseCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
        const ele = this.#uiBoard[baseRow + i][baseCol + j]
        ele.classList.remove('activated')
      }
    }
  }

  activeSelectedCell = ([row, col]) => {
    this.#uiBoard[row][col].classList.add('selected')
    for (const ele of this.#uiBoard[row]) {
      ele.classList.add('activated')
    }
  
    for (let i = 0; i < 9; i++) {
      const ele = this.#uiBoard[i][col]
      ele.classList.add('activated')
    }
  
    const baseRow = Math.floor(row / 3) * 3
    const baseCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const ele = this.#uiBoard[baseRow + i][baseCol + j]
        ele.classList.add('activated')
      }
    }
  }
}

new GameView(new GameViewModel(new GameManager()))
