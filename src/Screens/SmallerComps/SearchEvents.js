import React, { useState } from "react";
import { TextField, List, ListItem, ListItemText, Box } from "@mui/material";
import "./SearchEvents.css";

const SearchEvents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const events = [
    { name: "Event 1", date: "2023-07-01" },
    { name: "Event 2", date: "2023-07-02" },
  ];

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box className="search-events-container">
      <TextField
        label="Search Events"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        margin="normal"
      />
      <List>
        {filteredEvents.map((event, index) => (
          <ListItem key={index}>
            <ListItemText primary={event.name} secondary={event.date} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export { SearchEvents };
