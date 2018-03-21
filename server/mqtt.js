const mosca = require('mosca')

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

module.exports = mqtt
