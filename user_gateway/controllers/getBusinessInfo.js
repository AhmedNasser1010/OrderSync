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
        services: {
          openingHours: data.services.openingHours,
          deliveryTax: data.services.deliveryTax,
          isStrictOnline: data.services.isStrictOnline,
          tempCloseMsg: data.services.tempCloseMsg
        },
        business: {
          latlng: data.business.latlng,
          name: data.business.name,
          address: data.business.address
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