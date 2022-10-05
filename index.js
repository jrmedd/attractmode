const { EventEmitter } = require('events')
const fs = require('fs')
const os = require('os')
const { spawn, execSync } = require('child_process')
const chokidar = require('chokidar')
const kill = require('tree-kill')
const { ReadlineParser } = require('@serialport/parser-readline')
const SerialPort = require('serialport').SerialPort


const EnablePlay = require('./EnablePlay.js')
const UniqueRandom = require('./UniqueRandom')

const attractLengths = require('./attractLengths.json')
const locateRoms = require('./locateRoms.js')
const selectCore = require('./selectCore.js')

console.debug(`AttractMode starting at ${new Date()}`)

const playing = new EnablePlay()

console.debug(`Setting up controller switch at ${new Date()}...`)
const inPort = new SerialPort({ path: '/dev/ttyACM0', baudRate: 9600, autoOpen: true})
const parser = inPort.pipe(new ReadlineParser({ delimiter: '\r\n' }))
parser.on('data', playing.setEnabled)
console.debug('...done')

console.debug(`Querying the current state of the controller switch at ${new Date()}...`)
const outPort = new SerialPort({ path: '/dev/ttyACM1', baudRate: 9600, autoOpen: true})
outPort.write('report\n')
console.debug('...done')

require('dotenv').config()
const retroarchPath = process.env.RETROARCH_PATH
const homePath = os.homedir()

const corePath = `${homePath}/.config/retroarch/cores`

const args = [...process.argv.slice(2)]

console.debug(`Writing Retroarch config file ${new Date()}...`)
const romsPath = args[0] + (args[0].slice(-1) !== '/' ? '/' : '')
fs.writeFileSync(`${romsPath}/customConfig.cfg`, `video_font_enable = "false"\npause_nonactive = "false"\nsavestate_auto_load = "true"\nsavestate_directory = "${romsPath}"`)
console.debug('...done')

console.debug(`Fetching list of ROMS ${new Date()}...`)
let roms = locateRoms(romsPath)
console.debug('...done')

const romWatcher = chokidar.watch(romsPath) 

romWatcher.on('all', path => {
  console.debug(`Fetching refreshed list of ROMS ${new Date()}...`)
  roms = locateRoms(romsPath)
  console.debug('...done')
})

const random = new UniqueRandom(roms.length, Math.floor(roms.length*0.75))

const eventTrigger = new EventEmitter()

eventTrigger.on('loadGame', previousPid => {
  console.debug("In the event", playing.isEnabled)
  randomGame(previousPid)
})

function randomGame (previousPid = null) {
  if (playing.isEnabled) {
    console.debug(`Gameplay in progress at ${new Date()}`)
    setTimeout(() => eventTrigger.emit('loadGame', previousPid), 1000)
    return true
  }
  if (previousPid) {
    console.log(`Killing ${previousPid}`)
    setTimeout(() => kill(previousPid), 500)
  }
  const selectedRom = roms[random.new]
  const playLength = attractLengths[selectedRom] ?? 60000
  const romExtension = selectedRom.match(/\.\S+/)
  const useCore = selectCore(romExtension[0])
  const emulation = spawn(retroarchPath, ['-f', `--appendconfig="${romsPath}/customConfig.cfg"`, '-L', `"${corePath}/${useCore.core}.so"`, `"${romsPath}${selectedRom}"`], {
    stdio: 'inherit',
    shell: true
  })
  console.debug(`Starting ${selectedRom} at ${new Date()} with pid ${emulation.pid}`)
  const focus = spawn('wmctrl', [' -a',' RetroArch'], {shell:true})
  setTimeout(() => process.nextTick(() => {eventTrigger.emit('loadGame', emulation.pid)}), playLength)
}

randomGame()
