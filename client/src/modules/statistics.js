export function getSum(array) {
  let sum = 0
  let len = array.length
  for (let i = 0; i < len; i++) {
    sum += array[i]
  }
  return sum.toFixed(6)
}
export function getMean(array) {
  const sum = getSum(array)
  return (sum / array.length).toFixed(6)
}

export function getVariance(array, mean) {
  let len = array.length
  if (len <= 1) return false
  let sum = 0
  for (let i = 0; i < len; i++) {
    sum += (array[i] - mean) ** 2
  }
  return (sum / (len - 1)).toFixed(6)
}

export function getMedian(array) {
  let len = array.length
  let middle = Math.floor(len / 2)
  return (!len % 2
    ? array[middle]
    : (array[middle - 1] + array[middle]) / 2
  ).toFixed(6)
}

export function getStd(value) {
  return value !== false ? Math.sqrt(value).toFixed(6) : 'Can not calculate.'
}

export function getMax(array) {
  return Math.max(...array).toFixed(6)
}

export function getMin(array) {
  return Math.min(...array).toFixed(6)
}
