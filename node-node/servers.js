const WebSocket = require('ws')
const mosca = require('mosca')
const configs = require('./configs')

const mqtt = new mosca.Server({ port: configs.mqtt.port })

let mqttTime2 = []
let mqttTime3 = []
let mqttCount = 0

mqtt.on('clientConnected', function(client) {
  console.log('[MQTT-server-log] New MQTT client connected')
  mqttTime2 = []
  mqttTime3 = []
  mqttCount = 0
})

mqtt.on('ready', () =>
  console.log(`[MQTT-server-log] Connected, port: ${configs.mqtt.port}`),
)

mqtt.on('published', packet => {
  if (mqttCount !== configs.mqtt.limit) {
    if (packet.topic === '/p') {
      mqttTime2.push(Date.now())
      mqtt.publish(
        {
          payload: packet.payload,
          qos: packet.qos,
          topic: '/g',
        },
        () => mqttTime3.push(Date.now()),
      )
      mqttCount++
    }
  }

  if (packet.topic === '/getall') {
    mqtt.publish({
      payload: mqttTime2.join(',') + '|' + mqttTime3.join(','),
      qos: 1,
      topic: '/postall',
    })
    mqttTime2 = []
    mqttTime3 = []
    mqttCount = 0
  }
})

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
  const wsTime2 = []
  const wsTime3 = []
  let wsCount = 0
  ws.on('message', msg => {
    if (wsCount !== configs.ws.limit && !msg.includes('getAll')) {
      wsTime2.push(Date.now())
      ws.send(msg)
      wsTime3.push(Date.now())
      wsCount++
    } else {
      ws.send('postAll-' + wsTime2.join(',') + '|' + wsTime3.join(','))
    }
  })

  ws.on('disconnect', () =>
    console.log('[WS-server-log] - WS client disconnected'),
  )
})
