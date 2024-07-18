const { collection, getDocs } = require("firebase/firestore")
const { db } = require("../../config/firebase.js")

const DB_GET_COLLECTION = async (collectionName) => {
  try {

    const collectionRef = collection(db, collectionName)
    
    const querySnapshot = await getDocs(collectionRef)

    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    if (data.length > 0) {
      return data
    } else {
      console.error("Firestore: Collection is empty")
    }

    return null

  } catch (error) {
    console.error(error)
    return null
  }
}

module.exports = DB_GET_COLLECTION
