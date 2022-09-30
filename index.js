const UniqueRandom = require('./UniqueRandom')
const attractLengths = require('./attractLengths.json')
const locateRoms = require('./locateRoms.js')
const selectCore = require('./selectCore.js')
const os = require('os')
const fs = require('fs')
const { spawn, execSync } = require('child_process')
const kill = require('tree-kill')

require('dotenv').config()
const retroarchPath = process.env.RETROARCH_PATH
const homePath = os.homedir()

const corePath = `${homePath}/.config/retroarch/cores`

const args = [...process.argv.slice(2)]

const romsPath = args[0] + (args[0].slice(-1) !== '/' ? '/' : '')
fs.writeFileSync(`${romsPath}/customConfig.cfg`, `video_font_enable = "false"\npause_nonactive = "false"\nsavestate_auto_load = "true"\nsavestate_directory = "${romsPath}"`)

const roms = locateRoms(romsPath)

const random = new UniqueRandom(roms.length, parseInt(roms.length/2))

function randomGame () {
  const selectedRom = roms[random.new]
  const playLength = attractLengths[selectedRom] ?? 30000
  const romExtension = selectedRom.match(/\.\S+/)
  const useCore = selectCore(romExtension[0])
  const emulation = spawn(retroarchPath, ['-f', `--appendconfig="${romsPath}/customConfig.cfg"`, '-L', `"${corePath}/${useCore.core}.so"`, `"${romsPath}${selectedRom}"`], {
    stdio: 'inherit',
    shell: true
  })
  const focus = spawn('wmctrl', [' -a',' RetroArch'],{shell:true})
  setTimeout(loadAnother, playLength, emulation.pid)
}

function loadAnother (previousPid) {
  randomGame()
  const focus = spawn('wmctrl', [' -a',' RetroArch'],{shell:true})
  setTimeout(() => kill(previousPid), 250)
}

randomGame()

