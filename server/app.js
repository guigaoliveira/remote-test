const app = require('express')()
const server = require('http').createServer(app)
const cors = require('cors')
const bodyParser = require('body-parser')
const ws = require('./ws')
const mqtt = require('./mqtt')
// mqtt part
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

mqtt.attachHttpServer(server)

const port = 8080
server.listen(port, () =>
  console.log(`Servidor express rodando na porta ${port}`),
)
