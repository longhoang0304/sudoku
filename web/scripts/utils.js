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
