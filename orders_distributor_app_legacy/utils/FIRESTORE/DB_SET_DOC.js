const { doc, setDoc } = require("firebase/firestore")
const { db } = require("../../config/firebase.js")

const DB_SET_DOC = async (collectionName, accessToken, data) => {
  try {

    await setDoc(doc(db, collectionName, accessToken), {...data})

    return true
  } catch (error) {

    console.error("Error adding document: ", error)

    return false
  } 
}

module.exports = DB_SET_DOC