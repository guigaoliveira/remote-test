exports.mqtt = {
  qos: 0,
  limit: 10,
  payloadSizes: [5, 20],
  url: 'mqtt://localhost:8001',
  port: 8001,
}

exports.ws = {
  limit: 10,
  payloadSizes: [5, 20],
  port: 8000,
  url: 'ws://localhost:8000',
}
