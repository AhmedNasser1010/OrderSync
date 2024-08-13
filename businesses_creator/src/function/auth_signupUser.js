import { doc, setDoc } from "firebase/firestore"; 
import { db } from "../firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";

import authSignOut from "./authSignOut.js";

const auth_signupUser = async (values, onSubmit) => {

  try {
    // auth signup
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    const userID = userCredential.user.uid

    const userData = {
      joinDate: Date.now(),
      uid: userID,
      userInfo: {
        uid: userID,
        email: values.email,
        role: 'BUSINESSES_CREATOR',
      },
      data: {
        businesses: [],
      },
    }

    // store user in firestore
    const docRef = doc(db, "users", userID);
    await setDoc(docRef, userData);

    onSubmit(true);

    authSignOut();

  } catch(error) {

    const errorCode = error.code;
    const errorMessage = error.message;

    console.log(error)
    onSubmit(false, errorCode);
    authSignOut();

  }
}

export default auth_signupUser;