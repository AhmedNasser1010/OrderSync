import { auth } from "../firebase.js";
import userRegRecordData from "./userRegRecordData.js";
import _updateAnArray from "./_updateAnArray.js";
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

	// record user open app
  const record = await userRegRecordData("OPEN_APP");
  await _updateAnArray("users", uid, "registrationHistory", record);

	// get user data
  const data = await _getSubcollection("users", uid);
  
  return data;
}

export default startApp;