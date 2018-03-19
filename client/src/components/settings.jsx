import React, { Component } from 'react'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import RaisedButton from 'material-ui/RaisedButton'
import mqttClient from 'mqtt'

const send = (ws, { type, data }, fn) =>
  ws.send(`${type ? type + '-' : ''}${data}`, fn)

const ConnectError = () => (
  <span style={{ marginTop: 12, color: 'red' }}>
    <i className="fas fa-exclamation-triangle" style={{ paddingRight: 5 }} />
    Could not connect to server.
  </span>
)

class Settings extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ipError: '',
      protocol: 1,
      ip: 'localhost',
      payload: '',
      limit: '10',
      connectError: false,
      qos: 0,
    }
  }
  setIp = event =>
    this.setState({
      ip: event.target.value,
    })

  setPayload = event =>
    this.setState({
      payload: event.target.value,
    })

  setLimit = event =>
    this.setState({
      limit: event.target.value,
    })

  mqttPart = () => {
    const mqtt = mqttClient.connect(`mqtt://${this.state.ip}:4000`)

    mqtt.stream.on('error', e => {
      console.log(e)
      this.setState({
        connectError: true,
      })
      this.props.setValuesToPrint([])
      mqtt.end()
    })

    mqtt.on('connect', () => {
      this.props.setLoading(true)
      this.setState({
        connectError: false,
      })
      mqtt.subscribe('/+', {}, err => {
        mqtt.publish('/limit', this.state.limit)
        mqtt.publish('/payload', this.state.payload)
        mqtt.publish('/qos', `${this.state.qos}`)
      })
    })

    mqtt.on('message', (topic, message) => {
      if (topic === '/') {
        mqtt.publish('/', this.state.payload, {
          qos: this.state.qos,
        })
      }
      if (topic === '/result') {
        this.props.setValuesToPrint(
          String(message)
            .split(',')
            .map(item => item / 1e6),
        )
        mqtt.end()
        return false
      }
    })
  }
  wsPart = () => {
    if (this.ws) {
      this.ws.close()
    }
    this.ws = new WebSocket(`ws://${this.state.ip}:8888`)
    const ws = this.ws
    ws.onmessage = ({ data }) => {
      if (data.includes('finishCount')) {
        this.props.setValuesToPrint(
          data
            .split('-')[1]
            .split(',')
            .map(item => item / 1e6),
        )
        return false
      }
      ws.send(this.state.payload)
    }

    ws.onopen = () => {
      this.props.setLoading(true)
      this.setState({
        connectError: false,
      })
      send(ws, { type: 'setPayload', data: this.state.payload })
      send(ws, { type: 'setLimit', data: this.state.limit })
    }

    ws.onerror = event => {
      this.setState({
        connectError: true,
      })
      this.props.setValuesToPrint([])
    }
  }
  buttonOnClick = event => {
    event.stopPropagation()
    event.preventDefault()
    if (this.state.ipError) return false
    if (this.state.limit <= 0) return this.props.setValuesToPrint([])
    if (this.state.protocol === 1) this.mqttPart()
    if (this.state.protocol === 2) this.wsPart()
  }

  isRequired = event =>
    this.setState({
      ipError: event.target.value === '' ? 'This field is required' : '',
    })

  setProtocol = (event, index, protocol) => this.setState({ protocol })

  setQos = (event, index, qos) => this.setState({ qos })

  render() {
    return (
      <div style={{ display: 'grid' }}>
        <TextField
          hintText="Server IP"
          floatingLabelText="Server IP"
          type="text"
          errorText={this.state.ipError}
          onChange={this.isRequired}
          onBlur={this.setIp}
          defaultValue="localhost"
        />
        <TextField
          hintText="Payload"
          floatingLabelText="Payload"
          type="text"
          onBlur={this.setPayload}
        />
        <TextField
          hintText="Quantity of measures"
          floatingLabelText="Quantity of measures"
          type="text"
          onBlur={this.setLimit}
          defaultValue="10"
        />
        <SelectField
          floatingLabelText="Protocol"
          value={this.state.protocol}
          onChange={this.setProtocol}
          style={{ width: 150 }}
        >
          <MenuItem value={1} primaryText="MQTT" />
          <MenuItem value={2} primaryText="WebSocket" />
        </SelectField>
        {this.state.protocol === 1 && (
          <SelectField
            floatingLabelText="Protocol"
            value={this.state.qos}
            onChange={this.setQos}
            style={{ width: 150 }}
          >
            <MenuItem value={0} primaryText="Qos 0" />
            <MenuItem value={1} primaryText="Qos 1" />
          </SelectField>
        )}
        <RaisedButton
          label="Start"
          primary
          style={{ width: 100, marginTop: 10 }}
          onClick={this.buttonOnClick}
        />
        {this.state.connectError && <ConnectError />}
      </div>
    )
  }
}
export default Settings
