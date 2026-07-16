const { performance } = require('perf_hooks')
const getDistanceFromLatlngInKm = require('./getDistanceFromLatlngInKm')
const { debuggingMode, distances } = require('../constants.js')
const { onSnapshot, collection } = require("firebase/firestore")
const { db } = require("../config/firebase.js")

function findDriversNearestDrivers(drivers, resLocation) {
  const nearest = []

  for (const distance of distances) {
    if (drivers.length > 0) {
      for (const driver of drivers) {
        const driverDistance = getDistanceFromLatlngInKm(driver.liveLocation, resLocation)
        driverDistance <= distance && nearest.push(driver)
      }
    }

    if (nearest.length) return { drivers: nearest, distance }
  }
	
	return { drivers: nearest, distance: distances[distances.length-1] }
}

async function findDriversWithinDistance(order, drivers, resLocation) {
	try {
		const start = performance.now()
	
		const nearestDrivers = findDriversNearestDrivers(drivers, resLocation)
		
		if (nearestDrivers.drivers.length) {
			const end = performance.now()
      debuggingMode && console.log(`PASSED  6 ${(end - start).toFixed(2)}ms`)
			return nearestDrivers
		}

		console.log("ASSIGN: Waiting for online or drivers within specific distance...")
		return new Promise((resolve, reject) => {
      const unsub = onSnapshot(collection(db, "drivers"), querySnapshot => {
        const drivers = []
        
        querySnapshot.forEach(doc => {
          drivers.push(doc.data())
        })
        
        const nearestDrivers = findDriversNearestDrivers(drivers, resLocation)
        
        if (nearestDrivers.drivers.length) {
          unsub()
          
          const end = performance.now()
          debuggingMode && console.log(`PASSED  6 ${(end - start).toFixed(2)}ms`)

          resolve(nearestDrivers)
        }
      }, reject)
    })

	} catch(e) {
		console.log('Error while find drivers within distance:')
		console.log(e)
		throw e
	}
}

module.exports = findDriversWithinDistance