import { useState } from "react";
import { Box, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useEvent } from "../contexts/EventContext";

const CreateEventModal = () => {
    const { createMessage, setCreateMessage, addEvent } = useEvent();

    const [eventData, setEventData] = useState({
        name: "",
        description: "",
        location: "",
        startTime: "",
        endTime: "",
        capacity: "",
        points: ""
    });

    const handleFormChange = (e) => {
        setCreateMessage(null);
        setEventData({
            ...eventData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        try {
            addEvent(eventData);
        } catch(err) {
            setCreateMessage(err);
        }
    };

    return (
        <Box className="box" sx = {{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 450,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        }}>
            <form id="transactionForm" onSubmit={handleFormSubmit}>
                <label htmlFor="name">Name:</label>
                <TextField 
                    type="text"
                    id="name"
                    name="name"
                    label="Name"
                    variant="outlined"
                    value={eventData.name}
                    onChange={handleFormChange}
                    required
                />
                <label htmlFor="description">Description:</label>
                <TextField
                    type="text"
                    id="description"
                    name="description"
                    label="Description"
                    variant="outlined"
                    value={eventData.description}
                    onChange={handleFormChange}
                    required
                />
                <label htmlFor="location">Location:</label>
                <TextField
                    type="text"
                    id="location"
                    name="location"
                    label="Location"
                    variant="outlined"
                    value={eventData.location}
                    onChange={handleFormChange}
                    required
                />
                <label htmlFor="startTime">Start Time:</label>
                <TextField
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={eventData.startTime}
                    onChange={handleFormChange}
                    required
                />
                <label htmlFor="endTime">End Time:</label>
                <TextField
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={eventData.endTime}
                    onChange={handleFormChange}
                    required
                />
                <label htmlFor="capacity">Capacity:</label>
                <TextField
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={eventData.capacity}
                    onChange={handleFormChange}
                />
                <label htmlFor="points">Points:</label>
                <TextField
                    type="number"
                    id="points"
                    name="points"
                    value={eventData.points}
                    onChange={handleFormChange}
                    required
                />
                <div className="btn-container">
                    <input type="submit"/>
                </div>
            </form>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: "10px"}}>
                {createMessage && <p style={{ textAlign: "center",
                    color: createMessage === "Success!" ? "green" : "red"
                }}>{createMessage}</p>}
            </div>
        </Box>
    );
}

export default CreateEventModal;