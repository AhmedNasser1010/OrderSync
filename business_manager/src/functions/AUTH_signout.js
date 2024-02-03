import { auth } from "../firebase.js";
import { signOut } from "firebase/auth";

import userRegRecordData from "./userRegRecordData.js";
import _updateAnArray from "./_updateAnArray.js";

const AUTH_signout = async (recordProcess = true) => {
  if (auth.currentUser) {

    if (recordProcess) {
      // record user logout
      const record = await userRegRecordData("LOGOUT");
      _updateAnArray("users", auth.currentUser.uid, "registrationHistory", record);
    }

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

export default AUTH_signout;