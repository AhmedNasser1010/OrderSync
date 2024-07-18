const { doc, getDoc } = require('firebase/firestore')
const { db } = require('../../config/firebase.js')


const DB_GET_DOC = async (collectionName, subCollectionID) => {
  try {
  	
    const docRef = doc(db, collectionName, subCollectionID)
    
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {

      return docSnap.data()

    } else {
      return false
    }

  } catch (error) {
    console.error(error)
    return false
  }
}

module.exports = DB_GET_DOC