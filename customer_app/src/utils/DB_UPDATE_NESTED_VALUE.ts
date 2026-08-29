import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DB_UPDATE_NESTED_VALUE = async (
  collectionName: string,
  docID: string,
  field: string,
  value: unknown
) => {
  try {
    const docRef = doc(db, collectionName, docID);
    await updateDoc(docRef, { [field]: value });
    return true;
  } catch (error) {
    console.error("Error updating document field:", error);
    return false;
  }
};

export default DB_UPDATE_NESTED_VALUE;
