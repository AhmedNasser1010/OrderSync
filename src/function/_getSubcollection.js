import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.js";

const _getSubcollection = async (collectionName, subCollectionID) => {
  try {
  	
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

export default _getSubcollection;
