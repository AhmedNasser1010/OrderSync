const { doc, updateDoc, deleteField } = require("firebase/firestore")
const { db } = require("../../config/firebase.js")

const DB_DELETE_NESTED_VALUE = async (collection, subcollection, path) => {
  try {

    const docRef = doc(db, collection, subcollection)

    await updateDoc(docRef, {
      [path]: deleteField()
    })

    return true

  } catch (error) {
    console.error("Error deleting item: ", error)
    return false
  } 
}

module.exports = DB_DELETE_NESTED_VALUE