exports.getSum = array => {
  let sum = 0
  let len = array.length
  for (let i = 0; i < len; i++) {
    sum += array[i]
  }
  return sum.toFixed(6)
}
exports.getMean = array => {
  const sum = this.getSum(array)
  return (sum / array.length).toFixed(6)
}

exports.getVariance = (array, mean) => {
  let len = array.length
  if (len <= 1) return false
  let sum = 0
  for (let i = 0; i < len; i++) {
    sum += (array[i] - mean) ** 2
  }
  return (sum / (len - 1)).toFixed(6)
}

exports.getMedian = array => {
  let len = array.length
  let middle = Math.floor(len / 2)
  return (!len % 2
    ? array[middle]
    : (array[middle - 1] + array[middle]) / 2
  ).toFixed(6)
}

exports.getStd = value =>
  value !== false ? Math.sqrt(value).toFixed(6) : 'Can not calculate.'

exports.getMax = array => Math.max(...array).toFixed(6)

exports.getMin = array => Math.min(...array).toFixed(6)
