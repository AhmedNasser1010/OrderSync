import { doc, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "../firebase.js"

const _updateAnArray = async (collection, subcollection, arrayPath, value) => {
  try {
    window.write += 1
    console.log('Write: ', window.write)

    const docRef = doc(db, collection, subcollection)

    await updateDoc(docRef, {
      [arrayPath]: arrayUnion(value)
    })

    return true
  } catch (error) {
    console.error("Error update item: ", error)
    return false
  } 
}

export default _updateAnArray