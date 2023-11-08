class GameViewModel extends Observable {
  #gameManager
  #durationTracker

  constructor(gameManager) {
    super()
    this.#gameManager = gameManager
    this.NewGame()
  }

  get ActiveSudokuBoard() {
    return this.#gameManager.CurrentBoard
  }

  get ActiveCell() {
    return this.#gameManager.ActiveCell
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

  get Duration() {
    let duration = this.#gameManager.Duration

    const hour = Math.floor(duration / (3600))
    duration -= 3600 * hour

    const minute = Math.floor(duration / 60)
    duration -= minute * 60

    const second = duration
    return [hour, minute, second]
  }

  NewGame() {
    this.#gameManager.NewGame()
    this.#durationTracker = setInterval(this.TrackDuration, 1000)
  }

  SelectCell = (row, col) => {
    const prevValue = this.#gameManager.ActiveCell
    this.#gameManager.SelectCell(row, col)
    this.PropertyChanged('ActiveCell', prevValue)
  }

  TrackDuration = () => {
    this.#gameManager.Duration += 1
    this.PropertyChanged('Duration')
  }

  UpdateCell = (cellValue) => {
    if (!this.#gameManager.UpdateCell(cellValue)) return
    this.PropertyChanged('ActiveCellValue')
  }
}
