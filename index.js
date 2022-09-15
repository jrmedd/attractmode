const UniqueRandom = require('./UniqueRandom')
const attractLengths = require('./attractLengths.json')
const locateRoms = require('./locateRoms.js')
const selectCore = require('./selectCore.js')
const fs = require('fs')
const { spawn } = require('child_process')
const kill = require('tree-kill')

const retroarchPath = process.env.RETROARCH_PATH

const args = [...process.argv.slice(2)]

const romsPath = args[0] + (args[0].slice(-1) !== '/' ? '/' : '')
fs.writeFileSync(`${romsPath}/customConfig.cfg`, `video_font_enable = "false"\npause_nonactive = "false"\nsavestate_auto_load = "true"\nsavestate_directory = "${romsPath}"`)

const roms = locateRoms(romsPath)

console.debug(roms)

const random = new UniqueRandom(roms.length)

function randomGame () {
  const selectedRom = roms[random.new]
  const playLength = attractLengths[selectedRom]
  const romExtension = selectedRom.match(/\.\S+/)
  const useCore = selectCore(romExtension[0])
  const emulation = spawn(retroarchPath, ['-f', `--appendconfig="${romsPath}/customConfig.cfg"`, '-L', `"${useCore.core}"`, `"${romsPath}${selectedRom}"`], {
    stdio: 'inherit',
    shell: true
  })
  setTimeout(loadAnother, playLength, emulation.pid)
}

function loadAnother (previousPid) {
  randomGame()
  setTimeout(() => kill(previousPid), 250)
}

randomGame()
