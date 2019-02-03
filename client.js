const net = require('net')
const path = require('path')
const { spawnSync, spawn } = require('child_process')
const fs = require('fs')
const struct = require('awestruct')
const args = require('minimist')(process.argv.slice(2))

const [aoc, host] = args._

if (!aoc) {
  console.error('must provide path to the aoc executable')
  process.exit(1)
}
if (!host) {
  console.error('must provide spec server hostname')
  process.exit(1)
}

// spectator info header
const t = struct.types
const readString = (s) => s.slice(0, s.indexOf(0)).toString('ascii')
const writeString = (n) => (s) => {
  const b = Buffer.alloc(n)
  b.write(s, 0, s.length, 'ascii')
  return b
}
const SpecHeader = struct([
  // C-style strings with lots of uninitialised memory past their end, so read as buffer and convert manually
  ['gameName', t.buffer(32).map(readString, writeString(32))],
  ['fileType', t.buffer(32).map(readString, writeString(32))],
  ['playerName', t.buffer(192).map(readString, writeString(192))]
])

const socket = net.createConnection(53754, host, () => {
  socket.once('data', (packet) => {
    const header = SpecHeader(packet)
    const mgx = path.join(path.dirname(aoc), `../SaveGame/spc.0.${header.playerName}.${header.fileType}`)

    console.log('spec file:', mgx)
    socket.pipe(fs.createWriteStream(mgx))
    // wait for header to be fully loaded
    socket.once('data', (header) => {
      const len = header.readUInt32LE()
      console.log(`waiting for full header... (${len} bytes)`)
      let current = header.length
      socket.on('data', function ondata (chunk) {
        current += header.length
        if (current >= len) {
          socket.off('data', ondata)
          start(header.gameName, mgx)
        }
      })
    })
  })
})

function start (game, mgx) {
  console.log('starting game')
  const recpath = spawnSync('winepath', ['-w', mgx]).stdout.toString().trim()
  console.log(recpath)
  spawn('wine', [aoc, `GAME=${game}`, recpath], { stdio: 'inherit' }).on('close', () => {
    console.log('done')
  })
}
