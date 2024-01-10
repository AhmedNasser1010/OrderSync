import { doc, updateDoc, arrayRemove } from "firebase/firestore"; 
import { db } from "../firebase.js";

const _removeAnArrayItem = async (collection, subcollection, arrayPath, value) => {
  try {

    const docRef = doc(db, collection, subcollection);

    await updateDoc(docRef, {
      [arrayPath]: arrayRemove(value)
    })

  } catch (error) {

    console.error("Error update item: ", error);

  } 
}

export default _removeAnArrayItem;