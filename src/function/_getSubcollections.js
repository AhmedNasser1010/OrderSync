import { doc, getDocs, query, where, collection } from "firebase/firestore";
import { db } from "../firebase.js";

const _getSubcollection = async (collectionName, arrayOfSubollections) => {
  try {

      let result = [];

      const docRef = collection(db, collectionName);
      const q = query(docRef, where("accessToken", "in", arrayOfSubollections));
      const querySnapshot = await getDocs(q);
      
        querySnapshot.forEach((doc) => {
          result.push(doc.data());
        });

        return result;

  } catch (error) {
    console.error(error);
  }
}

export default _getSubcollection;
