import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase.js"

const fetchStaff = async (accessToken) => {
	try {
		window.read += 1
		console.log('Read: ', window.read)

		const usersCollection = collection(db, "drivers");
		const q = query(usersCollection, where("accessToken", "==", accessToken))
		const querySnapshot = await getDocs(q)

		const data = querySnapshot.docs.map(doc => doc.data())
		const filterDatadata = data.filter(data => data.userInfo.role === 'ORDER_CAPTAIN' || data.userInfo.role === 'DRIVER')

		return filterDatadata
	} catch (error) {
		console.error("Error querying users:", error)
		return []
	}
}

export default fetchStaff