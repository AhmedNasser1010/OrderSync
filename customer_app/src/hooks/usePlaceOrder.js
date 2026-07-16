import { db } from '../config/firebase.js'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore'
import randomOrderNumber from '../utils/randomOrderId.js'

const usePlaceOrder = () => {
  const newOrder = async (data, accessToken) => {
    try {
      window.write += 1
      console.log('Write: ', window.write)

      const orderRef = doc(db, 'orders', accessToken)

      const final = {
        ...data,
        orderNumber: randomOrderNumber(),
        status: 'RECEIVED',
        timestamp: Date.now(),
      }

      const snap = await getDoc(orderRef)
      if (snap.exists()) {
        await updateDoc(orderRef, {
          open: arrayUnion(final)
        })
      } else {
        await setDoc(orderRef, {
          accessToken,
          partnerUid: data.businessId || '',
          open: [final],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }

      return true
    } catch (error) {
      return false
    }
  }

  return newOrder
}

export default usePlaceOrder
