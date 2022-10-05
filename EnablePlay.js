class EnablePlay {
  constructor (defaultSetting = false) {
    this.enabled = defaultSetting
  }

  setEnabled (value) {
    this.enabled = value == 1
    console.debug('Currently set to ', this.enabled)
  }

  get isEnabled() {
    return this.enabled
  }
}

module.exports = EnablePlay
