import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase.js"

import DB_GET_DOC from "./DB_GET_DOC.js"

import AUTH_SIGNOUT from "./AUTH_SIGNOUT.js"

const AUTH_SIGNUP = async (values, onSubmit) => {

  try {
    
    // check if the user is already logged in
    if (auth.currentUser) {

      console.warn("Auth: You are already logged in")

    } else {

      // auth login
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password)
      const userID = userCredential.user.uid
      const data = await DB_GET_DOC("drivers", userID)

      if (data) {
        const role = data.userInfo.role

        if (role === "DRIVER") {
          onSubmit(true, undefined, data)
        } else {
          AUTH_SIGNOUT()
          onSubmit(false, "auth/invalid-credential")
          return
        }
      } else {
        onSubmit(true, undefined, null)
      }

    }

  } catch(error) {

    const errorCode = error.code
    const errorMessage = error.message

    console.log(error)
    onSubmit(false, errorCode)

  }
}

export default AUTH_SIGNUP