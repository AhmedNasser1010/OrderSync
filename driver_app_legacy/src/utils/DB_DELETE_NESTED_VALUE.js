import { doc, updateDoc, deleteField } from "firebase/firestore"
import { db } from "../firebase.js"

const DB_DELETE_NESTED_VALUE = async (collection, subcollection, path) => {
  try {
    window.write += 1
    console.log('Write: ', window.write)

    const docRef = doc(db, collection, subcollection)

    await updateDoc(docRef, {
      [path]: deleteField()
    })

    return true

  } catch (error) {
    console.error("Error deleting item: ", error)
    return false
  } 
}

export default DB_DELETE_NESTED_VALUE