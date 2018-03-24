const fs = require('fs')
const mqtt = require('mqtt')
const WebSocket = require('ws')
const { performance } = require('perf_hooks')
const configs = require('./configs')
const {
  getMean,
  getVariance,
  getStd,
  getMedian,
  getMax,
  getMin,
  getSum,
} = require('./modules/statistics')

const client = mqtt.connect(configs.mqtt.url)

let lastTimeMqtt = 0.0
let countMqtt = 0
let dataMqtt = []

client.on('connect', () => {
  console.log('[MQTT-client-log] Connected')
  client.subscribe('/g', { qos: configs.mqtt.qos }, () => {
    client.publish(
      '/p',
      configs.mqtt.payload,
      { qos: configs.mqtt.qos },
      () => {
        lastTimeMqtt = performance.now()
      },
    )
  })
})

client.on('message', (topic, message) => {
  if (countMqtt < configs.mqtt.limit) {
    if (!topic === '/g') return false
    dataMqtt.push(performance.now() - lastTimeMqtt)
    client.publish(
      '/p',
      configs.mqtt.payload,
      { qos: configs.mqtt.qos },
      () => {
        lastTimeMqtt = performance.now()
      },
    )
    countMqtt++
  } else {
    const mean = getMean(dataMqtt)
    const variance = getVariance(dataMqtt, mean)
    const median = getMedian(dataMqtt)
    const standardDeviation = getStd(variance)
    const max = getMax(dataMqtt)
    const min = getMin(dataMqtt)
    const total = getSum(dataMqtt)
    console.log(
      '[MQTT-client-log] Results:',
      JSON.stringify(
        {
          mean,
          variance,
          median,
          standardDeviation,
          max,
          min,
          total,
        },
        null,
        2,
      ),
    )
    try {
      const fileName = `results-mqtt/mqtt-qos${configs.mqtt.qos}-${
        configs.mqtt.limit
      }-${Date.now()}.csv`
      const file = fs.writeFileSync(fileName, dataMqtt, 'utf8')
      console.log('[MQTT-client-log] File saved:', fileName)
    } catch (e) {
      console.log('[MQTT-client-log] File was not saved, error: ', e)
    }
    client.end()
    return false
  }
})

const ws = new WebSocket(configs.ws.url)

let dataWs = []
let lastTimeWs = 0
let countWs = 0

ws.on('open', () => {
  console.log('[WS-client-log] Connected')
  ws.send(configs.ws.payload)
  lastTimeWs = performance.now()
})

ws.on('message', () => {
  if (countWs < configs.ws.limit) {
    dataWs.push(performance.now() - lastTimeWs)
    ws.send(configs.ws.payload)
    lastTimeWs = performance.now()
    countWs++
  } else {
    const mean = getMean(dataWs)
    const variance = getVariance(dataWs, mean)
    const median = getMedian(dataWs)
    const standardDeviation = getStd(variance)
    const max = getMax(dataWs)
    const min = getMin(dataWs)
    const total = getSum(dataWs)
    console.log(
      '[WS-client-log] Results:',
      JSON.stringify(
        {
          mean,
          variance,
          median,
          standardDeviation,
          max,
          min,
          total,
        },
        null,
        2,
      ),
    )
    try {
      const fileName = `results-ws/websocket-${
        configs.ws.limit
      }-${Date.now()}.csv`
      const file = fs.writeFileSync(fileName, dataWs, 'utf8')
      console.log('[WS-client-log] File saved:', fileName)
    } catch (e) {
      console.log('[WS-client-log] File was not saved, error: ', e)
    }
  }
})

ws.on('error', e => console.log('Ws error: ', e))
