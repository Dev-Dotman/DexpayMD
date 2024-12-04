import React, { useState, useEffect, useContext } from "react";
import "./Loginpage.css";
import {
  FaFacebookF,
  FaGoogle,
  FaLinkedinIn,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { IoLogoWhatsapp, IoCard } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import IpAddress from "../Config/IpAddress";
import "./SmallerComps/Spinner.css";
import { AuthContext } from "../Contexts/AuthProvider";
import { fetchWithAuth } from "../Services/fetchHelper";
import { jwtDecode } from "jwt-decode";
import crypto from "../images/undraw_crypto_portfolio_2jy5.svg";



const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ip = IpAddress.ip;
  const [err, setErr] = useState("");
  const { login, isAuthenticated } = useContext(AuthContext);

  useEffect (() => {
    if (isAuthenticated){
      navigate("/")
    }
  }, [])

  useEffect(() => {
    const gridSpacing = 20; // The spacing for the grid pattern

    const generateGridPositions = (count, width, height) => {
      const positions = [];
      const maxRows = Math.floor(height / gridSpacing);
      const maxCols = Math.floor(width / gridSpacing);

      while (positions.length < count) {
        const newPos = {
          top: Math.floor(Math.random() * maxRows) * gridSpacing,
          left: Math.floor(Math.random() * maxCols) * gridSpacing,
        };
        if (
          !positions.some(
            (pos) => pos.top === newPos.top && pos.left === newPos.left
          )
        ) {
          positions.push(newPos);
        }
      }
      return positions;
    };

    const whatsappPositions = generateGridPositions(
      15,
      window.innerWidth,
      window.innerHeight
    );
    const cardPositions = generateGridPositions(
      10,
      window.innerWidth,
      window.innerHeight
    );

    setPositions([
      ...whatsappPositions.map((pos) => ({ ...pos, type: "whatsapp" })),
      ...cardPositions.map((pos) => ({ ...pos, type: "card" })),
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    try {
      const response = await fetchWithAuth(`${ip}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // Handle successful login
        console.log("Login successful:", data);
        const token = data.accessToken;
        const decoded = jwtDecode(data.accessToken);
        console.log("Decoded JWT:", decoded);
        if (data.accessToken) {
          login(data.accessToken);
          navigate("/")
        } else {
          console.error(data.message);
        }
      } else {
        // Handle login error
        console.error("Login failed:", data);
        setErr(data.error);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErr("An error occurred. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="login-page">
      {loading && (
        <div className="loading-overlay">
          <div className="backg">
            <div className="spinner"></div>
          </div>
        </div>
      )}
      <div className="login-container">
        <div className="login-form">
          <div className="form-Holder">
            <h2 style={{ fontWeight: "800", color: "white" }}>
              Welcome to Dexpay
            </h2>
            <h3 style={{ fontWeight: "500", color: "white" }}>
              Please sign in with your credentials
            </h3>
            {err && <p className="error-message">{err}</p>}
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="password-input-container">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="password-toggle-icon"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <button
                type="submit"
                style={{
                  backgroundColor: "#1e1e2e",
                  width: "50%",
                  borderRadius: "20px",
                  color: "white"
                }}
                disabled={loading} // Disable the button when loading
              >
                Sign In
              </button>
            </form>
            <p>Don't have an account ?</p>
            <button className="signup-btn" onClick={() => navigate("/signup")}>
              Register now
            </button>
          </div>
        </div>
        <div className="signup-section">
          <div className="signup-content">
            <img src={crypto} className="crypto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
