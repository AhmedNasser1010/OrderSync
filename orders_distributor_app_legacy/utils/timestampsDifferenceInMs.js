function timestampsDifferenceInMs(timestamp1, timestamp2) {
  const date1 = new Date(timestamp1)
  const date2 = new Date(timestamp2)

  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    throw new Error("Invalid timestamp provided")
  }

  const differenceInMilliseconds = date2.getTime() - date1.getTime()

  return differenceInMilliseconds
}

module.exports = timestampsDifferenceInMs