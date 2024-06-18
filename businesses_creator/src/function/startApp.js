import { auth } from "../firebase.js";
import _getSubcollection from "./_getSubcollection.js";

const startApp = async () => {

	// get user id
	const uid = await new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        resolve(user.uid);
      }
      unsubscribe();
    });
  });

	// get user data
  const data = await _getSubcollection("users", uid);
  
  return data;
}

export default startApp;