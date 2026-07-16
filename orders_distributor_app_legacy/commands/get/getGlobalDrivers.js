const { query, collection, where, getDocs } = require("firebase/firestore");
const { db } = require("../../config/firebase.js");
const { store } = require("../../store.js");

async function getGlobalDrivers() {
  try {
    const uid = store.user.values.userInfo.uid;
    const q = query(
      collection(db, "drivers"),
      where("partnerUid", "==", uid),
      where("sync", "==", "GLOBAL")
    );
    const querySnapshot = await getDocs(q);
    const driversData = [];

    querySnapshot.forEach((doc) => {
      driversData.push(doc.data());
    });

    return driversData;
  } catch (e) {
    console.log(e);
    return [];
  }
}

module.exports = getGlobalDrivers;
