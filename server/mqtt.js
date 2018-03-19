const mosca = require('mosca')
const { NS_PER_SEC } = require('./constants')

const settings = {
  port: 1883,
}

const mqtt = new mosca.Server(settings)

let lastTime = 0
let count = 0
let arr = []
let limit = null
let fixedPayload = null
let start = false
let qos = null

const startPub = mqttServer => {
  mqttServer.publish({
    topic: '/',
    payload: fixedPayload,
  })
  lastTime = process.hrtime()
  count = 0
  arr = []
  start = true
  return true
}

mqtt.on('published', packet => {
  const { topic, payload } = packet
  if (topic === '/limit') {
    limit = Number(payload)
    start = false
  }
  if (topic === '/payload') {
    fixedPayload = String(payload)
  }
  if (topic === '/qos') {
    qos = payload
  }
  if (!start && [fixedPayload, limit, qos].every(item => item !== null)) {
    return startPub(mqtt)
  }
  if (
    topic === '/' &&
    count < limit &&
    [fixedPayload, limit, qos].every(item => item !== null)
  ) {
    const diff = process.hrtime(lastTime)
    mqtt.publish(
      {
        topic: '/',
        payload: fixedPayload,
        qos,
      },
      () => {
        lastTime = process.hrtime()
      },
    )
    lastTime = process.hrtime()
    arr[count] = diff[0] * NS_PER_SEC + diff[1]
    count += 1
    if (count === limit) {
      mqtt.publish({
        topic: '/result',
        payload: arr.toString(),
        qos,
      })
    }
  }
  return true
})

module.exports = mqtt
