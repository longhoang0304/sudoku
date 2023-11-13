class Sudoku {
  #activeBoard
  #expectedBoard
  #initBoard
  #difficulty

  static #DIFFICULTY_MAP = {
    'easy': [1, 1],
    'medium': [40, 45],
    'hard': [45, 50],
    'expert': [50, 55],
    'master': [55, 60],
    'legendary': [60, 65],
  }

  constructor(difficulty) {
    this.#difficulty = difficulty
    this.InitBoards()
  }

  get CurrentBoard() {
    return this.#activeBoard
  }

  get ExpectedBoard () {
    return this.#expectedBoard
  }

  get Difficulty() {
    return this.#difficulty
  }

  #initExpectedBoard() {
    this.#expectedBoard = []

    for (let i = 0; i < 9; i++) {
      const row = []
      for (let j = 0; j < 9; j++) {
        row.push(0)
      }
      this.#expectedBoard.push(row)
    }
  }

  #removeCells(noCells) {
    const removedCells = new Set()
    const board = []
    for (let i = 0; i < 9; i++) {
      board.push([...this.#expectedBoard[i]])
    }

    while (noCells) {
      const x = randInt(0, 9)
      const y = randInt(0, 9)
      const k = x * 9 + y
      if (removedCells.has(k)) continue
      removedCells.add(k)
      board[x][y] = 0
      noCells -= 1
    }

    return board
  }

  #getFillableValues = (row, col) => {
    const board = this.#expectedBoard
    const blockRow = Math.floor(row / 3) * 3
    const blockCol = Math.floor(col / 3) * 3
    const fillableValues = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])

    for (let i = 0; i < 9; i++) {
      if (board[i][col]) fillableValues.delete(board[i][col])
      if (board[row][i]) fillableValues.delete(board[row][i])
      // check square
      let x = blockRow + Math.floor(i / 3)
      let y = blockCol + (i % 3)
      if (board[x][y]) fillableValues.delete(board[x][y])
    }

    return fillableValues
  }

  SearchDuplicatedCells = (row, col) => {
    const blockRow = Math.floor(row / 3) * 3
    const blockCol = Math.floor(col / 3) * 3
    const errors = []
    const value = this.#activeBoard[row][col]

    if (!value) return errors

    for (let i = 0; i < 9; i++) {
      // check row
      if (i !== row && value === this.#activeBoard[i][col]) errors.push([i, col])

      // check col
      if (i !== col && value === this.#activeBoard[row][i]) errors.push([row, i])

      // check square
      let x = blockRow + Math.floor(i / 3)
      let y = blockCol + (i % 3)
      if (x !== row && y !== col && value === this.#activeBoard[x][y]) errors.push([x, y])
    }

    return errors
  }

  CheckCompleteStatus = (row, col) => {
    const blockRow = Math.floor(row / 3) * 3
    const blockCol = Math.floor(col / 3) * 3
    const completedRow = new Set()
    const completedCol = new Set()
    const completedBlk = new Set()

    for (let i = 0; i < 9; i++) {
      if (this.#activeBoard[i][col]) completedCol.add(this.#activeBoard[i][col])
      if (this.#activeBoard[row][i]) completedRow.add(this.#activeBoard[row][i])

      let x = blockRow + Math.floor(i / 3)
      let y = blockCol + (i % 3)
      if (this.#activeBoard[x][y]) completedBlk.add(this.#activeBoard[x][y])
    }

    return [completedRow.size === 9, completedCol.size === 9, completedBlk.size === 9]
  }

  UpdateCellValue = (row, col, cellValue) => {
    this.#activeBoard[row][col] = cellValue
  }

  LoadBoards(activeBoard, initBoard, expectedBoard) {
    this.#activeBoard = activeBoard
    this.#initBoard = initBoard
    this.#expectedBoard = expectedBoard
  }

  InitBoards() {
    const [min, max] = Sudoku.#DIFFICULTY_MAP[this.#difficulty]
    const noCells = randInt(min, max + 1)
    
    this.#initExpectedBoard()
    this.Solve()
    this.#initBoard = this.#removeCells(noCells)
    this.#activeBoard = []

    for (let i = 0; i < 9; i++) {
      this.#activeBoard.push([...this.#initBoard[i]])
    }
  }

  Solve() {
    const board = this.#expectedBoard

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c]) continue

        const fillableValues = this.#getFillableValues(r, c)
        let fSize = fillableValues.size
        let found = false

        if (!fSize) return false // not solvable
        while (fSize) {
          const v = [...fillableValues][randInt(0, fSize)]
          board[r][c] = v

          if (this.Solve()) {
            found = true
            break
          }

          board[r][c] = 0
          fillableValues.delete(v)
          fSize = fillableValues.size
        }
        if (!found) return false
      }
    }
    return true
  }

  Reset() {
    this.#activeBoard = []

    for (let i = 0; i < 9; i++) {
      this.#activeBoard.push([...this.#initBoard[i]])
    }
  }

  Won = () => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.#activeBoard[i][j] !== this.#expectedBoard[i][j]) return false
      }
    }
    return true
  }

  ToJson() {
    return {
      activeBoard: this.#activeBoard,
      initBoard: this.#initBoard,
      expectedBoard: this.#expectedBoard,
      difficulty: this.#difficulty,
    }
  }

  static Load(savedSudokuGame) {
    const sudokuGame = new Sudoku()
    const { activeBoard, initBoard, expectedBoard } = savedSudokuGame;
    sudokuGame.LoadBoards(activeBoard, initBoard, expectedBoard)
  }
}
