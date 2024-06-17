import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.js"

const DB_DELETE_SUBCOLLECTION = async (collection, subcollection) => {
	try {

		await deleteDoc(doc(db, collection, subcollection));

		return true
	} catch (err) {
		console.log('Error cannot delete subcollection')
		return false
	}
}

export default DB_DELETE_SUBCOLLECTION