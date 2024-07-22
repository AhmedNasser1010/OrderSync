import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.js";

const DB_GET_DOC = async (collectionName, subCollectionID) => {
  try {
    window.read += 1
    console.log('Read: ', window.read)
  	
    const docRef = doc(db, collectionName, subCollectionID);
    
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {

      return docSnap.data();

    } else {

      console.error("Firestore: Document does not exist");

    }

  } catch (error) {
    console.error(error);
  }
}

export default DB_GET_DOC;
