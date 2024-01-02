import { auth } from "../firebase.js";
import { signOut } from "firebase/auth";

const authSignOut = () => {
    if (auth.currentUser) {
    signOut(auth)
        .then(() => {
            console.log("Logged out successful!");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            console.error(errorCode);
            console.error(errorMessage);
        });
    } else {
        console.warn("You are already logged out");
    }
}

export default authSignOut;