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
const { performance } = require('perf_hooks')
const assignLog = require('./assignLog')

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
    // const s1 = performance.now()
    const inDeliveryOrders = await getInDeliveryOrders(store.orders.values)
    if (!inDeliveryOrders.length) return
    // const e1 = performance.now()
    // console.log(`PASSED  1 ${(e1 - s1).toFixed(2)}ms`)

    // Phase 2: Get all drivers
    // const s2 = performance.now()
    const drivers = await getDrivers()
    if (!drivers.length) return
    // const e2 = performance.now()
    // console.log(`PASSED  2 ${(e2 - s2).toFixed(2)}ms`)

    // Phase 3: Get the online drivers
    // const s3 = performance.now()
    const availableDrivers = await filteredAvailableDrivers(drivers)
    if (!availableDrivers.length) return
    // const e3 = performance.now()
    // console.log(`PASSED  3 ${(e3 - s3).toFixed(2)}ms`)

    // Phase 4: Loop on our available orders
    // const s4 = performance.now()
    for (const [index, order] of inDeliveryOrders.entries()) {
      // const e4 = performance.now()
      // console.log(`PASSED  3 ${(e3 - s3).toFixed(2)}ms`)

      // Phase 5: Get the belonging restaursnt to the order
      // const s5 = performance.now()
      const restaurant = await getBelongingRes(store.restaurants.values, order)
      if (!restaurant) return
      const resLocation = restaurant.business.latlng
      // const e5 = performance.now()
      // console.log(`PASSED  5 ${(e5 - s5).toFixed(2)}ms`)

      // Phase 6: Find an a drivers within specific distance
      // const s6 = performance.now()
      const driversWithDistance = await findDriversWithinDistance(order, availableDrivers, resLocation)
      if (driversWithDistance && driversWithDistance?.drivers.length === 0) return
      // const e6 = performance.now()
      // console.log(`PASSED  6 ${(e6 - s6).toFixed(2)}ms`)

      // Phase 7: Drivers with zero queue or more
      // const s7 = performance.now()
      const driversWithQueue = await findDriversWithQueue(driversWithDistance.drivers, order, resLocation)
      if (!driversWithQueue.length) return
      // const e7 = performance.now()
      // console.log(`PASSED  7 ${(e7 - s7).toFixed(2)}ms`)

      // Phase 8: Last 3 or any drivers with smallest orders count done today
      // const s8 = performance.now()
      const driversWithSmallestOrders = findDriversWithSmallestOrders(driversWithQueue)
      if (!driversWithSmallestOrders.length) return
      // const e8 = performance.now()
      // console.log(`PASSED  8 ${(e8 - s8).toFixed(2)}ms`)

      // Phase 9: Choose only one driver randomly from the last selected drivers
      // const s9 = performance.now()
      const choosedDriver = randomDriver(driversWithSmallestOrders)
      if (!choosedDriver) return
      // const e9 = performance.now()
      // console.log(`PASSED  9 ${(e9 - s9).toFixed(2)}ms`)

      // Phase 10: Get in progress orders
      // const s10 = performance.now()
      const inProgressOrders = getInProgressOrders(store.orders.values)
      if (!inProgressOrders.length) return
      // const e10 = performance.now()
      // console.log(`PASSED 10 ${(e10 - s10).toFixed(2)}ms`)

      // Phase 11: Get current restaurant in progress orders
      // const s11 = performance.now()
      const currentResInProgressOrders = getCurrentResInProgressOrders(inProgressOrders, order.accessToken)
      if (!currentResInProgressOrders.length) return
      // const e11 = performance.now()
      // console.log(`PASSED 11 ${(e11 - s11).toFixed(2)}ms`)


      // Phase 12: Get closest orders around the main order about 1km
      // const s12 = performance.now()
      const neardyOrders = getNeardyOrders(currentResInProgressOrders, order)
      // const e12 = performance.now()
      // console.log(`PASSED 12 ${(e12 - s12).toFixed(2)}ms`)

      // Phase 13: Get the about to done orders
      // const s13 = performance.now()
      const aboutToDone = getAboutToDone(neardyOrders, restaurant.services.cookTime)
      // const e13 = performance.now()
      // console.log(`PASSED 13 ${(e13 - s13).toFixed(2)}ms`)

      // Phase 14: Assign the orders to the driver
      // const s14 = performance.now()
      const isAssigned = await assign(choosedDriver, [ ...aboutToDone, order ])
      if (!isAssigned) return
      // const e14 = performance.now()
      // console.log(`PASSED 14 ${(e14 - s14).toFixed(0)}ms`)

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