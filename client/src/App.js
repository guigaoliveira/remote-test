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
})

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      valuesToPrint: [],
      loading: false,
    }
  }
  setValuesToPrint = arr => {
    this.setState({
      valuesToPrint: arr,
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

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <React.Fragment>
          <AppBar
            title="Measure latency using MQTT or WebSocket"
            showMenuIconButton={false}
          />
          <div className="content">
            <div>
              <Settings
                setValuesToPrint={this.setValuesToPrint}
                setLoading={this.setLoading}
              />
            </div>
            <div style={{ width: '100%', marginLeft: 50 }}>
              <Results
                valuesToPrint={this.state.valuesToPrint}
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
