import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"

import DB_ADD_DOC from '../utils/DB_ADD_DOC'
import customerSchema from '../object-schemas/customerSchema'

const useSignupGoogleProvider = () => {
  const signupGoogleProvider = async () => {
    const provider = new GoogleAuthProvider()
    const auth = getAuth()
    const db = getFirestore()

    try {
      window.read += 1
      console.log('Read: ', window.read)

      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const userDoc = doc(db, "customers", user.uid)
      const docSnapshot = await getDoc(userDoc)

      if (docSnapshot.exists()) {
        window.location.reload()
      } else {
        const createUserData = customerSchema({
        	uid: user?.uid,
        	name: user?.displayName,
        	email: user?.email,
        	phone: '',
        	refferredBy: '',
        	avatar: user?.photoURL,
          provider: 'Google'
        })

        DB_ADD_DOC('customers', user.uid, createUserData)
        .then(res => {
        	if (res) {
        		window.location.reload()
        	}
        })
      }

      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  return signupGoogleProvider
}

export default useSignupGoogleProvider