const collections = {
  businesses: 'businesses',
  orders: 'orders'
}
const debuggingMode = false
const distances = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3]
const maxQueueLength = [0, 1, 2, 3]
const maxDistanceInKm = 0.2
const divideOn = 1.2
const maxExtraOrdersLength = 4

module.exports = {
	collections,
  debuggingMode,
  distances,
  maxQueueLength,
  maxDistanceInKm,
  divideOn,
  maxExtraOrdersLength
}