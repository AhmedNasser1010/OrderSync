import { db } from '../firebase.js'
import {
  doc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore'
import randomOrderId from '../utils/randomOrderId.js'

const newOrder = async (req, res, next) => {
  console.log('/new-order | was called')

  try {

    const data = req.body
    const secretKey = req.headers['x-secret-key']
    const orderRef = doc(db, 'orders', secretKey)

    const final = {
      ...data,
      id: randomOrderId(),
      status: 'RECEIVED',
      timestamp: Date.now(),
    }

    await updateDoc(orderRef, {
      open: arrayUnion(final)
    })

    res.status(200).send({
      message: 'order created successfully',
      code: 200
    })
  } catch (error) {
    res.status(400).send(error.message)
  }
};

export default newOrder