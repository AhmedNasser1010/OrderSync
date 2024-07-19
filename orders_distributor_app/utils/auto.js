const { doc, onSnapshot, collection, query, where } = require("firebase/firestore")
const { db } = require("../config/firebase")
const { store, setState, setValue, setSubscribe } = require('../store.js')
const getInDeliveryOrders = require('./getInDeliveryOrders')
const getDrivers = require('./getDrivers')
const filteredAvailableDrivers = require('./filteredAvailableDrivers')
const getBelongingRes = require('./getBelongingRes')
const findDriversWithinDistance = require('./findDriversWithinDistance')
const findDriversWithQueue = require('./findDriversWithQueue')
const findDriversWithSmallestOrders = require('./findDriversWithSmallestOrders')
const randomDriver = require('./randomDriver')
const getInProgressOrders = require('./getInProgressOrders')
const getCurrentResInProgressOrders = require('./getCurrentResInProgressOrders')
const getNeardyOrders = require('./getNeardyOrders')
const getAboutToDone = require('./getAboutToDone')
const assign = require('./assign')
const assignLog = require('./assignLog')
const { debuggingMode } = require('../constants.js')

let unsubscribe = null

async function auto(status) {

  if (status === 'on') {
    on()
  } else if (status === 'off') {
    off()
  }
}

function on() {
  setState('orders')
  const businessIDs = store.user.values.data.businesses
  const q = query(collection(db, "orders"), where("accessToken", "in", businessIDs))

  unsubscribe = onSnapshot(q, (querySnapshot) => {
    let finalAllOrders = []

    querySnapshot.forEach((doc) => {
      const orders = doc.data().open

      if (Array.isArray(orders)) {
        orders.forEach(order => {
          finalAllOrders.push({ ...order, accessToken: doc.id })
        })
      } else {
        console.error("Expected 'open' to be an array, got:", orders)
      }
    })

    setValue('orders', finalAllOrders)
  })

  console.log('Order auto distributor mode started...')
}

function off() {
  if (!unsubscribe) return

  unsubscribe()
  unsubscribe = null

  console.log('Order auto distributor mode stopped.')
}

setSubscribe(async (store) => {
  try {
    let performanceStart1 = performance.now()

    let orders = []
    let driver = null

    // Phase 1: Get available orders
    const inDeliveryOrders = await getInDeliveryOrders(store.orders.values)
    if (!inDeliveryOrders.length) return


    // Phase 2: Get all drivers
    const drivers = await getDrivers()
    if (!drivers.length) return

    // Phase 3: Get the online drivers
    const availableDrivers = await filteredAvailableDrivers(drivers)
    if (!availableDrivers.length) return

    // Phase 4: Loop on our available orders
    for (const [index, order] of inDeliveryOrders.entries()) {
      debuggingMode && console.log(`PASSED  4 0.00ms`)

      // Phase 5: Get the belonging restaursnt to the order
      const restaurant = await getBelongingRes(store.restaurants.values, order)
      if (!restaurant) return
      const resLocation = restaurant.business.latlng

      // Phase 6: Find an a drivers within specific distance
      const driversWithDistance = await findDriversWithinDistance(order, availableDrivers, resLocation)
      if (driversWithDistance && driversWithDistance?.drivers.length === 0) return

      // Phase 7: Drivers with zero queue or more
      const driversWithQueue = await findDriversWithQueue(driversWithDistance.drivers, order, resLocation)
      if (!driversWithQueue.length) return

      // Phase 8: Last 3 or any drivers with smallest orders count done today
      const driversWithSmallestOrders = findDriversWithSmallestOrders(driversWithQueue)
      if (!driversWithSmallestOrders.length) return

      // Phase 9: Choose only one driver randomly from the last selected drivers
      const choosedDriver = randomDriver(driversWithSmallestOrders)
      if (!choosedDriver) return

      // Phase 10: Get in progress orders
      const inProgressOrders = getInProgressOrders(store.orders.values)

      // Phase 11: Get current restaurant in progress orders
      const currentResInProgressOrders = getCurrentResInProgressOrders(inProgressOrders, order.accessToken)

      // Phase 12: Get closest orders around the main order about 1km
      const neardyOrders = getNeardyOrders(currentResInProgressOrders, order)

      // Phase 13: Get the about to done orders
      const aboutToDone = getAboutToDone(neardyOrders, restaurant.services.cookTime)

      // Phase 14: Assign the orders to the driver
      const isAssigned = await assign(choosedDriver, [ ...aboutToDone, order ])
      if (!isAssigned) return

      orders = [ ...aboutToDone, order ]
      driver = choosedDriver
    }

    const performanceEnd1 = performance.now()
    const duration = (performanceEnd1 - performanceStart1).toFixed(0)
    assignLog.done(duration, orders, driver)
  } catch(e) {
    assignLog.error(null, null, null, 'Error while preparing orders distributor mode')
    console.log(e)
  }
  
}, ['orders'])

module.exports = auto