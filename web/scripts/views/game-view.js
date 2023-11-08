class GameView {
  #gamevm
  constructor(gamevm) {
    this.#gamevm = gamevm
    this.uiBoard = []

    this.difficultyPopup = new DifficultyPopupView(this.createNewGame, this.handleModelStateUpdated)
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
    this.uiBoard = []
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
        this.uiBoard.push(cells)
      }
    }
  }

  renderUI() {
    this.renderStatus()
    const board = this.#gamevm.ActiveSudokuBoard
    this.renderBoard(board)
    this.renderActiveCell(null)
  }

  renderTime = () => {
    const [hour, minute, second] = this.#gamevm.Duration
    const timeEle = document.getElementById('status-time')
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
    const cellElement = this.uiBoard[row][col]

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
        this.uiBoard[i][j].innerText = sudokuBoard[i][j] || '_' 
        if (!sudokuBoard[i][j]) this.uiBoard[i][j].classList.add('hide')
        else this.uiBoard[i][j].classList.remove('hide')
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
  }

  erasePressed = () => {
    this.#gamevm.UpdateCell(0)
  }

  registerActionPressedHandler() {
    const actions = document.getElementById('actions')
    // erase
    actions.children[1].onclick = after(this.erasePressed, 250)
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
    document.addEventListener('keydown', after(this.handleKeyPress, 250))
  }

  handleKeyPress = (evt) => {
    const { keyCode } = evt;
    if (keyCode === 8 || keyCode === 46) { // backspace and delete
      this.#gamevm.UpdateCell(0)
    }
    if (keyCode < 49 || keyCode > 57) return
    this.#gamevm.UpdateCell(keyCode - 48)
  }

  registerCellPressedHandler = () => {
    this.uiBoard.forEach(row => row.forEach(ele => ele.addEventListener('click', this.activeCell)))
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
    newGameEle.onclick = this.difficultyPopup.toggleDifficultyMenu
  }

  registerBackBtnPressedHandler = () => {
    const diffiPopup = document.getElementById('difficulty-popup')
    const backBtn = diffiPopup.children.item(diffiPopup.children.length - 1)
    backBtn.onclick = this.difficultyPopup.toggleDifficultyMenu
  }

  registerBackToHomeBtnPressedHandler = () => {
    const header = document.getElementById('header')
    header.children[0].onclick = this.backToHome
  }

  backToHome() {
    // push pause game event
    window.location = 'index.html'
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
  }

  // ===================================
  // helpers
  removeSelectedCell = ([row, col]) => {
    this.uiBoard[row][col].classList.remove('selected')
    for (const ele of this.uiBoard[row]) {
      ele.classList.remove('activated')
    }
    for (let i = 0; i < 9; i++) {
      const ele = this.uiBoard[i][col]
      ele.classList.remove('activated')
    }
  
    const baseRow = Math.floor(row / 3) * 3
    const baseCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
        const ele = this.uiBoard[baseRow + i][baseCol + j]
        ele.classList.remove('activated')
      }
    }
  }

  activeSelectedCell = ([row, col]) => {
    this.uiBoard[row][col].classList.add('selected')
    for (const ele of this.uiBoard[row]) {
      ele.classList.add('activated')
    }
  
    for (let i = 0; i < 9; i++) {
      const ele = this.uiBoard[i][col]
      ele.classList.add('activated')
    }
  
    const baseRow = Math.floor(row / 3) * 3
    const baseCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const ele = this.uiBoard[baseRow + i][baseCol + j]
        ele.classList.add('activated')
      }
    }
  }
}

const normalGameVM = new GameViewModel(new GameManager())
new GameView(normalGameVM)
