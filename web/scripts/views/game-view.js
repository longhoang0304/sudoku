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
    this.registerEventHandler()
    this.bindViewModel()

    this.#gamevm.InitGame()
  }

  collectBoard() {
    this.#uiBoard = []
    const rows = document.getElementsByClassName('game-board__row')
    for (const row of rows) {
        this.#uiBoard.push(row.children)
    }
  }

  renderUI = () => {
    this.renderStatus()
    this.renderActions()
    this.renderBoard()

    if (this.#gamevm.Paused) this.renderPausedGame()
    else this.renderResumedGame()

    const gameOverPanel = document.getElementById('game-over')
    if(!gameOverPanel.classList.contains('hide')) gameOverPanel.classList.add('hide')
  }

  renderAvailableUndo = () => {
    const avaiUndo = this.#gamevm.AvailableUndo
    const undoBtn = document.getElementsByClassName('actions__item')[0]

    undoBtn.children[0].innerText = avaiUndo
  }

  renderGameMode = () => {
    const noteBtn = document.getElementsByClassName('actions__item')[2]

    noteBtn.children[0].innerText = this.#gamevm.Mode === 'note' ? 'on' : 'off'
  }

  renderAvailableHints = () => {
    const avaiHints = this.#gamevm.AvailableHints
    const hintBtn = document.getElementsByClassName('actions__item')[3]

    hintBtn.children[0].innerText = avaiHints
  }

  renderActions = () => {
    this.renderAvailableUndo()
    this.renderAvailableHints()
    this.renderGameMode()
  }

  renderTime = () => {
    const timeEle = document.getElementById('status-time').children[0]
    timeEle.children[1].innerText = this.parseTime(...this.#gamevm.Duration)
  }

  renderDifficulty = () => {
    const diffEle = document.getElementById('status-difficulty')
    diffEle.children[1].innerText = this.#gamevm.Difficulty
  }

  renderScore = () => {
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
    this.renderDifficulty(this.#gamevm.Difficulty)
    this.renderScore(1000)
    this.renderMistakeStatus()
    this.renderTime([23, 10, 58])
  }

  renderActiveCellData = () => {
    const { row, col, data, type } = this.#gamevm.ActiveCellData
    const cell = this.#uiBoard[row][col]

    if (!data) {
      cell.replaceChildren()
      return
    }

    let cellDataElement
    const isFill = type === 'fill' || type === 'pre-filled'

    if (isFill) cellDataElement = this.createCellDataElement(data)
    else cellDataElement = this.createCellNoteElement(data)

    cell.replaceChildren(cellDataElement)
  }

  renderBoard = () => {
    const sudokuBoard = this.#gamevm.GameBoard

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        this.renderCellData(i, j, sudokuBoard[i][j])
      }
    }
    if (this.#gamevm.GameOver) return
    this.activeSelectedCell(this.#gamevm.ActiveCellData)
  }

  renderPausedGame = () => {
    const timeControlBlock = document.getElementById('status-time').children[1]
    timeControlBlock.children[0].src = 'imgs/play.svg'
    timeControlBlock.children[0].alt = 'Resume'

    const gamePauseScreen = document.getElementById('game-paused')
    gamePauseScreen.classList.remove('hide')

    this.removeSelectedCell(this.#gamevm.ActiveCellData)
    this.renderBoard()
  }

  renderResumedGame = () => {
    const timeControlBlock = document.getElementById('status-time').children[1]
    timeControlBlock.children[0].src = 'imgs/pause.svg'
    timeControlBlock.children[0].alt = 'Pause'

    const gamePauseScreen = document.getElementById('game-paused')
    gamePauseScreen.classList.add('hide')

    this.activeSelectedCell(this.#gamevm.ActiveCellData)
    this.renderBoard()
  }

  renderGameOver = () => {
    const gameOverPanel = document.getElementById('game-over')
    gameOverPanel.classList.remove('hide')

    const gameOverText = document.getElementById('game-over__text')
    gameOverText.innerText = this.#gamevm.Lose ? 'Game Over' : 'You Won'

    const gameOverDuration = document.getElementById('game-over__time')
    gameOverDuration.children[1].innerText = this.parseTime(...this.#gamevm.Duration)

    const gameOverScore = document.getElementById('game-over__score')
    gameOverScore.children[1].innerText = this.#gamevm.Score
  }

  // ===================================
  // event handlers

  registerEventHandler = () => {
    this.registerKeyPressedHandler()
    this.registerCellPressedHandler()
    this.registerNewGameHandler()
    this.registerBackBtnPressedHandler()
    this.registerRestartBtnPressedHandler()
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
    this.#gamevm.UpdateActiveCellData(0)
  }

  undoPressed = () => {
    this.#gamevm.Undo()
  }

  hintPressed = () => {
    this.#gamevm.Hint()
  }

  notePressed = () => {
    this.#gamevm.ToggleGameMode()
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
    this.#gamevm.UpdateActiveCellData(parseInt(currentTarget.dataset.value))
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
    const { keyCode } = evt;

    if (keyCode !== 191) {
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

    let { row, col } = this.#gamevm.ActiveCellData
    if (keyCode === 38) row = Math.max(0, row - 1)
    if (keyCode === 40) row = Math.min(8, row + 1)
    if (keyCode === 37) col = Math.max(0, col - 1)
    if (keyCode === 39) col = Math.min(8, col + 1)
    this.#gamevm.SelectCell(row, col)
  }

  handleCellKeyboardInput = (evt) => {
    const { keyCode } = evt;

    if (keyCode === 8 || keyCode === 46) { // backspace and delete
      this.#gamevm.UpdateActiveCellData(0)
    }

    if (keyCode < 49 || keyCode > 57) return
    this.#gamevm.UpdateActiveCellData(keyCode - 48)
  }

  registerCellPressedHandler = () => {
    for (const row of this.#uiBoard) {
      for (const col of row) {
        col.addEventListener('click', this.activeCell)
      }
    }
  }

  activeCell = (evt) => {
    const colEle = evt.currentTarget
    const rowEle = colEle.parentElement

    const col = parseInt(colEle.dataset.col) - 1
    const row = parseInt(rowEle.dataset.row) - 1

    this.#gamevm.SelectCell(row, col)
  }

  registerNewGameHandler = () => {
    const header = document.getElementById('header')
    const newGameEle = header.children[1]
    newGameEle.onclick = this.#difficultyPopup.toggleDifficultyMenu
  }

  registerRestartBtnPressedHandler = () => {
    const diffiPopup = document.getElementById('difficulty-popup')
    const restartBtn = diffiPopup.children.item(diffiPopup.children.length - 2)
    restartBtn.addEventListener('click', this.restartGame)
    restartBtn.addEventListener('click', this.#difficultyPopup.toggleDifficultyMenu)
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

  restartGame = () => {
    this.#gamevm.RestartGame()
  }

  createNewGame = (evt) => {
    const ele = evt.currentTarget
    const difficulty = ele.dataset.difficulty
    this.#gamevm.DifficultySelected(difficulty)
  }

  handleModelStateUpdated = (modalStatus) => {
    if (modalStatus === 'on') {
      this.#gamevm.PauseGame()
    } else {
      this.#gamevm.ResumeGame()

    }
  }

  // ===================================
  // bind view model to view -> update on vm will reflect on view

  bindViewModel = () => {
    this.#gamevm.AddPropertyChangedListener('ActiveCell', this.renderBoard)
    this.#gamevm.AddPropertyChangedListener('ActiveCellData', this.renderActiveCellData)
    this.#gamevm.AddPropertyChangedListener('ActiveCellData', this.renderBoard)
    this.#gamevm.AddPropertyChangedListener('Duration', this.renderTime)
    this.#gamevm.AddPropertyChangedListener('Mistakes', this.renderMistakeStatus)
    this.#gamevm.AddPropertyChangedListener('Score', this.renderScore)
    this.#gamevm.AddPropertyChangedListener('Paused', this.renderPausedGame)
    this.#gamevm.AddPropertyChangedListener('Resumed', this.renderResumedGame)
    this.#gamevm.AddPropertyChangedListener('AvailableHints', this.renderAvailableHints)
    this.#gamevm.AddPropertyChangedListener('AvailableUndo', this.renderAvailableUndo)
    this.#gamevm.AddPropertyChangedListener('GameMode', this.renderGameMode)
    this.#gamevm.AddPropertyChangedListener('Game', this.renderUI)
    this.#gamevm.AddPropertyChangedListener('GameOver', this.renderGameOver)
    this.#gamevm.AddPropertyChangedListener('GameOver', this.renderBoard)
  }

  // ===================================
  // helpers
  removeSelectedCell = ({ row, col }) => {
    this.#uiBoard[row][col].classList.remove('selected')
    const baseRow = Math.floor(row / 3) * 3
    const baseCol = Math.floor(col / 3) * 3

    for (let i = 0; i < 9; i++) {
      this.#uiBoard[i][col].classList.remove('activated')
      this.#uiBoard[row][i].classList.remove('activated')
      this.#uiBoard[baseRow + Math.floor(i / 3)][baseCol + i % 3].classList.remove('activated')
    }
  }

  activeSelectedCell = ({ row, col }) => {
    const baseRow = Math.floor(row / 3) * 3
    const baseCol = Math.floor(col / 3) * 3

    this.#uiBoard[row][col].classList.add('selected')
    for (let i = 0; i < 9; i++) {
      const x = baseRow + Math.floor(i / 3)
      const y = baseCol + i % 3
      this.#uiBoard[i][col].classList.add('activated')
      this.#uiBoard[row][i].classList.add('activated')
      this.#uiBoard[x][y].classList.add('activated')
    }
  }

  createCellDataElement = (value) => {
    const div = document.createElement('div')
    div.classList.add('game-board__col__data')
    div.innerText = value
    return div
  }

  createCellNoteElement = (notes) => {
    const div = document.createElement('div')
    div.classList.add('game-board__col__note')
    for (let i = 1; i <= 9; i++) {
      const ele = document.createElement('div')
      if (notes.has(i)) {
        ele.innerText = i.toString()
        ele.classList.remove('hide')
      } else {
        ele.innerText = '_'
        ele.classList.add('hide')
      }
      div.appendChild(ele)
    }
    return div
  }

  parseTime = (hour, minute, second) => {
    let time = ""

    if (hour) {
      time = String(hour).padStart(2, '0')
      time += ":"
    }
    time += String(minute).padStart(2, '0')
    time += ":"
    time = time + String(second).padStart(2, '0')

    return time
  }

  renderCellData = (row, col, { data, duplicated, type, correct }) => {
    const cell = this.#uiBoard[row][col]
    const { data: currentValue } = this.#gamevm.ActiveCellData
    cell.className = 'game-board__col'

    if (!data || this.#gamevm.Paused || this.#gamevm.GameOver) {
      cell.replaceChildren()
      return
    }

    const isFill = type === 'fill' || type === 'pre-filled'
    const isEditableFill = type === 'fill'

    if (isEditableFill && !correct) cell.classList.add('input-incorrect')
    if (isEditableFill && correct) cell.classList.add('input-correct')
    if (isFill && duplicated) cell.classList.add('duplicated')
    if (currentValue && currentValue === data) cell.classList.add('doppelganger')

    const cellDataElement = isFill ? this.createCellDataElement(data) : this.createCellNoteElement(data)
    cell.replaceChildren(cellDataElement)
  }
}

new GameView(new GameViewModel(new GameManager()))
