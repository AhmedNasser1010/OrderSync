import { db } from '../firebase.js'
import {
  doc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore'

const newOrder = async (req, res, next) => {
  console.log('/new-order | was called')

  try {

    const data = req.body
    const secretKey = req.headers['x-secret-key']
    const orderRef = doc(db, 'orders', secretKey)

    await updateDoc(orderRef, {
      open: arrayUnion(data)
    })

    res.status(200).send('order created successfully')

  } catch (error) {
    res.status(400).send(error.message)
  }
};

export default newOrder