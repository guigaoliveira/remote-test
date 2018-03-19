const WebSocket = require('ws')

const { WS_TYPE_DELIMITER, NS_PER_SEC } = require('./constants')

const wss = new WebSocket.Server({
  port: 8888,
})

const getType = arr => arr && arr.length && arr.split(WS_TYPE_DELIMITER)[0]
const getData = arr => arr && arr.length && arr.split(WS_TYPE_DELIMITER)[1]

wss.on('connection', ws => {
  let limit = 0
  let lastTime = 0
  let count = 0
  let payload = ''
  let arr = []
  let start = false
  const send = (socket, { type, data }, fn) =>
    socket.send(`${type ? type + WS_TYPE_DELIMITER : ''}${data}`, fn)

  console.log('Cliente ws conectado')

  ws.on('message', msg => {
    if (getType(msg) === 'setPayload') {
      payload = getData(msg)
    } else if (getType(msg) === 'setLimit') {
      limit = Number(getData(msg))
      start = false
    } else if (limit && payload !== null && count < limit) {
      const diff = process.hrtime(lastTime)
      ws.send(payload, () => {
        lastTime = process.hrtime()
      })
      arr[count] = diff[0] * NS_PER_SEC + diff[1]
      count += 1
    } else {
      send(ws, { type: 'finishCount', data: arr })
    }
    if (limit && payload !== null && !start) {
      ws.send(payload, () => {
        lastTime = process.hrtime()
        count = 0
        start = true
        arr = []
      })
    }
  })

  ws.on('disconnect', () => console.log('Cliente ws desconectado!'))
})

module.exports = wss
