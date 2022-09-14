const cores = require('./cores.json')

function selectCore (extension) {
  const selectedCore = Object.keys(cores).find(core => cores[core].permittedExtensions.includes(extension))
  return cores[selectedCore]
}

module.exports = selectCore
