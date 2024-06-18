import { auth } from "../firebase.js";
import { signOut } from "firebase/auth";

const authSignOut = async (recordProcess = true) => {
  if (auth.currentUser) {

  // signout process
  signOut(auth)
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      console.log(error);
    });
  } else {
    console.warn("You are already logged out");
  }
}

export default authSignOut;