import { doc, setDoc } from "firebase/firestore"; 
import { db } from "../firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";

import authSignOut from "./authSignOut.js";
import userRegRecordData from "./userRegRecordData.js";


const _signupUser = async (values, onSubmit) => {

  try {
    
    let userData = {
      jwt: "",
      userInfo: {
        uid: "",
        email: values.email,
        password: values.password,
        role: values.role,
      },
      registrationHistory: [],
      data: {
        businesses: [],
      },
    };


    // auth signup
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    const userID = userCredential.user.uid;

    // record user signup
    const record = await userRegRecordData("SIGNUP");
    userData.registrationHistory[0] = record;

    // get jwt
    userData.jwt = await userCredential.user.getIdToken();

    // set user id
    userData.userInfo.uid = userID;

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

export default _signupUser;