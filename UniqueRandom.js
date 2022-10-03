class UniqueRandom {
  constructor (max, bufferSize) {
    this.max = max
    this.buffer = new Array(bufferSize).fill(-1)
  }

  get new () {
    let newNumber
    do {
      newNumber = parseInt(Math.random() * this.max)
    } while (this.buffer.includes(newNumber))
    this.buffer.shift()
    this.buffer.push(newNumber)
    return newNumber
  }
}

module.exports = UniqueRandom
