import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    ToggleButtonGroup,
    ToggleButton,
    TextField,
    Typography
} from '@mui/material';
import { useEvent } from '../contexts/EventContext';

const ManageGuestDialog = ({ open, onClose }) => {
    const { singleEvent, addGuest, deleteGuest, statusChange, setStatusChange } = useEvent();
    const [action, setAction] = useState('add');
    const [guest, setGuest] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleConfirm = async () => {
        setError('');
        setSuccessMessage('');

        if (!guest.trim()) {
            setError('Please enter a valid id.');
            return;
        }

        try {
            if (action === 'add') {
                await addGuest(guest.trim(), singleEvent.id);
                setSuccessMessage(`Guest ${guest.trim()} added.`);
            } else {
                await deleteGuest(guest.trim(), singleEvent.id);
                setSuccessMessage(`User ${guest.trim()} removed.`);
            }
            setStatusChange(!statusChange);
            setGuest('');
        } catch (err) {
            setError(err.message || 'Something went wrong.');
        }
    };

    const handleClose = () => {
        setGuest('');
        setError('');
        setSuccessMessage('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>Manage Guests</DialogTitle>
            <DialogContent dividers>
                <ToggleButtonGroup
                    value={action}
                    exclusive
                    onChange={(e, newAction) => newAction && setAction(newAction)}
                    fullWidth
                    sx={{ mb: 2 }}
                >
                    <ToggleButton value="add">Add</ToggleButton>
                    <ToggleButton value="delete">Delete</ToggleButton>
                </ToggleButtonGroup>

                <TextField
                    label={action === "add" ? "UTORid" : "User ID"}
                    type={action === "add" ? "text" : "number"}
                    fullWidth
                    value={guest}
                    placeholder={action === "add" ? "UTORid" : "User ID"}
                    onChange={(e) => setGuest(e.target.value)}
                    error={Boolean(error)}
                    helperText={error || ' '}
                />

                {successMessage && (
                    <Typography variant="body2" color="success.main">
                        {successMessage}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                <Button variant="contained" sx={{bgcolor:"#4a4e69"}} onClick={handleConfirm}>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ManageGuestDialog;
