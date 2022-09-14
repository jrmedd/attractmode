const locateRoms = require('./locateRoms.js')
const selectCore = require('./selectCore.js')
const cores = require('./cores.json')
const os = require('os')
const { spawn } = require('child_process')

const homePath = os.homedir()
const retroarchPath = '/Applications/RetroArch.app/Contents/MacOS/RetroArch'
const corePath = `${homePath}/Library/Application Support/RetroArch/cores/`

const args = [...process.argv.slice(2)]

const romsPath = args[0]

const roms = locateRoms(romsPath)

function randomGame () {
  const selectedRom = parseInt(Math.random() * roms.length)
  const romExtension = roms[selectedRom].match(/\.\S+/)
  const useCore = selectCore(romExtension[0])
  const emulation = spawn(retroarchPath, ['--fullscreen', '-L', `${corePath}${useCore.core}`, `${romsPath}/${roms[selectedRom]}`])
  setTimeout(loadAnother, 10000, emulation)
}

function loadAnother (process) {
  randomGame()
  process.kill()
}

randomGame()
