import React, { useState, useEffect } from "react";
import "./Signuppage.css";
import { FaEye, FaEyeSlash, FaCamera } from "react-icons/fa";
import { IoLogoWhatsapp, IoCard } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import IpAddress from "../Config/IpAddress";
import { fetchWithAuth } from "../Services/fetchHelper";
import crypto from "../images/undraw_authentication_re_svpt.svg";

const Signup = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [profilePic2, setProfilePic2] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [positions, setPositions] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  const ip = IpAddress.ip;
  const [err, setErr] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

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

  const handleProfilePicChange = (e) => {
    setProfilePic(e.target.files[0]);
    setProfilePic2(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are filled
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !nickname ||
      !password ||
      !termsAccepted ||
      !profilePic
    ) {
      setErr("Please fill all fields and accept the terms.");
      return;
    }

    setLoading(true);

    // Create a new FormData object
    const formData = new FormData();
    formData.append("profilePic", profilePic); // assuming profilePic is the File object for the image
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("phoneNumber", phoneNumber);
    formData.append("nickname", nickname);
    formData.append("password", password);

    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      const response = await fetchWithAuth(`${ip}/signup`, {
        method: "POST",
        body: formData, // Send FormData object directly
      });

      const data = await response.json();
      if (response.ok) {
        // Handle successful signup
        alert("Successful");
        navigate("/");
      } else {
        // Handle signup error
        console.log(data);
        setErr(data.error);
        alert(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      setErr(
        `Sorry ${firstName} we're having some issues creating your account right now. Please try again later.`
      );
      alert(
        `Sorry ${firstName} we're having some issues creating your account right now. Please try again later.`
      );
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="signup-page">
      {loading && (
        <div className="loading-overlay">
          <div className="backg">
            <div className="spinner"></div>
          </div>
        </div>
      )}
      <div className="signup-container">
        {currentStep === 1 && (
          <div className="signup-form">
            <h2 style={{ fontWeight: "800", color: "white" }}>Welcome!</h2>
            <h3 style={{ fontWeight: "600", color: "white" }}>
              Let's set up your profile
            </h3>
            {err && <p className="error-message">{err}</p>}
            <form className="form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
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
                  {passwordVisible ? <FaEyeSlash  color="white"/> : <FaEye color="white"/>}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                style={{
                  backgroundColor: "#0d0d0d",
                  width: "50%",
                  borderRadius: "10px",
                  color: "white"
                }}
              >
                Next
              </button>
              <button
                className="signup-btn"
                onClick={() => navigate("/login")}
              >
                Already have an account?
              </button>
            </form>
          </div>
        )}
        {currentStep === 2 && (
          <div className="signup-form">
            <h2 style={{ fontWeight: "800", color: "white" }}>
              Profile Picture
            </h2>
            <div className="profile-pic-container2">
              <label htmlFor="profile-pic-input">
                <div
                  className="profile-pic"
                  style={{
                    backgroundImage: `url(${
                      profilePic2 || "path/to/default/avatar.png"
                    })`,
                    borderColor: profilePic2 ? "#00ff00" : "white",
                  }}
                >
                  {!profilePic2 && <FaCamera color="#273532"/>}
                </div>
              </label>
              <input
                id="profile-pic-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleProfilePicChange}
              />
            </div>
            {err && <p className="error-message">{err}</p>}
            <form className="form" onSubmit={handleSubmit}>
              <div className="terms-and-conditions">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                  style={{
                    height: "30px",
                    width: "30px",
                  }}
                />
                <p>
                  By creating your account you agree to Dexpay's{" "}
                  <a href="/terms">Terms & Conditions</a> and{" "}
                  <a href="/privacy">Privacy Policy</a>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                style={{
                  backgroundColor: "#0d0d0d",
                  width: "50%",
                  borderRadius: "10px",
                  color: "white"
                }}
              >
                Previous
              </button>
              <button
                type="submit"
                style={{
                  backgroundColor: "#0d0d0d",
                  width: "50%",
                  borderRadius: "10px",
                  color: "white"
                }}
              >
                Sign Up
              </button>
              <button
                className="signup-btn"
                onClick={() => navigate("/login")}
              >
                Already have an account?
              </button>
            </form>
          </div>
        )}
        <div className="info-section">
          <div className="signup-content">
            <img src={crypto} className="crypto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
