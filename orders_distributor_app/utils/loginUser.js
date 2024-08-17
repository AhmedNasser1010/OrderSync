const { signInWithEmailAndPassword } = require("firebase/auth");
const { auth } = require("../config/firebase.js");

const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error.message);
    throw error;
  }
};

module.exports = loginUser;
