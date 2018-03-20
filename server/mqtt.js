const mosca = require('mosca')

const settings = {
  port: 1884,
}

const mqtt = new mosca.Server(settings)

mqtt.on('published', packet => {
  if (packet.topic === '/p') {
    mqtt.publish({ ...packet, topic: '/g' })
  }
})

module.exports = mqtt
