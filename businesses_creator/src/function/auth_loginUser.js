import { doc, setDoc } from "firebase/firestore"; 
import { db } from "../firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";

import authSignOut from "./authSignOut.js";
import _getSubcollection from "./_getSubcollection.js";

const auth_loginUser = async (values, onSubmit) => {

  try {
    
    // check if the user is already logged in
    if (auth.currentUser) {

      console.warn("Auth: You are already logged in");

    } else {

    // auth login
    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
    const userID = userCredential.user.uid;

    // get user data
    const data = await _getSubcollection("users", userID);

    // check if the login user are business owner
    if (data.userInfo.role !== "BUSINESSES_CREATOR") {
      authSignOut(false);
      onSubmit(false, "auth/invalid-credential");
      return;
    }

    onSubmit(true, undefined, data);

    }

  } catch(error) {

    const errorCode = error.code;
    const errorMessage = error.message;

    console.log(error);
    onSubmit(false, errorCode);

  }
}

export default auth_loginUser;