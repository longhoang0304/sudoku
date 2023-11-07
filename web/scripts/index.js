function toggleDifficultyMenu() {
  const diffPopup = document.getElementById('difficult-popup')
  const mainIsland = document.getElementById('menu-island')
  if (!diffPopup) {
    const err = 'Missing difficult popup!'
    console.log(err)
    throw err
  }

  if (!mainIsland) {
    const err = 'Missing main island!'
    console.log(err)
    throw err
  }

  if (diffPopup.className == 'off') {
    diffPopup.className = 'on'
    mainIsland.className = 'off'
    return
  }
  diffPopup.className = 'off'
  mainIsland.className = 'on'
}

function navToGame(evt) {
  const ele = evt.currentTarget
  const difficulty = ele.dataset.difficulty
  window.location = `game.html?difficulty=${difficulty}`
}

function init() {
  console.log('Initializing')
  const difficulties = document.getElementsByClassName('difficult-popup_item')
  if (!difficulties) return
  for (const difficulty of difficulties) {
    difficulty.dataset.difficulty = difficulty.innerHTML.trim().toLocaleLowerCase()
    difficulty.onclick = navToGame
  }
}

document.addEventListener('DOMContentLoaded', init);