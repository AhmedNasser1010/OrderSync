import { doc, getDocs, collection } from "firebase/firestore";
import { db } from "../firebase.js";

const _getDocs = async (collectionName) => {

	try {

		const querySnapshot = await getDocs(collection(db, collectionName));
		let result = [];
		querySnapshot.forEach((doc) => {
			
			result.push(doc.data());

		});
		return result;

	} catch (error) {

		console.error("Get doc error:", error);

	}
}

export default _getDocs;