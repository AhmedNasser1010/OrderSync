import { db } from '../firebase.js'
import {
  doc,
  getDoc,
} from 'firebase/firestore'

const getMenu = async (req, res, next) => {
  console.log('/menu | was called')

  try {

    const secretKey = req.headers['x-secret-key']
    const menu = doc(db, 'menus', secretKey)
    const data = await getDoc(menu)

    if (data.exists()) {
      let apiData = data.data()

      apiData = {
        ...apiData,
        categories: [
          ...apiData.categories.filter(category => category.visibility)
        ],
        items: [
          ...apiData.items.filter(item => item.visibility)
        ]
      }

      apiData = {
        ...apiData,
        items: apiData.items.filter(item =>
          apiData.categories.some(category => item.category === category.title)
        )
      }

      res.status(200).send(apiData)

    } else {
      res.status(404).send('product not found')
    }

  } catch (error) {
    res.status(400).send(error.message)
  }
}

export default getMenu