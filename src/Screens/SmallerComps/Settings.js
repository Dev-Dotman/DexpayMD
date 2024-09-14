import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  CssBaseline,
  Divider,
  Avatar,
  Grid,
  Checkbox,
  FormControl,
  FormLabel,
  FormGroup,
  ListItemIcon,
} from "@mui/material";
import "./Settings.css";
import { Sidebar } from "./Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import IpAddress from "../../Config/IpAddress";
import { LogoutOutlined } from "@mui/icons-material";
import { fetchWithAuth } from '../../Services/fetchHelper'

const Settings = () => {
  const location = useLocation();
  const { user } = location.state || {};
  const ip = IpAddress.ip;
  const navigate = useNavigate();
  const [showEmailFields, setShowEmailFields] = useState(false);
  const [showPhoneFields, setShowPhoneFields] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const [emailVerified, setEmailVerified] = useState(
    user.emailVerified || false
  );
  const [phoneVerified, setPhoneVerified] = useState(
    user.phoneVerified || false
  );
  const [imageSrc, setImageSrc] = useState("");
  const [verificationData, setVerificationData] = useState(null);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [twoStepVerification, setTwoStepVerification] = useState(false);
  const [otpFieldsVisible, setOtpFieldsVisible] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [otpReal, setOtpReal] = useState(["", "", "", "", "", ""]);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [update, setUpdate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [deleteAcc, setDeleteAcc] = useState(false);
  const [err, setErr] = useState("");

  const handleKeyDown = (e, index) => {
    const nextIndex = index + 1;
    const prevIndex = index - 1;

    if (e.key === "ArrowRight" && nextIndex < 6) {
      document.getElementById(`otp-input-${nextIndex}`).focus();
    } else if (e.key === "ArrowLeft" && prevIndex >= 0) {
      document.getElementById(`otp-input-${prevIndex}`).focus();
    } else if (e.key === "Backspace" && !otpValues[index] && prevIndex >= 0) {
      document.getElementById(`otp-input-${prevIndex}`).focus();
    }
  };

  const handleFocus = (e) => {
    e.target.setSelectionRange(0, 1);
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetchWithAuth(`${ip}/get-image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imagePath: user.imagePath }),
        });

        if (response.ok) {
          const imageBlob = await response.blob();
          const imageObjectURL = URL.createObjectURL(imageBlob);
          setImageSrc(imageObjectURL);
        } else {
          console.error("Failed to fetch image:", response.statusText);
          setErr("Failed to fetch image");
        }
      } catch (error) {
        console.error("Error fetching image:", error);
        setErr("Error fetching image");
      }
    };

    fetchImage();
  }, [ip, user.imagePath]);

  useEffect(() => {
    const fetchVerificationData = async () => {
      const url = `${ip}/verification`; // Replace with your actual backend endpoint

      try {
        const response = await fetchWithAuth(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }), // Ensure correct format
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setVerificationData(data);
        setEmailVerified(data.isEmailVerified);
      } catch (error) {
        console.error("Error fetching verification data:", error.message);
        // Handle error, e.g., show an error message to the user
      }
    };

    fetchVerificationData();
  }, [user.email]); // Dependency array, this useEffect will run when email changes

  const handleEmailVerifyClick = () => {
    setShowEmailFields(!showEmailFields); // Toggle visibility
    if (showPhoneFields) setShowPhoneFields(false); // Close other fields if open
    if (showPasswordFields) setShowPasswordFields(false);
    setOtpFieldsVisible(false); // Hide OTP fields
  };

  const handlePhoneVerifyClick = () => {
    setShowPhoneFields(!showPhoneFields); // Toggle visibility
    if (showEmailFields) setShowEmailFields(false); // Close other fields if open
    if (showPasswordFields) setShowPasswordFields(false);
    setOtpFieldsVisible(false); // Hide OTP fields
  };

  const handleResetPasswordClick = () => {
    setShowPasswordFields(!showPasswordFields); // Toggle visibility
    if (showEmailFields) setShowEmailFields(false); // Close other fields if open
    if (showPhoneFields) setShowPhoneFields(false);
    setOtpFieldsVisible(false); // Hide OTP fields
  };

  const updateEmailVerification = async (email) => {
    try {
      const response = await fetchWithAuth(`${ip}/verify/email/${email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(
          errorMessage.error || "Failed to update email verification status."
        );
      }

      const data = await response.json();
      alert(data.message); // Log success message
      setOtpFieldsVisible(false);
      setEmailVerified(true);
      // Optionally handle success actions
    } catch (error) {
      console.error("Error updating email verification:", error.message);
      // Handle error scenarios
    } finally {
      setLoading(false); // End loading
    }
  };

  const updatePhoneVerification = async (email) => {
    try {
      const response = await fetch(`/verify/phone/${email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(
          errorMessage.error ||
            "Failed to update phone number verification status."
        );
      }

      const data = await response.json();
      console.log(data.message); // Log success message
      // Optionally handle success actions
    } catch (error) {
      console.error("Error updating phone number verification:", error.message);
      // Handle error scenarios
    }
  };

  const sendOTP = async (email) => {
    setLoading(true);
    const url = `${ip}/send-otp`; // Replace with your actual backend endpoint

    try {
      const response = await fetchWithAuth(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // Sending email in the request body
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const otp = data.otp; // Assuming your response structure has an 'otp' field
      const otpGotten = otp.split(""); // Split OTP string into an array of characters
      setOtpReal(otp);
      alert("An OTP has been sent to your email");
      setOtpFieldsVisible(true);
      // Now you can set the values to the otpGotten const or use it further

      // Handle success, e.g., show a success message to the user
    } catch (error) {
      console.error("Error sending OTP:", error.message);
      // Handle error, e.g., show an error message to the user
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {}, [otpValues]);

  const updateEmail = async (oldEmail, newEmail) => {
    const url = `${ip}/update-email`; // Replace with your backend endpoint URL

    try {
      const response = await fetchWithAuth(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldEmail, newEmail }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      alert(data.message);
      setUpdate(false);
      setShowEmailFields(false);
      setOtpFieldsVisible(false);
      navigate("/");
      // Handle successful response here
    } catch (error) {
      console.error("Error updating email:", error);
      // Handle error here
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleDeleteAccount = () => {
    setDeleteAcc(true);
    setOtpFieldsVisible(true);
    sendOTP(user.email);
  };

  const changePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }
    setLoading(true);
    const url = `${ip}/change-password`; // Replace with your actual backend endpoint

    try {
      const response = await fetchWithAuth(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email, oldPassword, newPassword }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Error changing password:", error.message);
      setMessage("Error changing password");
    } finally {
      setLoading(false); // End loading
    }
  };

  const deleteAccount = async (email) => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${ip}/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.message); // Handle success message
      // Optionally handle any further actions after deletion
    } catch (error) {
      console.error("Error deleting account:", error.message);
      // Handle error cases
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleVerifyEmail = () => {
    // Add logic to verify email
    setEmailVerified(true); // Simulating verification, set to true
  };

  const handleVerifyPhoneNumber = () => {
    // Add logic to verify phone number
    setPhoneVerified(true); // Simulating verification, set to true
  };

  const handleUpdateEmail = () => {
    if (!newEmail) {
      alert("Fill in your new email");
      return;
    }
    setUpdate(true);
    setOtpFieldsVisible(true);
    sendOTP(user.email);
  };

  const handleEmailNotificationsChange = (event) => {
    setEmailNotifications(event.target.checked);
  };

  const handleTwoStepVerificationChange = (event) => {
    setTwoStepVerification(event.target.checked);
  };

  const handleOtpInputChange = (index, value) => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Move focus to the next input automatically
    if (index < 5 && value.length === 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }

    // if (index === 5 && value.length === 1) {
    //   const enteredOtp = newOtpValues.join("");

    //   if (enteredOtp === otpReal) {
    //     alert("Verifying......");
    //     updateEmailVerification(user.email);
    //   } else {
    //     alert("OTP Invalid");
    //   }
    // }
  };

  const handleVerifyOTP = () => {
    const enteredOtp = otpValues.join("");
    if (enteredOtp === otpReal) {
      setLoading(true);
      updateEmailVerification(user.email);
    } else {
      alert("OTP Invalid");
    }
  };

  const handleVerifyOTP2 = () => {
    const enteredOtp = otpValues.join("");
    if (enteredOtp === otpReal) {
      setLoading(true);
      updateEmail(user.email, newEmail);
    } else {
      alert("OTP Invalid");
    }
  };

  const handleVerifyOTP3 = () => {
    const enteredOtp = otpValues.join("");
    if (enteredOtp === otpReal) {
      alert("Verifying......");
      deleteAccount(user.email);
    } else {
      alert("OTP Invalid");
    }
  };

  return (
    <>
      <CssBaseline />
      <Box className="dashboard-container">
        {loading && (
          <div className="loading-overlay">
            <div className="backg">
              <div className="spinner"></div>
            </div>
          </div>
        )}
        <Sidebar
          data={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            nickname: user.nickname,
            contact: user.contact,
            imagePath: user.imagePath,
            BankName: user.BankName,
            BankAccountNo: user.BankAccountNo,
            BankAccountName: user.BankAccountName,
            BankCode: user.BankCode,
          }}
        />
        <Box className="settings-container" sx={{ alignItems: "center" }}>
          <Paper
            elevation={3}
            className="settings-paper"
            sx={{
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              color: "#311d00",
            }}
          >
            <Typography variant="h4" gutterBottom sx={{
                color: '#311d00'
            }}>
              Settings
            </Typography>
            {err && <p className="error-message">{err}</p>}

            <Typography variant="h6" gutterBottom>
              My Profile
            </Typography>
            {message && <p className="error-message">{message}</p>}
            <Divider />
            <Box className="profile-section" sx={{ padding: "30px" }}>
              <Avatar
                sx={{ alignItems: "center", width: "200px", height: "200px" }}
                alt="User Profile"
                src={imageSrc}
                className="profile-avatar"
              />
              <Box className="profile-inputs">
                <TextField
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  defaultValue={user.firstName + " " + user.lastName}
                  sx={{
                    borderColor: "white",
                    color: "white",
                    borderWidth: 2,
                  }}
                  disabled
                />
                <TextField
                  label="Nickname"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  defaultValue={user.nickname}
                  disabled
                />
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom>
              Account Security
            </Typography>
            <Divider />

            <Grid
              container
              spacing={2}
              justifyContent="center"
              sx={{ padding: "20px" }}
            >
              <Grid item>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleEmailVerifyClick}
                >
                  Verify Email
                </Button>
              </Grid>
              {/* <Grid item>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handlePhoneVerifyClick}
                >
                  Verify Phone Number
                </Button>
              </Grid> */}
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleResetPasswordClick}
                >
                  Reset Password
                </Button>
              </Grid>
            </Grid>

            {/* Verify Email Section */}
            {showEmailFields && (
              <Box
                className="settings-section"
                sx={{ paddingTop: "20px", display: "block", padding: 10 }}
              >
                <Typography variant="h6" gutterBottom sx={{
                    color: '#031d1a'
                }}>
                  Verify Email
                </Typography>
                <Divider />
                <Box
                  sx={{
                    display: { xs: "block", md: "flex" },
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    defaultValue={user.email}
                    disabled
                    sx={{ marginRight: 2 }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        icon={<Avatar sx={{ bgcolor: "red" }} />}
                        checkedIcon={<Avatar sx={{ bgcolor: "green" }} />}
                        checked={emailVerified}
                        disabled
                      />
                    }
                    label={!emailVerified ? "Not Verified" : "Verified"}
                  />
                </Box>
                {!update && (
                  <>
                    {!emailVerified && (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => sendOTP(user.email)}
                          sx={{ margin: 5 }}
                        >
                          Send OTP
                        </Button>
                      </>
                    )}

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setUpdate(true)}
                    >
                      Update Email
                    </Button>
                  </>
                )}

                {update && (
                  <Box
                    className="settings-section"
                    sx={{ display: "block", padding: 10 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        label="New Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        sx={{ marginRight: 2 }}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setUpdate(false)}
                      sx={{ margin: 5 }}
                    >
                      cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateEmail}
                    >
                      Confirm
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* Verify Phone Number Section */}
            {showPhoneFields && (
              <Box className="settings-section">
                <Typography variant="h6" gutterBottom>
                  Verify Phone Number
                </Typography>
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <TextField
                    label="Phone Number"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    defaultValue={user.contact}
                    disabled
                    sx={{ marginRight: 2 }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        icon={<Avatar sx={{ bgcolor: "red" }} />}
                        checkedIcon={<Avatar sx={{ bgcolor: "green" }} />}
                        checked={phoneVerified}
                        disabled
                      />
                    }
                    label="Status"
                  />
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  //   onClick={handleSendOTP}
                  sx={{ margin: 5 }}
                >
                  Send OTP
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateEmail}
                >
                  Update Phone
                </Button>
              </Box>
            )}

            {/* OTP Fields Section */}
            {otpFieldsVisible && (
              <>
                <div className="loading-overlay2">
                  <div
                    className="backg2"
                    style={{
                      backgroundColor: "#3a4d4b",
                      padding: "30px 30px 0",
                      borderRadius: "20px",
                      border: "2px solid white",
                      color: "white",
                    }}
                  >
                    <Box
                      className="otp-fields"
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "20px",
                        marginBottom: "40px",
                        color: "white",
                      }}
                    >
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <TextField
                          key={index}
                          id={`otp-input-${index}`}
                          variant="outlined"
                          size="small"
                          inputProps={{
                            maxLength: 1,
                            style: { textAlign: "center" },
                          }}
                          value={otpValues[index]}
                          onChange={(e) =>
                            handleOtpInputChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          onFocus={handleFocus}
                          sx={{
                            margin: "0 5px",
                            width: "50px",
                            border: "2px solid white ",
                            color: "white",
                          }}
                        />
                      ))}
                    </Box>
                    {!update && (
                      <Grid item>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={handleVerifyOTP}
                          sx={{ marginBottom: 10 }}
                        >
                          Verify OTP
                        </Button>
                      </Grid>
                    )}

                    {update && (
                      <Grid item>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={handleVerifyOTP2}
                          sx={{ marginBottom: 10 }}
                        >
                          Verify OTP
                        </Button>
                      </Grid>
                    )}

                    <Grid item>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setOtpFieldsVisible(false)}
                        sx={{ marginBottom: 10 }}
                      >
                        Discard
                      </Button>
                    </Grid>
                  </div>
                </div>
              </>
            )}

            {/* Reset Password Section */}
            {showPasswordFields && (
              <Box
                className="settings-section"
                sx={{ paddingTop: "20px", display: "block", padding: 10 }}
              >
                <Typography variant="h6" gutterBottom>
                  Reset Password
                </Typography>
                <Divider />
                <TextField
                  label="Current Password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={changePassword}
                  sx={{ margin: 5 }}
                >
                  Change
                </Button>
              </Box>
            )}

            {/* <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <Divider />
            <FormControlLabel
              control={
                <Switch
                  checked={emailNotifications}
                  onChange={handleEmailNotificationsChange}
                  color="primary"
                />
              }
              label="Enable Email Notifications for Transactions"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={twoStepVerification}
                  onChange={handleTwoStepVerificationChange}
                  color="primary"
                />
              }
              label="Enable Two-Step Verification"
            /> */}

            <Box
              className="settings-section"
              sx={{
                color: "#ff9800",
              }}
            ></Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default Settings;
