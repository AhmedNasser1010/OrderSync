import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'

const DRIVER_STATUSES = ['RESERVED', 'PICKED_UP', 'ON_ROUTE']

export function useDriverLocation(driverUid, orderStatus) {
  const [liveLocation, setLiveLocation] = useState(null)

  useEffect(() => {
    if (!driverUid || !DRIVER_STATUSES.includes(orderStatus)) {
      setLiveLocation(null)
      return
    }

    const driverRef = doc(db, 'drivers', driverUid)
    const unsubscribe = onSnapshot(
      driverRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setLiveLocation(data.liveLocation || null)
        } else {
          setLiveLocation(null)
        }
      },
      (error) => {
        console.error('Error subscribing to driver location:', error)
        setLiveLocation(null)
      }
    )

    return () => unsubscribe()
  }, [driverUid, orderStatus])

  return liveLocation
}
