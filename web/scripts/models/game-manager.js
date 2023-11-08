class GameManager {
  #sudoku = null
  #date = null
  #histories = []
  #mistakes = 0
  #hints = []
  #activeCell = [0, 0]
  #duration = 0
  #score = 0
  #paused = false
  #allowedMistakes = 5

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

  set Duration(newValue) {
    this.#duration = newValue
  }


  // ===============
  // === HANDLER ===

  #initGame() {
    this.#date = new Date()
    this.#histories = []
    this.#mistakes = 0
    this.#hints = []
    this.#activeCell = [0, 0]
    this.#duration = 0
    this.#score = 0
    this.#paused = false
  }

  NewGame = (difficulty = 'easy') => {
    this.#sudoku = new Sudoku(difficulty)
    this.#initGame()
  }

  SelectCell = (row, col) => {
    this.#activeCell = [row, col]
  }

  UpdateCell = (newValue) => {
    const [row, col] = this.#activeCell
    if (!this.#sudoku.CanUpdateCellValue(row, col)) return false

    const prevValue = this.CurrentBoard[row][col]
    if (prevValue === newValue) return false

    this.#sudoku.UpdateCellValue(row, col, newValue)

    const state = {
      activeCell: this.#activeCell,
      prevValue,
      newValue,
    }
    this.#histories.push(state)

    return true
  }

  Undo = () => {
    if (!this.#histories.length) return false

    const state = this.#histories.pop() // recover the latest state

    this.SelectCell(...state.activeCell)
    // don't call UpdateCell because it will append to history
    this.#sudoku.UpdateCellValue(...state.activeCell, state.prevValue)

    return true
  }

  PauseGame = () => {
    this.#paused = true
  }

  ResumeGame = () => {
    this.#paused = false
  }

  RestartGame = () => {
    this.#sudoku.Reset()
    this.#initGame()
  }
}

