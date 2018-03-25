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

// mqtt part
const mqttClient = mqtt.connect(configs.mqtt.url)
const mqttPart = (client, payloadSize, index, last) => {
  const mqttTime1 = []
  const mqttTime4 = []
  let mqttCount = 0
  let mqttReceived = false
  const payload = '1'.repeat(payloadSize)

  client.on('connect', () => {
    console.log('[MQTT-client-log] Connected')
    client.subscribe('/postall')
    client.subscribe('/g', { qos: configs.mqtt.qos }, () => {
      client.publish('/p', payload, { qos: configs.mqtt.qos }, () => {
        mqttTime1.push(Date.now())
      })
    })
  })

  client.on('message', (topic, message) => {
    if (mqttCount !== configs.mqtt.limit) {
      if (topic === '/g') {
        mqttTime4.push(Date.now())
        client.publish('/p', payload, { qos: configs.mqtt.qos }, () => {
          if (mqttCount + 1 !== configs.mqtt.limit) mqttTime1.push(Date.now())
        })
        mqttCount++
      }
    }
    if (mqttCount === configs.mqtt.limit && !mqttReceived)
      client.publish('/getall', '', { qos: 1 })

    if (topic === '/postall' && !mqttReceived) {
      mqttReceived = true
      let [mqttTime2, mqttTime3] = String(message).split('|')
      mqttTime2 = arrayOfNumbers(mqttTime2)
      mqttTime3 = arrayOfNumbers(mqttTime3)
      const resultsToCSV = [
        `T1, T2, T3, T4\n`,
        ...mqttTime1.map(
          (item, index) =>
            `${item},${mqttTime2[index]},${mqttTime3[index]},${
              mqttTime4[index]
            }\n`,
        ),
      ]
      try {
        const fileName = `results-mqtt/mqtt-${
          configs.mqtt.limit
        }-${payloadSize}-${Date.now()}.csv`
        const file = fs.writeFileSync(fileName, resultsToCSV.join(''), 'utf8')
        console.log('[MQTT-client-log] New CSV file saved:', fileName)
      } catch (e) {
        console.log('[MQTT-client-log] A CSV file can not be saved, error: ', e)
      }
      if (index === last) client.end()
      return false
    }
  })
}
// ws part
const wsPart = payloadSize => {
  const ws = new WebSocket(configs.ws.url)
  const payload = '1'.repeat(payloadSize)
  const wsTime4 = []
  const wsTime1 = []
  let wsCount = 0
  let wsReceived = false

  ws.on('open', () => {
    console.log('[WS-client-log] Connected')
    ws.send(payload)
    wsTime1.push(Date.now())
  })

  ws.on('message', msg => {
    if (wsCount !== configs.ws.limit) {
      if (!msg.includes('postAll-')) {
        wsTime4.push(Date.now())
        ws.send(payload)
        if (wsCount + 1 !== configs.ws.limit) wsTime1.push(Date.now())
        wsCount++
      }
    } else {
      ws.send('getAll')
    }
    if (msg.includes('postAll-') && !wsReceived) {
      wsReceived = true
      let [wsTime2, wsTime3] = msg.replace('postAll-', '').split('|')
      wsTime2 = arrayOfNumbers(wsTime2)
      wsTime3 = arrayOfNumbers(wsTime3)

      const resultsToCSV = [
        `T1 (ms),T2 (ms),T3 (ms),T4 (ms)\n`,
        ...wsTime1.map(
          (item, index) =>
            `${item},${wsTime2[index]},${wsTime3[index]},${wsTime4[index]}\n`,
        ),
      ]
      try {
        const fileName = `results-ws/websocket-${
          configs.ws.limit
        }-${payloadSize}-${Date.now()}.csv`
        const file = fs.writeFileSync(fileName, resultsToCSV.join(''), 'utf8')
        console.log('[WS-client-log] New CSV file saved:', fileName)
      } catch (e) {
        console.log('[WS-client-log] A CSV file can not be saved, error: ', e)
      }
      ws.terminate()
    }
  })

  ws.on('error', e => console.log('Ws error: ', e))
}

configs.ws.payloadSizes.forEach(item => wsPart(item))

configs.mqtt.payloadSizes.forEach((item, index, arr) =>
  mqttPart(mqttClient, item, index, arr.length - 1),
)
