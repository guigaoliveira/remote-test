import React, { Component } from 'react'
import { List, ListItem } from 'material-ui/List'
import CircularProgress from 'material-ui/CircularProgress'
import FlatButton from 'material-ui/FlatButton'
import {
  getMean,
  getVariance,
  getStd,
  getMedian,
  getMax,
  getMin,
  getSum,
} from '../modules/statistics'

const addBorderBottom = { borderBottom: '1px solid rgba(0,0,0,0.1)' }
const ListOfValues = props => {
  const results = props.items
  const toRender = results.map((item, index) => (
    <div key={index}>
      <ListItem style={addBorderBottom}>
        {index + 1} - {item.toFixed(6)} ms
      </ListItem>
    </div>
  ))
  const styleBoxResults = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
  return (
    <List>
      {Boolean(results.length) && (
        <div style={styleBoxResults}>
          <h2>Results</h2>
          <FlatButton
            primary
            href={encodeURI(
              'data:text/csv;charset=utf-8,' + results.join('\r\n'),
            )}
            download="test.csv"
            label="Download"
          />
        </div>
      )}
      {toRender}
    </List>
  )
}
const Statistics = props => {
  const mean = getMean(props.items)
  const variance = getVariance(props.items, mean)
  const std = getStd(variance)
  const median = getMedian(props.items)
  const max = getMax(props.items)
  const min = getMin(props.items)
  const sum = getSum(props.items)
  return (
    <div>
      <h2>
        Statistics <i style={{ marginLeft: 3 }} className="fas fa-chart-line" />
      </h2>
      <ListItem style={addBorderBottom}>Mean: {mean} ms</ListItem>
      <ListItem style={addBorderBottom}>Median: {median} ms</ListItem>
      <ListItem style={addBorderBottom}>Variance: {variance} ms</ListItem>
      <ListItem style={addBorderBottom}>Standard deviation: {std} ms</ListItem>
      <ListItem style={addBorderBottom}>Max: {max} ms</ListItem>
      <ListItem style={addBorderBottom}>Min: {min} ms</ListItem>
      <ListItem style={addBorderBottom}>Total: {sum} ms</ListItem>
    </div>
  )
}
class Results extends Component {
  render() {
    const boxStyle = {
      width: '100%',
      height: 'auto',
      marginTop: 20,
      marginBottom: 20,
    }
    const loading = this.props.loading
    const results = this.props.valuesToPrint
    return (
      <div style={boxStyle}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </div>
        )}
        {!loading &&
          !!results.length && (
            <div>
              <Statistics items={results} />
            </div>
          )}
        {!loading && <ListOfValues items={results} />}
      </div>
    )
  }
}
export default Results
