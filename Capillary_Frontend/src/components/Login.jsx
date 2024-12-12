import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State for user login status

  const decodeJWT = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  };

  const handleSuccess = (credentialResponse) => {
    const user = decodeJWT(credentialResponse.credential);
    console.log("User Info:", user);
    localStorage.setItem("user", JSON.stringify(user));
    setIsLoggedIn(true); 
    navigate("/dashboard");
  };

  const handleFailure = () => {
    console.error("Login Failed");
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem("user");
    setIsLoggedIn(false); // Reset login status
  };

  // Show popup after 3 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowPopup(true);
    }, 3000);

    // Cleanup timeout on component unmount
    return () => clearTimeout(timeout);
  }, []);

  // Check if user is already logged in on component load
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="logo">
            <div className="logo-circle">
              <i className="lock-icon">🔒</i>
            </div>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to your account</p>
        </div>

        <div className="login-form">
          {!isLoggedIn ? (
            <>
              <div className="google-btn-container">
                <GoogleLogin 
                  onSuccess={handleSuccess} 
                  onError={handleFailure} 
                />
              </div>

              <div className="divider">
                <span>Secure login powered by Google</span>
              </div>
            </>
          ) : (
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          )}
        </div>

        <div className="login-footer">
          <p>
            By continuing, you agree to our{' '}
            <a href="#">Terms of Service</a> and{' '}
            <a href="#">Privacy Policy</a>
          </p>
        </div>
      </div>

      {showPopup && !isLoggedIn && (
        <div className="google-popup">
          <GoogleLogin 
            onSuccess={handleSuccess} 
            onError={handleFailure} 
          />
        </div>
      )}

      <div className="help-text">
        <a href="#">Need help? Contact Support</a>
      </div>
    </div>
  );
};

export default Login;
