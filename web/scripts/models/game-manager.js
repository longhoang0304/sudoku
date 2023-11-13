class GameManager {
  #sudoku = null
  #date = null
  #histories = null
  #mistakes = 0
  #usedHints = 0
  #activeCell = [0, 0]
  #gameBoard = null
  #duration = 0
  #score = 0
  #status = 'started'
  #mode = 'fill'
  #maxScore = 0
  #thinkingStart = null
  #scoredCells = null
  #completedRows = null
  #completedCols = null
  #completedBlks = null
  #allowedMistakes = 5
  #allowedHints = 5
  static #SCORE_DEDUCTION = 5
  static #THINKING_INTERVAL = 5
  static #MAX_SCORE_MAP = {
    'easy': 25,
    'medium': 50,
    'hard': 75,
    'expert': 100,
    'master': 125,
    'legendary': 150
  }

  // ============
  // == GETTER ==
  get ActiveCell() {
    return this.#activeCell
  }

  get Score() {
    return this.#score
  }

  get AllowedMistakes() {
    return this.#allowedMistakes
  }

  get Mistakes() {
    return this.#mistakes
  }

  get Duration() {
    return this.#duration
  }

  get Difficulty() {
    return this.#sudoku.Difficulty
  }

  get Status() {
    return this.#status
  }

  get AvailableHints() {
    return this.#allowedHints - this.#usedHints
  }

  get AvailableUndo() {
    return this.#histories.length
  }

  get Mode() {
    return this.#mode
  }

  get GameBoard() {
    return this.#gameBoard
  }

    get CompletedSets() {
    return [this.#completedRows, this.#completedCols, this.#completedBlks]
  }

  set Duration(newValue) {
    this.#duration = newValue
  }


  // ===============
  // === HANDLER ===

  #initGame = () => {
    this.#date = new Date()
    this.#histories = []
    this.#mistakes = 0
    this.#usedHints = 0
    this.#activeCell = [0, 0]
    this.#duration = 0
    this.#score = 0
    this.#status = 'started'
    this.#mode = 'fill'
    this.#scoredCells = new Set()
    this.#thinkingStart = new Date()
    this.#maxScore = GameManager.#MAX_SCORE_MAP[this.#sudoku.Difficulty]
    this.#gameBoard = [...new Array(9)].map(() => [...new Array(9)])
    this.#completedRows = new Set()
    this.#completedCols = new Set()
    this.#completedBlks = new Set()
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const isDefault = !!this.#sudoku.CurrentBoard[i][j]
        this.#gameBoard[i][j] = {
          data: this.#sudoku.CurrentBoard[i][j],
          duplicated: 0,
          correct: false,
          type: isDefault ? 'pre-filled' : 'fill',
        }
      }
    }
  }

  #rewardScore = () => {
    const [row, col] = this.#activeCell
    const cellData = this.#gameBoard[row][col]
    const cellKey = row * 9 + col

    if (this.#scoredCells.has(cellKey)) return
    if (!cellData.correct) return

    const thinkingTimeGap = Math.floor((new Date() - this.#thinkingStart) / (GameManager.#THINKING_INTERVAL * 1000))
    let score = Math.max(GameManager.#SCORE_DEDUCTION, this.#maxScore - thinkingTimeGap * GameManager.#SCORE_DEDUCTION)
    const [completedRow, completedCol, completedBlk] = this.#sudoku.CheckCompleteStatus(row, col)

    if (completedRow && !this.#completedRows.has(row)) {
      this.#completedRows.add(row)
      score += this.#maxScore * 4
    }

    if (completedCol && !this.#completedCols.has(col)) {
      this.#completedCols.add(col)
      score += this.#maxScore * 4
    }

    const blockKey = Math.floor(row / 3) * 3 * 9 + Math.floor(col / 3) * 3
    if (completedBlk && !this.#completedRows.has(blockKey)) {
      this.#completedBlks.add(blockKey)
      score += this.#maxScore * 4
    }

    this.#score += score
    this.#thinkingStart = new Date()
    this.#scoredCells.add(cellKey)
  }

  #checkActiveCellMistakes = (isUndo = false) => {
    const [row, col] = this.#activeCell
    const cellData = this.#gameBoard[row][col]
    const duplicatedCells = this.#sudoku.SearchDuplicatedCells(row, col)
    const expectedValue = this.#sudoku.ExpectedBoard[row][col]
    const incorrect = cellData.data !== expectedValue

    if (!isUndo) this.#mistakes += incorrect
    cellData.correct = !incorrect

    if (!duplicatedCells.length) return

    cellData.duplicated += 1
    for (const [r, c] of duplicatedCells) {
      this.#gameBoard[r][c].duplicated += 1
    }
  }

  #removeActiveCellMistakes = () => {
    const [row, col] = this.#activeCell
    this.#gameBoard[row][col].duplicated = 0
    const duplicatedCells = this.#sudoku.SearchDuplicatedCells(row, col)

    for (const [r, c] of duplicatedCells) {
      const duplicated = this.#gameBoard[r][c].duplicated
      this.#gameBoard[r][c].duplicated = Math.max(0, duplicated  - 1)
    }
  }

  #recordHistory = () => {
    const [row, col] = this.#activeCell
    const prevData = this.#gameBoard[row][col]
    const { duplicated, correct, type, data } = prevData
    const state = {
      row, col,
      prev: {
        duplicated,
        correct,
        type,
        data
      },
    }

    if (type === 'note') {
      state.prev.data = data && new Set([...data])
    }
    this.#histories.push(state)
  }

  NewGame = (difficulty) => {
    this.#sudoku = new Sudoku(difficulty)
    this.#initGame()
  }

  SelectCell = (row, col) => {
    this.#activeCell = [row, col]
  }

  UpdateActiveCellData = (cellData) => {
    const [row, col] = this.#activeCell
    const { type } = this.#gameBoard[row][col]

    if (type === 'pre-filled') return false
    this.#recordHistory()

    if (type === 'fill') {
      this.#removeActiveCellMistakes()
    }

    let success

    if (this.#mode === 'fill') success = this.UpdateActiveCellFill(cellData)
    else success = this.UpdateActiveNoteCell(cellData)

    if (!success) this.#histories.pop()
    return success
  }

  UpdateActiveCellFill = (newValue) => {
    const [row, col] = this.#activeCell
    const prevData = this.#gameBoard[row][col]
    const { data: prevValue } = prevData

    if (prevValue === newValue) return false

    this.#gameBoard[row][col] = {
      ...prevData,
      data: newValue,
      type: 'fill',
    }
    this.#sudoku.UpdateCellValue(row, col, newValue)

    this.#checkActiveCellMistakes(false)
    this.#rewardScore()

    if (this.#sudoku.Won()) {
      this.#status = 'won'
      return true
    }

    if (this.#mistakes > this.#allowedMistakes) {
      this.#status = 'lose'
    }
    return true
  }

  UpdateActiveNoteCell = (noteValue) => {
    const [row, col] = this.#activeCell
    const prevData = this.#gameBoard[row][col]
    let { data: cellNote } = prevData

    if (noteValue < 0 || noteValue > 9) return false
    if (!noteValue && !cellNote) return false

    if (!noteValue && cellNote) cellNote = null
    else {
      if (!(cellNote instanceof Set)) cellNote = new Set()
      if (cellNote.has(noteValue)) cellNote.delete(noteValue)
      else cellNote.add((noteValue))
    }

    this.#gameBoard[row][col] = {
      data: cellNote,
      type: 'note',
      correct: false,
      duplicated: 0,
    }
    this.#sudoku.UpdateCellValue(row, col, 0)
    return true
  }

  Undo = () => {
    if (!this.#histories.length) return false

    const state = this.#histories.pop() // recover the latest state
    const { row, col, prev } = state

    this.#removeActiveCellMistakes()
    this.SelectCell(row, col)
    this.#gameBoard[row][col] = prev

    if (prev.type === 'fill') this.#sudoku.UpdateCellValue(row, col, prev.data)
    else this.#sudoku.UpdateCellValue(row, col, 0)

    this.#checkActiveCellMistakes(true)
    return true
  }

  PauseGame = () => {
    this.#status = 'paused'
  }

  ResumeGame = () => {
    this.#status = 'started'
  }

  Hint = () => {
    if (this.#usedHints === this.#allowedHints) return false

    const expectedBoard = this.#sudoku.ExpectedBoard
    let x, y

    do {
      x = randInt(0, 9)
      y = randInt(0, 9)
    } while (this.#gameBoard[x][y].type === 'pre-filled');

    this.#usedHints += 1
    this.SelectCell(x, y)
    this.UpdateActiveCellFill(expectedBoard[x][y])

    return true
  }

  ToggleGameMode = () => {
    if (this.#mode === 'fill') this.#mode = 'note'
    else this.#mode = 'fill'
  }

  RestartGame = () => {
    this.#sudoku.Reset()
    this.#initGame()
  }
}

