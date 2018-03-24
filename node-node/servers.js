const WebSocket = require('ws')
const mosca = require('mosca')
const app = require('express')()
const server = require('http').createServer(app)
const configs = require('./configs')

const mqtt = new mosca.Server()

mqtt.on('published', packet => {
  if (packet.topic === '/p') {
    mqtt.publish({
      payload: packet.payload,
      qos: packet.qos,
      topic: '/g',
    })
  }
})

mqtt.attachHttpServer(server)

server.listen(configs.express.port, () =>
  console.log(`[MQTT-server-log] Connected, port: ${configs.express.port}`),
)

const wss = new WebSocket.Server(
  {
    port: configs.ws.port,
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
      // Other options settable:
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      clientMaxWindowBits: 10, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Defaults to negotiated value.
      // Below options specified as default values.
      concurrencyLimit: 10, // Limits zlib concurrency for perf.
      threshold: 1024, // Size (in bytes) below which messages
      // should not be compressed.
    },
  },
  () => console.log(`[WS-server-log] Connected, port: ${configs.ws.port}`),
)

wss.on('connection', ws => {
  console.log('[WS-server-log] New WS client connected')

  ws.on('message', msg => {
    ws.send(msg)
  })

  ws.on('disconnect', () =>
    console.log('[WS-server-log] - WS client disconnected'),
  )
})
