exports.mqtt = {
  qos: 0,
  limit: 10,
  payloadSizes: [5, 20],
  url: 'mqtt://auth.saiot.ect.ufrn.br:8001',
}

exports.ws = {
  limit: 10,
  payloadSizes: [5, 20],
  port: 8001,
  url: 'ws://auth.saiot.ect.ufrn.br:8000',
}

exports.express = {
  port: 8000,
}
