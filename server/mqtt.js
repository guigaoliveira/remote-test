const mosca = require('mosca')

const settings = {
  port: 1883,
}

const mqtt = new mosca.Server(settings)

mqtt.on('published', packet => {
  if (packet.topic === '/p') {
    mqtt.publish({
      payload: packet.payload,
      qos: packet.qos,
      topic: '/g',
    })
  }
})

module.exports = mqtt
