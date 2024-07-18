const { doc, deleteDoc } = require('firebase/firestore')
const { db } = require('../../config/firebase.js')


const DB_DELETE_DOC = async (collectionName, subCollectionID) => {
  try {
  	
    const docRef = doc(db, collectionName, subCollectionID)
    
    const docSnap = await deleteDoc(docRef)
    console.log('docSnap', docSnap)

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

module.exports = DB_DELETE_DOC