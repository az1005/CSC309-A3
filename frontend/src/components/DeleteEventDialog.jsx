// src/components/DeleteEventDialog.jsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEvent } from '../contexts/EventContext';
import { useNavigate } from 'react-router-dom';

const DeleteEventDialog = ({ open, onClose }) => {
    const { deleteEvent, singleEvent } = useEvent();
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            await deleteEvent(singleEvent.id);
            onClose();
            navigate("/event");
        } catch (err) {
            console.error(err);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                Delete Event
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
                    Are you sure you want to delete event "{singleEvent?.name}"? This action is irreversible.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button variant="outlined" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="outlined" color="error" onClick={handleDelete}>
                    Confirm Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteEventDialog;
