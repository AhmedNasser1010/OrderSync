import { auth } from "../firebase.js"
import { signOut } from "firebase/auth"

const AUTH_SIGNOUT = async () => {
  if (auth.currentUser) {
    signOut(auth)
      .catch((error) => {
        const errorCode = error.code
        const errorMessage = error.message

        console.log(error)
      });
  } else {
    console.warn("You are already logged out")
  }
}

export default AUTH_SIGNOUT