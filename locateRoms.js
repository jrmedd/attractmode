const { execSync } = require('child_process')
const cores = require('./cores.json')

const permittedExtensions = Object.keys(cores).map(core => cores[core].permittedExtensions).flatMap(core => core)

function locateRoms (path) {
  const listString = execSync(`ls ${path}`).toString()
  return listString.split('\n').filter(input => input !== '' && permittedExtensions.some(ext => input.includes(ext)))
}

module.exports = locateRoms
