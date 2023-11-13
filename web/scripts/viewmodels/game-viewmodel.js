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

  get GameOver() {
    return this.Lose || this.Won
  }

  get Lose() {
    return this.#gameManager.Status === 'lose'
  }

  get Won() {
    return this.#gameManager.Status === 'won'
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

  TrackDuration = () => {
    this.#gameManager.Duration += 1
    this.PropertyChanged('Duration')
  }

  SelectCell = (row, col) => {
    if (this.GameOver) return
    this.Status && this.ResumeGame()

    const prevValue = this.ActiveCellData
    this.#gameManager.SelectCell(row, col)
    this.PropertyChanged('ActiveCell', prevValue)
  }

  UpdateActiveCellData = (cellData) => {
    if (this.GameOver) return
    this.Paused && this.ResumeGame()

    const prevValue = this.ActiveCellData
    const completedSets = this.#gameManager.CompletedSets.map(e => e.size)
    if (!this.#gameManager.UpdateActiveCellData(cellData)) return
    this.PropertyChanged('Score')
    this.PropertyChanged('Mistakes')
    this.PropertyChanged('AvailableUndo')
    this.PropertyChanged('ActiveCellData')
    this.PropertyChanged('ActiveCell', prevValue)

    if (!this.GameOver) {
      const newCompletedSets = this.#gameManager.CompletedSets.map(e => e.size)
      if (newCompletedSets[0] > completedSets[0]) this.PropertyChanged('RowCompleted')
      if (newCompletedSets[1] > completedSets[1]) this.PropertyChanged('ColCompleted')
      if (newCompletedSets[2] > completedSets[2]) this.PropertyChanged('BlockCompleted')
    }
    if (this.Won) this.PropertyChanged('BoardCompleted')

    this.CheckGameGameStatus()
  }

  CheckGameGameStatus = () => {
    if (!this.GameOver) return
    clearInterval(this.#durationTracker)
    this.PropertyChanged('GameOver')
  }

  Undo = () => {
    if (this.GameOver) return
    this.Paused && this.ResumeGame()

    const prevValue = this.ActiveCellData
    if(!this.#gameManager.Undo()) return
    this.PropertyChanged('Mistakes')
    this.PropertyChanged('AvailableUndo')
    this.PropertyChanged('ActiveCellData')
    this.PropertyChanged('ActiveCell', prevValue)
  }

  PauseGame = () => {
    if (this.GameOver) return
    if (this.#gameManager.Status !== 'started') return

    this.#gameManager.PauseGame()
    clearInterval(this.#durationTracker)
    this.PropertyChanged('Paused')
  }

  ResumeGame = () => {
    if (this.GameOver) return
    if (this.#gameManager.Status !== 'paused') return

    this.#gameManager.ResumeGame()
    this.#durationTracker = setInterval(this.TrackDuration, 1000)
    this.PropertyChanged('Resumed')
  }

  Hint = () => {
    if (this.GameOver) return
    this.Paused && this.ResumeGame()

    const prevValue = this.ActiveCellData
    if(!this.#gameManager.Hint()) return
    this.PropertyChanged('ActiveCell', prevValue)
    this.PropertyChanged('ActiveCellData')
    this.PropertyChanged('AvailableHints')
    this.PropertyChanged('AvailableUndo')
    this.PropertyChanged('Score')
  }

  ToggleGameMode = () => {
    if (this.GameOver) return

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
