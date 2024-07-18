const { doc, updateDoc } = require("firebase/firestore") 
const { db } = require("../../config/firebase.js")

const DB_UPDATE_NESTED_VALUE = async (collection, subcollection, path, value) => {
  try {
    const docRef = doc(db, collection, subcollection)

    await updateDoc(docRef, {
      [path]: value
    })

    return true

  } catch (error) {

    console.error("Error update item: ", error)

    return false

  } 
}

module.exports = DB_UPDATE_NESTED_VALUE