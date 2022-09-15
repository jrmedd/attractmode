class UniqueRandom {
  constructor (max) {
    this.max = max
    this.last = 0
  }

  get new () {
    let newNumber
    do {
      newNumber = parseInt(Math.random() * this.max)
    } while (newNumber === this.last)
    this.last = newNumber
    return newNumber
  }
}

module.exports = UniqueRandom
