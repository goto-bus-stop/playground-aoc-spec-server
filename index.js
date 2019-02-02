const net = require('net')
const util = require('util')
const struct = require('awestruct')
const args = require('minimist')(process.argv[2])

const host = args._[0]
if (!host) {
  console.error('provide the IP that\'s hosting the game')
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

let isFirst = false
// keep packets in memory for late join
const buffers = []
const clients = new Set()
const socket = net.createConnection(53754, '192.168.178.116', () => {
  console.log('connected to spec server')

  socket.on('data', (packet) => {
    if (isFirst) {
      console.log(SpecHeader(packet))
      isFirst = false
    }

    // A spec delay impl could check the sync packets here for the current game time, and buffer accordingly
    buffers.push(packet)
    for (const client of clients) {
      client.write(packet)
    }
  })

  socket.on('end', () => {
    for (const client of clients) {
      client.end()
    }
    clients.clear()
  })
})

// Example spectator server
net.createServer((client) => {
  console.log('new client', client.remoteAddress)
  clients.add(client)
  // Push out all the data we missed
  for (const packet of buffers) {
    client.write(packet)
  }
}).listen(53754, '127.0.0.1')
