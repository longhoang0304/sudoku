class GameViewModel extends Observable {
  #gameManager
  #durationTracker

  constructor(gameManager) {
    super()
    this.#gameManager = gameManager
    this.NewGame()
  }

  get ActiveSudokuBoard() {
    return this.#gameManager.ActiveSudokuBoard
  }

  get ActiveCell() {
    const [row, col] = this.#gameManager.ActiveCell
    return {
      row,
      col,
    }
  }

  get ActiveCellData() {
    const { row, col } = this.ActiveCell
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

  NewGame() {
    this.#gameManager.NewGame()
    this.#durationTracker = setInterval(this.TrackDuration, 1000)
  }

  SelectCell = (row, col) => {
    this.Status && this.ResumeGame()
    const prevValue = this.ActiveCell
    this.#gameManager.SelectCell(row, col)
    this.PropertyChanged('ActiveCell', prevValue)
  }

  TrackDuration = () => {
    this.#gameManager.Duration += 1
    this.PropertyChanged('Duration')
  }

  UpdateActiveCellData = (cellData) => {
    this.Paused && this.ResumeGame()
    const prevValue = this.ActiveCell
    if (!this.#gameManager.UpdateActiveCellData(cellData)) return
    this.PropertyChanged('Mistakes')
    this.PropertyChanged('AvailableUndo')
    this.PropertyChanged('ActiveCellData')
    this.PropertyChanged('ActiveCell', prevValue)
  }

  Undo = () => {
    this.Paused && this.ResumeGame()
    const prevValue = this.ActiveCell
    if(!this.#gameManager.Undo()) return
    this.PropertyChanged('Mistakes')
    this.PropertyChanged('AvailableUndo')
    this.PropertyChanged('ActiveCellData')
    this.PropertyChanged('ActiveCell', prevValue)
  }

  PauseGame = () => {
    this.#gameManager.PauseGame()
    clearInterval(this.#durationTracker)
    this.PropertyChanged('Paused')
  }

  ResumeGame = () => {
    this.#gameManager.ResumeGame()
    this.#durationTracker = setInterval(this.TrackDuration, 1000)
    this.PropertyChanged('Resumed')
  }

  Hint = () => {
    const prevValue = this.ActiveCell
    this.#gameManager.Hint()
    this.PropertyChanged('ActiveCell', prevValue)
    this.PropertyChanged('ActiveCellData')
    this.PropertyChanged('AvailableHints')
    this.PropertyChanged('AvailableUndo')
  }

  ToggleGameMode = () => {
    this.#gameManager.ToggleGameMode()
    this.PropertyChanged('GameMode')
  }
}
