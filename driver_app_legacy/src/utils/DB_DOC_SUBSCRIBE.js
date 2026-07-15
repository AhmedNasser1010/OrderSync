import { doc, onSnapshot } from "firebase/firestore"
import { db } from '../firebase'

const DB_DOC_SUBSCRIBE = async (docName, accessToken) => {
	try {
		const docRef = doc(db, docName, accessToken)

		const unsub = onSnapshot(docRef, doc => {
			window.read += 1
	    console.log('Read: ', window.read)

			if (doc.exists()) {
				return doc.data()
			}

			return null
		})
	} catch(e) {
		console.log(e)
		return null
	}
}

export default DB_DOC_SUBSCRIBE