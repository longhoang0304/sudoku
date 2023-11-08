class GameManager {
  #sudoku = null
  #date = null
  #histories = []
  #mistakes = 0
  #hints = 0
  #activeCell = [0, 0]
  #cellData = null
  #duration = 0
  #score = 0
  #paused = false
  #mode = 'fill'
  #allowedMistakes = 5
  #allowedHints = 5

  // ============
  // == GETTER ==
  get CurrentBoard() {
    return this.#sudoku.CurrentBoard
  }

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

  get Paused() {
    return this.#paused
  }

  get AvailableHints() {
    return this.#allowedHints - this.#hints
  }

  get AvailableUndo() {
    return this.#histories.length
  }

  get Mode() {
    return this.#mode
  }

  get CellData() {
    return this.#cellData
  }

  set Duration(newValue) {
    this.#duration = newValue
  }


  // ===============
  // === HANDLER ===

  #initGame() {
    this.#date = new Date()
    this.#histories = []
    this.#mistakes = 0
    this.#hints = 0
    this.#activeCell = [0, 0]
    this.#duration = 0
    this.#score = 0
    this.#paused = false
    this.#mode = 'fill'
    this.#cellData = [...new Array(9)].map(() => [...new Array(9)])
  }

  #recordHistory(prev) {
    const [row, col] = this.#activeCell
    const state = {
      row, col,
      prev,
    }
    this.#histories.push(state)
  }

  NewGame = (difficulty = 'master') => {
    this.#sudoku = new Sudoku(difficulty)
    this.#initGame()
  }

  SelectCell = (row, col) => {
    this.#activeCell = [row, col]
  }

  HandleCellData = (cellData) => {
    if (this.#mode === 'fill') {
      return this.UpdateCell(cellData)
    }
    return this.UpdateNoteCell(cellData)
  }

  UpdateCell = (newValue) => {
    const [row, col] = this.#activeCell
    const prevValue = this.CurrentBoard[row][col]

    if (!this.#sudoku.CanUpdateCellValue(row, col)) return false
    if (prevValue === newValue) return false

    this.#recordHistory(prevValue)

    this.#cellData[row][col] = newValue
    this.#sudoku.UpdateCellValue(row, col, newValue)
    return true
  }

  UpdateNoteCell = (noteValue) => {
    const [row, col] = this.#activeCell
    let cellNote = this.#cellData[row][col]

    if (!this.#sudoku.CanUpdateCellValue(row, col)) return false
    if (noteValue < 0 || noteValue > 9) return false
    if (!noteValue && !cellNote) return false

    const prevValue = cellNote instanceof Set ? new Set([...cellNote]) : cellNote

    if (!noteValue && cellNote) cellNote = null
    else {
      if (!(cellNote instanceof Set)) cellNote = new Set()
      if (cellNote.has(noteValue)) cellNote.delete(noteValue)
      else cellNote.add((noteValue))
    }

    this.#recordHistory(prevValue)

    this.#cellData[row][col] = cellNote
    this.#sudoku.UpdateCellValue(row, col, 0)
    return true
  }

  Undo = () => {
    if (!this.#histories.length) return false

    const state = this.#histories.pop() // recover the latest state
    const { row, col, prev } = state

    this.SelectCell(row, col)
    this.#cellData[row][col] = prev

    if (Number.isInteger(prev)) this.#sudoku.UpdateCellValue(row, col, prev)
    else this.#sudoku.UpdateCellValue(row, col, 0)

    return true
  }

  PauseGame = () => {
    this.#paused = true
  }

  ResumeGame = () => {
    this.#paused = false
  }

  Hint = () => {
    if (this.#hints === this.#allowedHints) return

    const expectedBoard = this.#sudoku.ExpectedBoard
    const currentBoard = this.#sudoku.CurrentBoard
    let x, y

    while (true) {
      x = randInt(0, 9)
      y = randInt(0, 9)
      if (currentBoard[x][y]) continue
      break
    }

    this.#hints += 1
    this.SelectCell(x, y)
    this.UpdateCell(expectedBoard[x][y])
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

