import { doc, deleteDoc } from "firebase/firestore"; 
import { db } from "../firebase.js";

const _deleteDoc = async (collectionName, accessToken) => {
  try {
    await deleteDoc(doc(db, collectionName, accessToken));
    return true
  } catch (error) {
    console.error("Error deleting document: ", error);
    return false
  } 
}

export default _deleteDoc;