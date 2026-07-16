const { doc, updateDoc, arrayUnion } = require("firebase/firestore")
const { db } = require("../../config/firebase.js")

const DB_ARRAY_UNION = async (collection, subcollection, arrayPath, value) => {
  try {

    const docRef = doc(db, collection, subcollection)

    await updateDoc(docRef, {
      [arrayPath]: arrayUnion(value)
    })

    return true
  } catch (error) {

    console.error("Error update item: ", error)
    return false

  } 
}

module.exports = DB_ARRAY_UNION