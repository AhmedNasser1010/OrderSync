import { db } from '../firebase.js'
import {
  doc,
  getDoc,
} from 'firebase/firestore'

const getBusinessInfo = async (req, res, next) => {
  console.log('/business | was called')

  try {

    const secretKey = req.headers['x-secret-key']
    const menu = doc(db, 'businesses', secretKey)
    const docData = await getDoc(menu)

    if (docData.exists()) {
      let data = docData.data()

      const finalData = {
        operations: {
          openingHours: data.operations.openingHours,
          deliveryTax: data.operations.deliveryTax
        },
        profile: {
          latlng: data.profile.latlng,
          name: data.profile.name,
          address: data.profile.address
        },
        branding: {
          closeMsg: data.branding.closeMsg,
        }
      }

      res.status(200).send(finalData)

    } else {
      res.status(404).send('business is not defined')
    }

  } catch (error) {
    res.status(400).send(error.message)
  }
}

export default getBusinessInfo