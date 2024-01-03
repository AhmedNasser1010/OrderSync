import { collection, addDoc } from "firebase/firestore"; 
import { db } from "../firebase.js";

const _addBuisness = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {data});
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  } 
}

export default _addBuisness;