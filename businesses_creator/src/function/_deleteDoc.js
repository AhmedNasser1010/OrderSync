import { doc, deleteDoc } from "firebase/firestore"; 
import { db } from "../firebase.js";

const _deleteDoc = async (collectionName, accessToken) => {
  try {

    await deleteDoc(doc(db, collectionName, accessToken));

  } catch (error) {

    console.error("Error deleting document: ", error);

  } 
}

export default _deleteDoc;