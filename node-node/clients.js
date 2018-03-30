const fs = require('fs')
const mqtt = require('mqtt')
const WebSocket = require('ws')
const configs = require('./configs')

/*const {
  getMean,
  getVariance,
  getStd,
  getMedian,
  getMax,
  getMin,
  getSum,
} = require('./modules/statistics')*/

const arrayOfNumbers = arr => arr.split(',').map(Number)
const createPayload = size => '1'.repeat(size)

// mqtt part
const client = mqtt.connect(configs.mqtt.url)
const mqttPayloadSizes = configs.mqtt.payloadSizes
let mqttTime1 = []
let mqttTime4 = []
let mqttCountMeasures = 0
let mqttCountPayload = 0
let mqttPayload = createPayload(mqttPayloadSizes[mqttCountPayload])

client.on('connect', () => {
  console.log('[MQTT-client-log] Connected')
  client.subscribe('/postall')
  client.subscribe('/g', { qos: configs.mqtt.qos })
  client.publish('/p', mqttPayload, { qos: configs.mqtt.qos }, () => {
    mqttTime1.push(Date.now())
  })
})

client.on('message', (topic, message) => {
  if (mqttCountMeasures < configs.mqtt.limit) {
    if (topic === '/g') {
      mqttTime4.push(Date.now())
      client.publish('/p', mqttPayload, { qos: configs.mqtt.qos })
      if (mqttCountMeasures + 1 !== configs.mqtt.limit)
        mqttTime1.push(Date.now())
      mqttCountMeasures++
    }
  } else {
    client.publish('/getall', '')
  }
  if (topic === '/postall') {
    let [mqttTime2, mqttTime3] = String(message).split('|')
    mqttTime2 = arrayOfNumbers(mqttTime2)
    mqttTime3 = arrayOfNumbers(mqttTime3)
    // console.log(mqttTime1.length, mqttTime2.length, mqttTime3.length, mqttTime4.length)
    const resultsToCSV = [
      `T1,T2,T3,T4\n`,
      ...mqttTime1.map(
        (item, index) =>
          `${item},${mqttTime2[index]},${mqttTime3[index]},${
            mqttTime4[index]
          }\n`,
      ),
    ]
    try {
      const fileName = `results-mqtt/mqtt-${configs.mqtt.limit}-${
        mqttPayloadSizes[mqttCountPayload]
      }-${Date.now()}.csv`
      const file = fs.writeFileSync(fileName, resultsToCSV.join(''), 'utf8')
      console.log('[MQTT-client-log] New CSV file saved:', fileName)
    } catch (e) {
      console.log('[MQTT-client-log] A CSV file can not be saved, error: ', e)
    }
    mqttCountPayload++
    if (mqttPayloadSizes[mqttCountPayload]) {
      mqttPayload = createPayload(mqttPayloadSizes[mqttCountPayload])
      mqttTime1 = []
      mqttTime4 = []
      mqttCountMeasures = 0
      client.publish('/p', mqttPayload, {
        qos: configs.mqtt.qos,
      })
      mqttTime1.push(Date.now())
    } else {
      client.end()
    }
  }
})

// ws part

const wsPayloadSizes = configs.ws.payloadSizes
let wsCountPayload = 0
let ws = new WebSocket(configs.ws.url)
let wsPayload = createPayload(wsPayloadSizes[wsCountPayload])
let wsTime4 = []
let wsTime1 = []
let wsCountMeasures = 0

ws.on('open', () => {
  console.log('[WS-client-log] Connected')
  ws.send(wsPayload)
  wsTime1.push(Date.now())
})

ws.on('message', msg => {
  if (wsCountMeasures !== configs.ws.limit) {
    if (!msg.includes('postAll-')) {
      wsTime4.push(Date.now())
      ws.send(wsPayload)
      if (wsCountMeasures + 1 !== configs.ws.limit) wsTime1.push(Date.now())
      wsCountMeasures++
    }
  }
  if (msg.includes('postAll-')) {
    let [wsTime2, wsTime3] = msg.replace('postAll-', '').split('|')
    wsTime2 = arrayOfNumbers(wsTime2)
    wsTime3 = arrayOfNumbers(wsTime3)
    // console.log(wsTime1.length, wsTime2.length, wsTime3.length, wsTime4.length)
    const resultsToCSV = [
      `T1,T2,T3,T4\n`,
      ...wsTime1.map(
        (item, index) =>
          `${item},${wsTime2[index]},${wsTime3[index]},${wsTime4[index]}\n`,
      ),
    ]
    try {
      const fileName = `results-ws/websocket-${configs.ws.limit}-${
        wsPayloadSizes[wsCountPayload]
      }-${Date.now()}.csv`
      const file = fs.writeFileSync(fileName, resultsToCSV.join(''), 'utf8')
      console.log('[WS-client-log] New CSV file saved:', fileName)
    } catch (e) {
      console.log('[WS-client-log] A CSV file can not be saved, error: ', e)
    }
    wsCountPayload++
    if (wsPayloadSizes[wsCountPayload]) {
      wsPayload = createPayload(wsPayloadSizes[wsCountPayload])
      wsTime1 = []
      wsTime4 = []
      wsCountMeasures = 0
      ws.send(wsPayload)
      wsTime1.push(Date.now())
    } else {
      ws.close()
      ws.terminate()
    }
  }
})

ws.on('error', e => console.log('Ws error: ', e))
