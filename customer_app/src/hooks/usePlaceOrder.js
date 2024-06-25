import { db } from '../config/firebase.js'
import {
  doc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore'
import randomOrderId from '../utils/randomOrderId.js'

const usePlaceOrder = () => {
  const newOrder = async (data, accessToken) => {
    try {

      const orderRef = doc(db, 'orders', accessToken)

      const final = {
        ...data,
        id: randomOrderId(),
        status: 'RECEIVED',
        timestamp: Date.now(),
      }

      await updateDoc(orderRef, {
        open: arrayUnion(final)
      })

      return true
    } catch (error) {
      return false
    }
  }

  return newOrder
}

export default usePlaceOrder