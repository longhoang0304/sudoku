class GameViewModel extends Observable {
  #gameManager
  #durationTracker
  static #ALLOWED_DIFFICULTY = new Set(["easy", "medium", "hard", "expert", "master", "legendary"])

  constructor(gameManager) {
    super()
    this.#gameManager = gameManager
  }

  get ActiveCellData() {
    const [ row, col ] = this.#gameManager.ActiveCell
    const data = this.#gameManager.GameBoard[row][col]

    return {
      row,
      col,
      ...data,
    }
  }

  get Mistakes() {
    return this.#gameManager.Mistakes
  }

  get AllowedMistakes() {
    return this.#gameManager.AllowedMistakes
  }

  get Score() {
    return this.#gameManager.Score
  }

  get Difficulty() {
    return this.#gameManager.Difficulty
  }

  get Paused() {
    return this.#gameManager.Status === 'paused'
  }

  get AvailableHints() {
    return this.#gameManager.AvailableHints
  }

  get AvailableUndo() {
    return this.#gameManager.AvailableUndo
  }

  get Duration() {
    let duration = this.#gameManager.Duration

    const hour = Math.floor(duration / (3600))
    duration -= 3600 * hour

    const minute = Math.floor(duration / 60)
    duration -= minute * 60

    const second = duration
    return [hour, minute, second]
  }

  get GameBoard() {
    return this.#gameManager.GameBoard
  }

  get Mode() {
    return this.#gameManager.Mode
  }

  #checkDifficulty(difficulty) {
    if (GameViewModel.#ALLOWED_DIFFICULTY.has(difficulty)) return
    console.error(`${difficulty} is not supported`)
    window.location = 'index.html'
  }

  NewGame(difficulty) {
    clearInterval(this.#durationTracker)
    this.#checkDifficulty(difficulty)
    this.#gameManager.NewGame(difficulty)
    this.#durationTracker = setInterval(this.TrackDuration, 1000)
    this.PropertyChanged('Game')
  }

  SelectCell = (row, col) => {
    this.Status && this.ResumeGame()
    const prevValue = this.ActiveCellData
    this.#gameManager.SelectCell(row, col)
    this.PropertyChanged('ActiveCell', prevValue)
  }

  TrackDuration = () => {
    this.#gameManager.Duration += 1
    this.PropertyChanged('Duration')
  }

  UpdateActiveCellData = (cellData) => {
    this.Paused && this.ResumeGame()
    const prevValue = this.ActiveCellData
    if (!this.#gameManager.UpdateActiveCellData(cellData)) return
    this.PropertyChanged('Mistakes')
    this.PropertyChanged('AvailableUndo')
    this.PropertyChanged('ActiveCellData')
    this.PropertyChanged('ActiveCell', prevValue)
  }

  Undo = () => {
    this.Paused && this.ResumeGame()
    const prevValue = this.ActiveCellData

    if(!this.#gameManager.Undo()) return

    this.PropertyChanged('Mistakes')
    this.PropertyChanged('AvailableUndo')
    this.PropertyChanged('ActiveCellData')
    this.PropertyChanged('ActiveCell', prevValue)
  }

  PauseGame = () => {
    if (this.#gameManager.Status !== 'started') return

    this.#gameManager.PauseGame()
    clearInterval(this.#durationTracker)
    this.PropertyChanged('Paused')
  }

  ResumeGame = () => {
    if (this.#gameManager.Status !== 'paused') return

    this.#gameManager.ResumeGame()
    this.#durationTracker = setInterval(this.TrackDuration, 1000)
    this.PropertyChanged('Resumed')
  }

  Hint = () => {
    const prevValue = this.ActiveCellData

    if(!this.#gameManager.Hint()) return

    this.PropertyChanged('ActiveCell', prevValue)
    this.PropertyChanged('ActiveCellData')
    this.PropertyChanged('AvailableHints')
    this.PropertyChanged('AvailableUndo')
  }

  ToggleGameMode = () => {
    this.#gameManager.ToggleGameMode()
    this.PropertyChanged('GameMode')
  }

  RestartGame = () => {
    clearInterval(this.#durationTracker)
    this.#gameManager.RestartGame()
    this.#durationTracker = setInterval(this.TrackDuration, 1000)
    this.PropertyChanged('Game')
  }

  DifficultySelected = (difficulty) => {
    localStorage.setItem('difficulty', difficulty)
    this.NewGame(difficulty)
  }

  InitGame = () => {
    const difficulty = localStorage.getItem('difficulty')
    this.NewGame(difficulty)
  }
}
