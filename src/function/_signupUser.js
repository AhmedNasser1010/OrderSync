import { doc, setDoc } from "firebase/firestore"; 
import { db } from "../firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";

import authSignOut from "./authSignOut.js";

const _signupUser = async (values, onSubmit) => {

  try {
    
    // auth signup
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    const userID = userCredential.user.uid;

    // store user in firestore
    const userData = {
      userInfo: {
        id: userID,
        email: values.email,
        password: values.password,
        role: values.role,
        ip: "",
      },
      devices: [],
      registrationHistory: [
        {id: 0, ip: "", timestemp: Date.now(), device: ""},
      ],
      data: {
        businesses: [],
      },
    }

    const docRef = doc(db, "users", userID);
    await setDoc(docRef, userData);

    onSubmit(true);

    authSignOut();

  } catch(error) {

    const errorCode = error.code;
    const errorMessage = error.message;

    onSubmit(false, errorCode);

  }
}

export default _signupUser;