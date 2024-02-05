import { doc, updateDoc } from "firebase/firestore"; 
import { db } from "../firebase.js";

// Functions
import getCurrentDate from "./getCurrentDate.js";
import getCurrentTime24H from "./getCurrentTime24H.js";

const _updateDoc = async (collectionName, data, accessToken) => {
  try {

    await updateDoc(doc(db, collectionName, accessToken), {
      ...data,
      lastUpdate: {
        time: getCurrentTime24H(),
        date: getCurrentDate()}
      });

  } catch (error) {

    console.error("Error updating document: ", error);

  } 
}

export default _updateDoc;