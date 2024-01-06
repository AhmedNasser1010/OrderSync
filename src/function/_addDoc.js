import { doc, setDoc } from "firebase/firestore"; 
import { db } from "../firebase.js";

const _addDoc = async (collectionName, data, accessToken) => {
  try {

    await setDoc(doc(db, collectionName, accessToken), {data});

  } catch (error) {

    console.error("Error adding document: ", error);

  } 
}

export default _addDoc;