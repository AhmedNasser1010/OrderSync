import { collection, addDoc, updateDoc, doc } from "firebase/firestore"; 
import { db } from "../firebase.js";

const _addDoc = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName, "7a7a"), {data});
    // await updateDoc(docRef, docRef.id);
  } catch (error) {
    console.error("Error adding document: ", error);
  } 
}

export default _addDoc;