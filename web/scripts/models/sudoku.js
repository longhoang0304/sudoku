class Sudoku {
  #activeBoard
  #expectedBoard
  #initBoard
  #difficulty

  static #DIFFICULTY_MAP = {
    'easy': [35, 40],
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
        row.push(randInt(1, 10))
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

  InitBoards() {
    const [min, max] = Sudoku.#DIFFICULTY_MAP[this.#difficulty]
    const noCells = randInt(min, max + 1)
    
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
