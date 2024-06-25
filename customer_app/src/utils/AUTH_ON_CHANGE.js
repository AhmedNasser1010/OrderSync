import { auth } from "../config/firebase.js"
import DB_GET_DOC from "./DB_GET_DOC.js"

const AUTH_ON_CHANGE = async () => {

	// get user id
	const uid = await new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        resolve(user.uid)
      }
      unsubscribe()
    })
  })

	// get user data
  const data = await DB_GET_DOC("customers", uid)

  if (data) {
    return data
  } else {
    return false
  }
  
}

export default AUTH_ON_CHANGE