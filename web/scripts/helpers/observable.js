class Observable {
  #trackProperties = {}

  PropertyChanged = (name, oldValue = null, newValue = null, obj = null) => {
    if (!this.#trackProperties[name]) return
    for (const fn of this.#trackProperties[name]) {
      if (!(fn instanceof Function)) return
      fn(oldValue, newValue, obj)
    }
  }

  AddPropertyChangedListener = (propertyName, handler) => {
    if (!this.#trackProperties[propertyName]) this.#trackProperties[propertyName] = []
    this.#trackProperties[propertyName].push(handler)
  }
}
