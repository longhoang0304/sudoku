class Sudoku {
  #activeBoard
  #expectedBoard
  #initBoard
  #difficulty

  static #DIFFICULTY_MAP = {
    'easy': [40, 45],
    'medium': [45, 50],
    'normal': [45, 50],
    'hard': [50, 55],
    'expert': [55, 60],
    'master': [60, 70],
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

  CanUpdateCellValue = (row, col) => {
    return !this.#initBoard[row][col]
  }

  UpdateCellValue = (row, col, cellValue) => {
    this.#activeBoard[row][col] = cellValue
  }

  LoadBoards(activeBoard, initBoard, expectedBoard) {
    this.#activeBoard = activeBoard
    this.#initBoard = initBoard
    this.#expectedBoard = expectedBoard
  }

  genCompleteBoard() {
    this.#expectedBoard = []

    for (let i = 0; i < 9; i++) {
      const row = []
      for (let j = 0; j < 9; j++) {
        row.push(Math.floor(Math.random() * 9 + 1))
      }
      this.#expectedBoard.push(row)
    }
  }

  removeCells(noCells) {
    const removedCells = new Set()
    const board = []
    for (let i = 0; i < 9; i++) {
      board.push([...this.#expectedBoard[i]])
    }

    while (noCells) {
      const x = Math.floor(Math.random() * 9)
      const y = Math.floor(Math.random() * 9)
      const k = x * 9 + y
      if (removedCells.has(k)) continue
      removedCells.add(k)
      board[x][y] = 0
      noCells -= 1
    }

    return board
  }

  InitBoards() {
    const [min, max] = Sudoku.#DIFFICULTY_MAP[this.#difficulty]
    const noCells = Math.floor(Math.random() * (max - min) + min)
    
    this.genCompleteBoard()
    this.#initBoard = this.removeCells(noCells)
    this.#activeBoard = []

    for (let i = 0; i < 9; i++) {
      this.#activeBoard.push([...this.#initBoard[i]])
    }
  }

  Solve() {
    
  }

  Reset() {
    this.#activeBoard = []

    for (let i = 0; i < 9; i++) {
      this.#activeBoard.push([...this.#initBoard[i]])
    }
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
