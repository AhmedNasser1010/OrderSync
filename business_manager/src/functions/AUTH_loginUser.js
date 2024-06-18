import { doc, setDoc } from "firebase/firestore"; 
import { db } from "../firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";

import DB_GET_DOC from "./DB_GET_DOC.js";

// Functions
import AUTH_signout from "./AUTH_signout.js";

const AUTH_loginUser = async (values, onSubmit) => {

  try {
    
    // check if the user is already logged in
    if (auth.currentUser) {

      console.warn("Auth: You are already logged in");

    } else {

      // auth login
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const userID = userCredential.user.uid;
      const data = await DB_GET_DOC("users", userID);

      if (data) {
        // check if the login user are business owner
        if (data.userInfo.role !== "BUSINESS_MANAGER") {
          AUTH_signout(false);
          onSubmit(false, "auth/invalid-credential");
          return;
        }

        onSubmit(true, undefined, data);
      } else {
        onSubmit(true, undefined, null)
      }

    }

  } catch(error) {

    const errorCode = error.code;
    const errorMessage = error.message;

    console.log(error);
    onSubmit(false, errorCode);

  }
}

export default AUTH_loginUser;