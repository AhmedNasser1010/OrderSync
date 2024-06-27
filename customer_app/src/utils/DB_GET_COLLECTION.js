import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase.js";

const DB_GET_COLLECTION = async (collectionName) => {
  try {
    window.read += 1
    console.log('Read: ', window.read)

    const collectionRef = collection(db, collectionName);
    
    const querySnapshot = await getDocs(collectionRef);

    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (data.length > 0) {
      return data;
    } else {
      console.error("Firestore: Collection is empty");
    }

  } catch (error) {
    console.error(error);
  }
}

export default DB_GET_COLLECTION;
