import { Navigate } from 'react-router-dom';
import { auth } from "./firebase.js";

const PrivateRoute = ({ children }) => {
  return auth.currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;


// // Private route is open right now
// const PrivateRoute = ({ children }) => {
//   return children;
// };

// export default PrivateRoute;