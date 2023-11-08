class DifficultyPopupView {
  constructor(difficultyHandler, difficultyMenuCb) {
    this.difficultyHandler = difficultyHandler
    this.difficultyMenuCb = difficultyMenuCb
    document.addEventListener('DOMContentLoaded', this.kickStartInitProcess.bind(this));
  }

  toggleDifficultyMenu() {
    const diffPopup = document.getElementById('difficulty-popup')
    if (!diffPopup) {
      const err = 'Missing difficult popup!'
      console.error(err)
      throw err
    }

    if (diffPopup.className === 'off') diffPopup.className = 'on'
    else diffPopup.className = 'off'
    if (this.difficultyMenuCb) this.difficultyMenuCb(diffPopup.className)
  }

  registerDifficultyHandler() {
    const difficulties = document.getElementsByClassName('difficulty-popup__item')
    if (!difficulties) return
    for (const difficulty of difficulties) {
      difficulty.dataset.difficulty = difficulty.innerHTML.trim().toLocaleLowerCase()
      difficulty.onclick = this.difficultyHandler
    }
  }

  kickStartInitProcess() {
    this.registerDifficultyHandler()
  }
}
