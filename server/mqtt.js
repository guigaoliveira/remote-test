const mosca = require('mosca')

const mqtt = new mosca.Server()

mqtt.on('published', packet => {
  if (packet.topic === '/p') {
    mqtt.publish({ ...packet, topic: '/g' })
  }
})

module.exports = mqtt
