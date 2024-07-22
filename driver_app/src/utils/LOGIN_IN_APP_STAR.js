import { auth } from "../firebase.js"
import DB_GET_DOC from "./DB_GET_DOC.js"

const LOGIN_IN_APP_STAR = async () => {

  try {
    const uid = await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          resolve(user.uid)
        }
        unsubscribe()
      })
    })

    const data = await DB_GET_DOC("drivers", uid)
    
    return data
  } catch (err) {
    return false
  }
}

export default LOGIN_IN_APP_STAR