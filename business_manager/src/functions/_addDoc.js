import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js"

const _addDoc = async (collectionName, data, accessToken) => {
  try {
    window.write += 1
    console.log('Write: ', window.write)

    await setDoc(doc(db, collectionName, accessToken), {...data})

    return true
  } catch (error) {

    console.error("Error adding document: ", error)

    return false
  } 
}

export default _addDoc