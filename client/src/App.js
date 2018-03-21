import React, { Component } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import AppBar from 'material-ui/AppBar'
import Settings from './components/settings'
import Results from './components/results'
import './App.css'

const muiTheme = getMuiTheme({
  appBar: {
    height: 50,
  },
  palette: {
    primary1Color: '#2196F3',
  },
})

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      valuesToResult: [],
      loading: false,
      fromSettings: {},
    }
  }
  setValuesToResult = arr => {
    this.setState({
      valuesToResult: arr,
    })
    if (arr.length > 0) {
      this.setState({
        loading: false,
      })
    }
  }
  setLoading = state =>
    this.setState({
      loading: state,
    })
  getPropsFromSettings = ({ protocol, downloadLabel }) => {
    this.setState({
      fromSettings: {
        protocol,
        downloadLabel,
      },
    })
  }
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <React.Fragment>
          <AppBar
            title="Measure latency using MQTT or WebSocket"
            showMenuIconButton={false}
          />
          <div className="content">
            <div className="grid row-1">
              <Settings
                setValuesToResult={this.setValuesToResult}
                setLoading={this.setLoading}
                setPropsToResult={this.getPropsFromSettings}
              />
            </div>
            <div className="grid row-9">
              <Results
                valuesToResult={this.state.valuesToResult}
                fromSettings={this.state.fromSettings}
                loading={this.state.loading}
              />
            </div>
          </div>
        </React.Fragment>
      </MuiThemeProvider>
    )
  }
}

export default App
