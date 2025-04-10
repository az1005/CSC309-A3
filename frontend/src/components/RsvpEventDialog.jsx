import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useEvent } from "../contexts/EventContext";
import { useAuth } from "../contexts/AuthContext";

const RsvpEventDialog = ({ open, onClose }) => {
    const { singleEvent, addSelfToEvent, removeSelfFromEvent, error, setError, statusChange, setStatusChange } = useEvent();
    const { user, fetchUser } = useAuth();
    const isGuest = user?.eventsAsGuest?.some((e) => e.id === singleEvent.id);
    const rsvp = !isGuest;

    const handleConfirm = async () => {
        setError(null);
        try {
            if (rsvp) {
                await addSelfToEvent(singleEvent.id);
            } else {
                await removeSelfFromEvent(singleEvent.id);
            }
            // call fetch user to signal that the current user's info has been updated
            fetchUser();
            setStatusChange(!statusChange);
            onClose(); // close the dialog on success
        } catch (err) {
            setError(err.message);
            console.error(err);
            // onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {rsvp ? "RSVP" : "Cancel RSVP"}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="body1">
                    {rsvp
                        ? `RSVP for event "${singleEvent?.name}"?`
                        : `Cancel your RSVP for event "${singleEvent?.name}"?`
                    }
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center" }}>
                <Button variant="outlined" onClick={onClose}>Cancel</Button>
                <Button onClick={handleConfirm} variant="contained" sx={{bgcolor:"#4a4e69"}}>
                    {rsvp ? "Confirm RSVP" : "Remove RSVP"}
                </Button>
            </DialogActions>
            <div style={{display: "flex", justifyContent: "center"}}>
                <Typography sx={{textAlign: "center"}} variant="body2" color="error">{error}</Typography>
            </div>
        </Dialog>
    );
};



export default RsvpEventDialog;