function after(fn, timeout) {
  let cancelTk = null
  return function(...args) {
    if (!cancelTk) {
      fn(...args)
      cancelTk = setTimeout(() => cancelTk = null, timeout)
      return  
    }
    clearInterval(cancelTk)
    cancelTk = setTimeout(() => cancelTk = null, timeout)
  }
}
function randInt(min=0, max=9999999) {
  return Math.floor(Math.random() * (max - min) + min)
}
