exports.mqtt = {
  qos: 0,
  limit: 10,
  payloadSizes: [5, 20],
  url: 'mqtt://localhost:1883',
}

exports.ws = {
  limit: 10,
  payloadSizes: [5, 20],
  port: 8001,
  url: 'ws://localhost:8001',
}

exports.express = {
  port: 8000,
}
