const attractLengths = require('./attractLengths.json')
const locateRoms = require('./locateRoms.js')
const selectCore = require('./selectCore.js')
const fs = require('fs')
const os = require('os')
const { spawn } = require('child_process')

const homePath = os.homedir()
const retroarchPath = '/Applications/RetroArch.app/Contents/MacOS/RetroArch'
const corePath = `${homePath}/Library/Application Support/RetroArch/cores/`

const args = [...process.argv.slice(2)]

const romsPath = args[0] + (args[0].slice(-1) !== '/' ? '/' : '')
fs.writeFileSync(`${romsPath}/customConfig.cfg`, `video_font_enable = "false"\npause_nonactive = "false"\nsavestate_auto_load = "true"\nsavestate_directory = "${romsPath}"`)

const roms = locateRoms(romsPath)

function randomGame () {
  const selectedRom = roms[parseInt(Math.random() * roms.length)]
  const playLength = attractLengths[selectedRom]
  const romExtension = selectedRom.match(/\.\S+/)
  const useCore = selectCore(romExtension[0])
  const emulation = spawn(retroarchPath, [`--appendconfig="${romsPath}/customConfig.cfg"`, '-L', `"${corePath}${useCore.core}"`, `"${romsPath}${selectedRom}"`], {
    stdio: 'inherit',
    shell: true
  })
  setTimeout(loadAnother, playLength, emulation)
}

function loadAnother (process) {
  randomGame()
  setTimeout(() => process.kill(), 250)
}

randomGame()
