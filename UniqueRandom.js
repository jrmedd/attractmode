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
    this.last = newNumber
    this.buffer.map((value, index) => {
      index < (this.buffer.length - 1)  ? this.buffer[index] = this.buffer[index + 1] : this.buffer[index] = newNumber
    })
    return newNumber
  }
}

module.exports = UniqueRandom
