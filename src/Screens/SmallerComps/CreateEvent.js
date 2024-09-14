import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  CssBaseline,
  MenuItem,
  Grid,
  Typography,
  Paper,
  LinearProgress,
} from "@mui/material";
import Calendar from "react-calendar";
import { Sidebar } from "./Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreateEvent.css";
import IpAddress from "../../Config/IpAddress";
import { fetchWithAuth } from '../../Services/fetchHelper'

const categories = ["Technology", "Science", "Mathematics", "Arts", "Business"];

const CreateEvent = () => {
  const location = useLocation();
  const { user } = location.state || {};
  const ip = IpAddress.ip;
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [eventDate, setEventDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [classSchedule, setClassSchedule] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [courseFee, setCourseFee] = useState("");
  const [maxEnrolment, setMaxEnrolment] = useState("");
  const [joiningDeadline, setJoiningDeadline] = useState(new Date());
  const [extraNotes, setExtraNotes] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const [emailVerified, setEmailVerified] = useState(
    user.emailVerified || false
  );
  const [verificationData, setVerificationData] = useState(null);
  const [currentSection, setCurrentSection] = useState(1);

  const totalSections = 4;
  const progress = (currentSection / totalSections) * 100;

  const validateCurrentSection = () => {
    switch (currentSection) {
      case 1:
        return (
          courseTitle &&
          whatsappLink &&
          courseDescription &&
          courseCategory &&
          courseDuration
        );
      case 2:
        return eventDate && endDate;
      case 3:
        return classSchedule && prerequisites && coverPhoto && courseFee;
      case 4:
        return maxEnrolment && joiningDeadline && extraNotes;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentSection()) {
      setErr("");
      setCurrentSection(currentSection + 1);
    } else {
      setErr("Please fill in all required fields.");
    }
  };

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

  const handleFileChange = (e) => {
    setCoverPhoto(e.target.files[0]);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (
      !courseTitle ||
      !whatsappLink ||
      !courseDescription ||
      !courseCategory ||
      !courseDuration ||
      !classSchedule ||
      !prerequisites ||
      !coverPhoto ||
      !courseFee ||
      !maxEnrolment ||
      !joiningDeadline
    ) {
      setErr("Please fill in all required fields.");
      return;
    }

    if (!emailVerified) {
      setErr("Please Verify Your Email First Before Creating A Module.");
      alert("Please Verify Your Email First Before Creating A Module.");
      return;
    }

    if (courseFee !== "free" && courseFee !== "none") {
      if (
        user.BankAccountNo === "None" ||
        user.BankAccountName === "None" ||
        user.BankName === "None"
      ) {
        setErr(
          "No Payment Info. \n Create a payment mode to create a new class. \n You can do this in the payment information tab."
        );
        return;
      }
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("creator", `${user.firstName} ${user.lastName}`);
      formData.append("creatorEmail", user.email);
      formData.append("courseTitle", courseTitle);
      formData.append("eventDate", eventDate.toISOString());
      formData.append("whatsappLink", whatsappLink);
      formData.append("courseDescription", courseDescription);
      formData.append("courseCategory", courseCategory);
      formData.append("courseDuration", courseDuration);
      formData.append("endDate", endDate.toISOString());
      formData.append("classSchedule", classSchedule);
      formData.append("prerequisites", prerequisites);
      formData.append("coverPhoto", coverPhoto);
      formData.append("courseFee", courseFee);
      formData.append("maxEnrolment", maxEnrolment);
      formData.append("joiningDeadline", joiningDeadline.toISOString());
      formData.append("extraNotes", extraNotes);

      // Add bank details to the formData
      formData.append("bankName", user.BankName);
      formData.append("bankCode", user.BankCode);
      formData.append("bankAccountNo", user.BankAccountNo);
      formData.append("bankAccountName", user.BankAccountName);

      const response = await fetchWithAuth(`${ip}/events`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert("Event Created:", data);
        navigate("/manageevent", { state: { user: user } });
      } else {
        alert("Creation failed:", data);
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Course Title"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{ style: { color: "#1e1e1e" } }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Group Link"
                value={whatsappLink}
                onChange={(e) => setWhatsappLink(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{ style: { color: "#1e1e1e" } }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Course Description"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
                InputLabelProps={{ style: { color: "#1e1e1e" } }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Course Category"
                select
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{ style: { color: "#1e1e1e" } }}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Course Duration"
                value={courseDuration}
                onChange={(e) => setCourseDuration(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{ style: { color: "#1e1e1e" } }}
                required
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  backgroundColor: "transparent",
                  padding: 0,
                  borderRadius: 1,
                  marginBottom: 2,
                  zIndex: "400",
                }}
              >
                <Typography variant="h6">Start Date</Typography>
                <Calendar
                  value={eventDate}
                  onChange={setEventDate}
                  className="react-calendar"
                />
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    color: "white",
                  }}
                >
                  Selected Start Date: {eventDate.toDateString()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  backgroundColor: "transparent",
                  padding: 0,
                  borderRadius: 1,
                  marginBottom: 2,
                }}
              >
                <Typography variant="h6">End Date</Typography>
                <Calendar
                  value={endDate}
                  onChange={setEndDate}
                  className="react-calendar"
                />
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    color: "white",
                  }}
                >
                  Selected End Date: {endDate.toDateString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Class Schedule"
                value={classSchedule}
                onChange={(e) => setClassSchedule(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{ style: { color: "#1e1e1e" } }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Prerequisites"
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{ style: { color: "#1e1e1e" } }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{
                color: '#311d00'
              }}>Upload cover photo</Typography>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="coverPhoto"
                style={{
                  marginTop: "16px",
                  marginBottom: "8px",
                  zIndex: 10,
                  borderWidth: 2,
                  borderColor: "#273532",
                  height: "auto",
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                type="number"
                label="Course Fee"
                value={courseFee}
                onChange={(e) => setCourseFee(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{ style: { color: "#1e1e1e" } }}
                required
              />
            </Grid>
          </Grid>
        );
      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Maximum Enrolment Limit"
                value={maxEnrolment}
                onChange={(e) => setMaxEnrolment(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{ style: { color: "#1e1e1e" } }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Joining Deadline"
                type="date"
                value={joiningDeadline.toISOString().substr(0, 10)}
                onChange={(e) => setJoiningDeadline(new Date(e.target.value))}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                  style: { color: "#1e1e1e" },
                }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Extra Notes"
                value={extraNotes}
                onChange={(e) => setExtraNotes(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
                InputLabelProps={{ style: { color: "#1e1e1e" } }}
                required
              />
            </Grid>
            <Grid item lg={12}>
              <Button
                onClick={handleCreateEvent}
                sx={{
                  borderWidth: 2,
                  borderColor: "#311d00 !important",
                  color: "white",
                  zIndex: 200,
                  cursor: 'pointer'
                }}
                className="createEventbtn"
              >
                Create Event
              </Button>
            </Grid>
          </Grid>
        );
      default:
        return null;
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
        <Box className="create-event-container">
          <Paper
            elevation={3}
            sx={{ padding: 4, borderRadius: 2, boxShadow: 0 , color: '#031d1a'}}
          >
            <Box sx={{ width: "100%", marginBottom: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  "& .MuiLinearProgress-barColorPrimary": {
                    backgroundColor: "#ff9900", // Change this to your desired color
                  },
                  backgroundColor: "#e0e0e0", // Change this to the track color if needed
                }}
              />
            </Box>
            <h2 variant="h4"  align="center" style={{
              color: '#031d1a'
            }}>
              Create Module
            </h2>
            <h5
              variant="h6"
              gutterBottom
              align="center"
              style={{
                fontSize: "15px",
                color: '#031d1a'
              }}
            >
              NB: Please make sure your email is verified and your payment
              details are dully updated
            </h5>
            {err && <p className="error-message">{err}</p>}
            {renderSection()}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 3,
              }}
            >
              {currentSection > 1 && (
                <button
                  onClick={() => setCurrentSection(currentSection - 1)}
                  className="nextButton"
                >
                  Previous
                </button>
              )}
              {currentSection < 4 && (
                <button
                  variant="contained"
                  onClick={handleNext}
                  className="nextButton"
                  style={{
                    position: { xs: "relative", md: "absolute" },
                    right: { xs: "0", md: 70 },
                    color: "white",
                    backgroundColor: '#311d00'
                  }}
                >
                  Next
                </button>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export { CreateEvent };
