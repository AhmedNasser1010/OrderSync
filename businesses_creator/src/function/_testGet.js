import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.js";

const _testGet = async (collectionName, subCollectionID) => {
  try {
  	
    const documentRef = doc(db, collectionName, subCollectionID);
    
    const documentSnapshot = await getDoc(documentRef);

    if (documentSnapshot.exists()) {
      console.log(documentSnapshot.data());
    } else {
      console.log("Document does not exist");
    }

  } catch (error) {
    console.error("Get doc error:", error);
  }
}

export default _testGet;
