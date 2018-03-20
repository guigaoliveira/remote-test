const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const ws = require('./ws')
const mqtt = require('./mqtt')

const app = express()
const server = require('http').createServer(app)
// mqtt part
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/', express.static('public'))

mqtt.attachHttpServer(server)

server.listen(4000, () => console.log('Servidor rodando na porta 4000'))
