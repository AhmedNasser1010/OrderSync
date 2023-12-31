import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
    return (
        <div className="login">
            Login
            <span style={{display: "block"}}>Or <Link to="/register" style={{color: "blue"}}>register</Link> a new account</span>
        </div>
    )
}

export default Login;