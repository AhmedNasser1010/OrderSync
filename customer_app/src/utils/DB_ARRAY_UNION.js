import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore"; 
import { db } from "../config/firebase.js";

const DB_ARRAY_UNION = async (collection, subcollection, arrayPath, value) => {
  try {
    window.write += 1
    console.log('Write: ', window.write)

    const docRef = doc(db, collection, subcollection);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      await updateDoc(docRef, {
        [arrayPath]: arrayUnion(value)
      })
    } else {
      await setDoc(docRef, {
        [arrayPath]: [value]
      })
    }

    return true
  } catch (error) {

    console.error("Error update item: ", error);
    return false
  } 
}

export default DB_ARRAY_UNION;
