import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Typography,
    Box,
} from "@mui/material";
import { useEvent } from "../contexts/EventContext";

const UpdateEventDialog = ({ open, onClose }) => {
    const { updateMessage, setUpdateMessage, updateEvent,
        singleEvent, statusChange, setStatusChange } = useEvent();

    const [updateData, setUpdateData] = useState({
        name: singleEvent?.name || "",
        description: singleEvent?.description || "",
        location: singleEvent?.location || "",
        startTime: singleEvent?.startTime || "",
        endTime: singleEvent?.endTime || "",
        capacity: singleEvent?.capacity || null
    });

    // state for field-specific errors
    const [fieldErrors, setFieldErrors] = useState({});

    // refresh local state when the user prop changes 
    // e.g. dialog is opened for a new user:
    useEffect(() => {
        if (singleEvent) {
            setUpdateData({
                name: singleEvent.name || "",
                description: singleEvent.description || "",
                location: singleEvent.location || "",
                startTime: singleEvent.startTime ? singleEvent.startTime.substring(0, 16) : "",
                endTime: singleEvent.endTime ? singleEvent.endTime.substring(0, 16) : "",
                capacity: singleEvent.capacity || null,
            });
        }
    }, [singleEvent]);

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setUpdateData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
        setFieldErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        // create a new object where empty strings are converted to undefined
        // and special case where published: false should be interpreted as 
        // undefined and empty capacity is null
        const cleanedData = Object.fromEntries(
            Object.entries(updateData).map(([key, value]) => [
                key,
                key === "published" ? (value ? true : undefined)
                    : (value === "" ? undefined : value),
            ])
        );

        const errors = {};
        if (!cleanedData.name) errors.name = "Name is cannot be blank.";
        if (!cleanedData.location) errors.location = "Must have location.";
        // add others if needed
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            await updateEvent(singleEvent.id, cleanedData);
            // toggle the statusChange to let eventcontext know to update the singleEvent right away
            setStatusChange(!statusChange);
            onClose();
        } catch (err) {
            setUpdateMessage(err.message);
            console.log(err);
        }
    };


    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Event: {singleEvent?.id}</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        {/* Two column fields */}
                        <Grid>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={updateData.name}
                                onChange={handleChange}
                                variant="outlined"
                                error={Boolean(fieldErrors.name)}
                                helperText={fieldErrors.name}
                            />
                        </Grid>
                        <Grid>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={updateData.description}
                                onChange={handleChange}
                                variant="outlined"
                                error={Boolean(fieldErrors.description)}
                                helperText={fieldErrors.description}
                            />
                        </Grid>
                        <Grid>
                            <TextField
                                fullWidth
                                label="Location"
                                name="location"
                                value={updateData.location}
                                onChange={handleChange}
                                variant="outlined"
                                error={Boolean(fieldErrors.location)}
                                helperText={fieldErrors.location}
                            />
                        </Grid>
                        <Grid>
                            <TextField
                                fullWidth
                                label="Start Time"
                                name="startTime"
                                type="datetime-local"
                                value={updateData.startTime}
                                onChange={handleChange}
                                variant="outlined"
                                slotProps={{ inputLabel: { shrink: true } }}
                                error={Boolean(fieldErrors.startTime)}
                                helperText={fieldErrors.startTime}
                            />
                        </Grid>
                        <Grid>
                            <TextField
                                fullWidth
                                label="End Time"
                                name="endTime"
                                type="datetime-local"
                                value={updateData.endTime}
                                onChange={handleChange}
                                variant="outlined"
                                slotProps={{ inputLabel: { shrink: true } }}
                                error={Boolean(fieldErrors.endTime)}
                                helperText={fieldErrors.endTime}
                            />
                        </Grid>
                        <Grid>
                            <TextField
                                fullWidth
                                label="Capacity"
                                name="capacity"
                                type="number"
                                value={updateData.capacity}
                                onChange={handleChange}
                                variant="outlined"
                                error={Boolean(fieldErrors.capacity)}
                                helperText={fieldErrors.capacity}
                            />
                        </Grid>

                        {/* for alignment, leave the other half empty*/}
                        <Grid></Grid>

                        {/* full width for actions */}
                        <Grid>
                            <DialogActions sx={{ justifyContent: "center" }}>
                                <Button variant="outlined" onClick={onClose}>Cancel</Button>
                                <Button onClick={handleSubmit} variant="contained" sx={{bgcolor:"#4a4e69"}}>
                                    Save
                                </Button>
                            </DialogActions>
                        </Grid>

                        {/* full width for update message */}
                        <Grid>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    pt: "10px",
                                }}
                            >
                                {updateMessage && (
                                    <Typography variant="body2" color="error">
                                        {updateMessage}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
        </Dialog>
    );
}
export default UpdateEventDialog;
