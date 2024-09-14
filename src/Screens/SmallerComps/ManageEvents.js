import React, { useState, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Paper,
  Card,
  CardContent,
  Button,
  Typography,
  Fab,
  Divider,
  TextField,
  useMediaQuery 
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Sidebar } from "./Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import "./ManageEvents.css";
import IpAddress from "../../Config/IpAddress";
import { EventBusyOutlined, GolfCourseOutlined, Search } from "@mui/icons-material";
import { fetchWithAuth } from '../../Services/fetchHelper'

const ManageEvents = () => {
  const location = useLocation();
  const { user } = location.state || {};
  const ip = IpAddress.ip;
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetchWithAuth(`${ip}/myevents`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userEmail: user.email }),
        });
        const data = await response.json();
        setEvents(data.events || []);
        setFilteredEvents(data.events || []); // Initialize filtered events
      } catch (error) {
        console.error("Error fetching events:", error);
        setErr("Failed to load events");
        setEvents([]); // Ensure events is set to an empty array on error
      }
    };

    fetchEvents();
  }, [ip, user.email]);

  const fetchImage = async (imagePath) => {
    try {
      const response = await fetchWithAuth(`${ip}/get-image2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imagePath }),
      });

      if (response.ok) {
        const imageBlob = await response.blob();
        setErr("");
        return URL.createObjectURL(imageBlob);
      } else {
        console.error("Failed to fetch image:", response.statusText);
        setErr("Failed to fetch image");
        return null;
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      setErr("Error fetching image");
      return null;
    }
  };

  useEffect(() => {
    const results = events.filter((event) =>
      event.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(results);
  }, [searchTerm, events]);

  return (
    <>
      <CssBaseline />
      <Box className="dashboard-container">
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
        <Box className="manage-events-container">
          <Paper
            elevation={3}
            className="manage-events-paper"
            align="center"
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.4)",
            }}
          >
            <Box
            className= "moduleHolder"
            >
              <Typography
                variant="h4"
                gutterBottom
                align="center"
                sx={{ color: "#031d1a" }}
              >
                My Modules
              </Typography>
              <Box
                sx={{
                  marginBottom: 2,
                  borderRadius: 1,
                  zIndex: 10,
                  width: {xs: "100%", md: "30%"},
                  height: "100px",
                  position: {xs: "relative", md: "absolute"},
                  top: 0,
                  right: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Search
                  sx={{
                    color: "#031d1a",
                  }}
                />
                <input
                  placeholder="Search by course title"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    height: "50px",
                    borderRadius: "20px",
                    fontSize: '20px'
                  }}
                />
              </Box>
            </Box>
            {err && <p className="error-message">{err}</p>}
            <Divider />
            <Box
              className="events-grid"
              sx={{
                marginTop: "20px",
              }}
            >
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    fetchImage={fetchImage}
                    navigate={navigate}
                  />
                ))
              ) : (
                <Typography variant="body1" align="center">
                 <GolfCourseOutlined
                        sx={{
                          fontSize: "150px",
                          color: "#ff990059",
                          marginTop: "20px",
                        }}
                      />
                </Typography>
              )}
            </Box>
            <button
              onClick={() =>
                navigate("/createevent", { state: { user: user } })
              }
              color="primary"
              aria-label="add"
              className="add-event-button"
              sx={{
                position: "fixed",
                bottom: 16,
                right: 16,
                backgroundColor: "#4caf50",
                color: "white",
                width: "300px",
              }}
            >
              Create New event <AddIcon />
            </button>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

const EventCard = ({ event, fetchImage, navigate }) => {
  const [imageSrc, setImageSrc] = useState(null);

  // Define media queries
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  useEffect(() => {
    if (event.coverPhoto) {
      const loadImage = async () => {
        const src = await fetchImage(event.coverPhoto);
        setImageSrc(src);
      };
      loadImage();
    }
  }, [event.coverPhoto, fetchImage]);

  return (
    <Card
      className="event-card"
      sx={{
        backgroundColor: "white",
        borderRadius: "23px",
        overflow: "hidden",
        width: isSmallScreen ? "100%" : isMediumScreen ? "70%" : "45%", // Adjust card width based on screen size
        margin: "10px auto", // Center card with margin
        height: isSmallScreen ? "200px" :"150px", // Fixed height for the card
      }}
    >
      <Box
        className="event-card-content"
        sx={{
          position: "relative", // Positioning for overlay
          height: "100%", // Ensure it covers the full height
          overflow: "hidden",
        }}
      >
        {imageSrc && (
          <Box
            className="event-image"
            sx={{
              backgroundImage: `url(${imageSrc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "100%", // Ensure it covers the full height
              width: "100%", // Ensure it covers the full width
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        )}
        <Box
          className="event-details-overlay"
          sx={{
            backgroundColor: "rgba(49, 29, 0, 0.7)", // Transparent background color
            color: "white", // Text color
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%", // Ensure it covers the full height
            width: "100%", // Ensure it covers the full width
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "10px",
          }}
        >
          <CardContent className="event-details" sx={{ padding: "0" }}>
            <Typography
              variant="h6"
              sx={{ fontSize: isSmallScreen ? "16px" : "20px", textTransform: "capitalize" }} // Adjust font size based on screen size
            >
              {event.courseTitle}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: isSmallScreen ? "11px" : "13px" }}>
              Creator: {event.creator}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: isSmallScreen ? "11px" : "13px" }}>
              Course ID: {event.id}
            </Typography>
          </CardContent>
          <button
            // className="view-details-button"
            onClick={() =>
              navigate("/eventdetails", {
                state: { event: event, fetchImage: fetchImage },
              })
            }
            style={{
              color: "white",
              padding: isSmallScreen ? "8px" : "12px", // Adjust padding based on screen size
              fontSize: isSmallScreen ? "12px" : "14px", // Adjust font size based on screen size
              marginTop: "10px",
              alignSelf: "flex-start",
              zIndex: 200, 
              position: isSmallScreen ? "absolute" : "relative",
              left: '35%',
              bottom: 10
            }}
          >
            View Details
          </button>
        </Box>
      </Box>
    </Card>
  );
};

export { ManageEvents };
