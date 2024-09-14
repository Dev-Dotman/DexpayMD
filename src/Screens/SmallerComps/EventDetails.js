import React, { useState, useEffect } from "react";
import { Box, CssBaseline, Paper, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import "./EventDetails.css";
import IpAddress from "../../Config/IpAddress";
import { fetchWithAuth } from '../../Services/fetchHelper'

const EventDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { event, fetchImage } = location.state || {};
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (event.coverPhoto) {
      const loadImage = async () => {
        const src = await fetchImage(event.coverPhoto);
        setImageSrc(src);
      };
      loadImage();
    }
  }, [event.coverPhoto, fetchImage]);

  if (!event) {
    return <Typography variant="h6">Event not found</Typography>;
  }

  const ip = IpAddress.ip; // replace with your backend IP address

  return (
    <>
      <CssBaseline />
      <Box className="event-details-background">
        <Paper elevation={3} className="event-details-paper">
          <Button
            variant="contained"
            color="info"
            onClick={() => navigate(-1)}
            className="back-button"
          >
            Back to modules
          </Button>
          <Box className="event-image-container">
            <img
              src={imageSrc}
              alt="Event"
              className="event-cover-photo"
            />
          </Box>
          <Typography variant="h4" gutterBottom align="center">
            {event.courseTitle}
          </Typography>
          <Box className="event-dates-container">
            <Box className="event-date">
              <Typography variant="body2" className="event-date-label">
                Start Date
              </Typography>
              <Typography variant="body1" className="event-date-day">
                {new Date(event.eventDate).toLocaleDateString("en-US", {
                  day: "numeric",
                })}
              </Typography>
              <Typography variant="body2" className="event-date-month">
                {new Date(event.eventDate)
                  .toLocaleDateString("en-US", {
                    month: "short",
                  })
                  .toUpperCase()}
              </Typography>
            </Box>
            <Box className="event-date">
              <Typography variant="body2" className="event-date-label">
                End Date
              </Typography>
              <Typography variant="body1" className="event-date-day">
                {new Date(event.endDate).toLocaleDateString("en-US", {
                  day: "numeric",
                })}
              </Typography>
              <Typography variant="body2" className="event-date-month">
                {new Date(event.endDate)
                  .toLocaleDateString("en-US", {
                    month: "short",
                  })
                  .toUpperCase()}
              </Typography>
            </Box>
          </Box>
          <Box className="event-info">
            <table className="event-info-table">
              <tbody>
                <tr>
                  <td>
                    <strong>Creator:</strong>
                  </td>
                  <td>{event.creator}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Email:</strong>
                  </td>
                  <td>{event.creatorEmail}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Category:</strong>
                  </td>
                  <td>{event.courseCategory}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Duration:</strong>
                  </td>
                  <td>{event.courseDuration}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Class Schedule:</strong>
                  </td>
                  <td>{event.classSchedule}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Prerequisites:</strong>
                  </td>
                  <td>{event.prerequisites}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Description:</strong>
                  </td>
                  <td>{event.courseDescription}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Course Fee:</strong>
                  </td>
                  <td>{event.courseFee}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Max Enrollment:</strong>
                  </td>
                  <td>{event.maxEnrolment}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Joining Deadline:</strong>
                  </td>
                  <td>
                    {new Date(event.joiningDeadline)
                      .toLocaleDateString("en-US")
                      .toUpperCase()}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Extra Notes:</strong>
                  </td>
                  <td>{event.extraNotes}</td>
                </tr>
                <tr>
                  <td>
                    <strong>WhatsApp Link:</strong>
                  </td>
                  <td>
                    <a
                      href={event.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {event.whatsappLink}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Bank Name:</strong>
                  </td>
                  <td>{event.bankName}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Bank Code:</strong>
                  </td>
                  <td>{event.bankCode}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Bank Account No:</strong>
                  </td>
                  <td>{event.bankAccountNo}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Bank Account Name:</strong>
                  </td>
                  <td>{event.bankAccountName}</td>
                </tr>
              </tbody>
            </table>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default EventDetails;
