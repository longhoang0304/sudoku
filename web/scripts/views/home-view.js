class HomeView {
  constructor() {
    this.difficultyPopup = new DifficultyPopupView(this.goToGamePage.bind(this))
    document.addEventListener('DOMContentLoaded', this.kickStartInitProcess.bind(this));
  }

  goToGamePage(evt) {
    const ele = evt.currentTarget
    const difficulty = ele.dataset.difficulty
    localStorage.setItem('difficulty', difficulty)
    window.location = 'game.html'
  }

  registerEventHandlerForNewGame() {
    const mainIsland = document.getElementById('menu-island')
    const newGameEle = mainIsland.children[1]
    newGameEle.onclick = this.difficultyPopup.toggleDifficultyMenu.bind(this.difficultyPopup)
  }

  registerEventHandlerForBackBtn() {
    const diffiPopup = document.getElementById('difficulty-popup')
    const backBtn = diffiPopup.children.item(diffiPopup.children.length - 1)
    backBtn.onclick = this.difficultyPopup.toggleDifficultyMenu.bind(this.difficultyPopup)
  }

  kickStartInitProcess() {
    this.registerEventHandlerForNewGame()
    this.registerEventHandlerForBackBtn()
  }
}

const homeView = new HomeView()
