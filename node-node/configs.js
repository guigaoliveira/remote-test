exports.mqtt = {
  qos: 0,
  limit: 1000,
  payloadSizes: [5, 10, 50, 100, 500, 1000],
  url: 'mqtt://localhost:8001',
  port: 8001,
}

exports.ws = {
  limit: 1000,
  payloadSizes: [5, 10, 50, 100, 500, 1000],
  port: 8000,
  url: 'ws://localhost:8000',
}
