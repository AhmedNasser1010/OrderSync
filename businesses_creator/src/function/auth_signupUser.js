import { doc, setDoc } from "firebase/firestore"; 
import { db } from "../firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";

import authSignOut from "./authSignOut.js";

const auth_signupUser = async (values, onSubmit) => {

  try {
    
    let userData = {
      userInfo: {
        uid: "",
        email: values.email,
        password: values.password,
        role: 'BUSINESSES_CREATOR',
      },
      registrationHistory: [],
      data: {
        businesses: [],
      },
    };


    // auth signup
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    const userID = userCredential.user.uid;

    // set user id
    userData.userInfo.uid = userID;

    console.log('userData', userData)

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