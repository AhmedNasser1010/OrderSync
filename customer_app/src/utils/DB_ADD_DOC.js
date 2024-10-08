import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase.js"

const DB_ADD_DOC = async (collectionName, accessToken, data) => {
  try {
    window.write += 1
    console.log('Write: ', window.write)

    await setDoc(doc(db, collectionName, accessToken), data)

    return true
  } catch (error) {

    console.error("Error adding document: ", error)

    return false
  } 
}

export default DB_ADD_DOC