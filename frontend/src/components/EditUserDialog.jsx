import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Grid,
    FormHelperText,
} from "@mui/material";
import { useUser } from "../contexts/UserContext";

const EditUserDialog = ({ open, onClose }) => {
    const { updateUserStatus, currentInterface,
        singleUser, statusChange, setStatusChange } = useUser();

    const [updateData, setUpdateData] = useState({
        email: singleUser?.email || "",
        verified: singleUser?.verified || false,
        suspicious: singleUser?.suspicious || false,
        role: singleUser?.role || "regular"
    });

    // state for field-specific errors
    const [fieldErrors, setFieldErrors] = useState({});

    // refresh local state when the user prop changes 
    // e.g. dialog is opened for a new user:
    useEffect(() => {
        if (singleUser) {
            setUpdateData({
                email: singleUser.email || "",
                verified: singleUser.verified || false,
                suspicious: singleUser.suspicious || false,
                role: singleUser.role || "regular"
            });
        }
    }, [singleUser]);

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
        const cleanedData = Object.fromEntries(
            Object.entries(updateData).map(([key, value]) => [
                key,
                value === "" ? undefined : value,
            ])
        );

        const errors = {};
        if (!cleanedData.email || !cleanedData.email.endsWith('utoronto.ca')) {
            errors.email = "Must be a utoronto.ca email.";
        }
        if (!cleanedData.verified || cleanedData.verified === undefined) {
            errors.verified = "Must verify";
        }
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            await updateUserStatus(singleUser.id, updateData);
            // toggle the statusChange to let usercontext know to update the singleUser right away
            setStatusChange(!statusChange);
            onClose();
        } catch (err) {
            if (err.message.includes("email")) {
                errors.email = "User with this email already exists."
                setFieldErrors(errors);
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm">
            <DialogTitle>Edit User: {singleUser?.utorid}</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <Grid container direction="column" spacing={2} sx={{ mt: 2 }}>
                        <Grid>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={updateData.email}
                                onChange={handleChange}
                                variant="outlined"
                                error={Boolean(fieldErrors.email)}
                                helperText={fieldErrors.email}
                            />
                        </Grid>
                        <Grid>
                            <FormControl error={Boolean(fieldErrors.verified)}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="verified"
                                            checked={updateData.verified}
                                            onChange={handleChange}
                                            disabled={updateData.verified}
                                        />
                                    }
                                    label="Verified"
                                />
                                {fieldErrors.verified && (
                                    <FormHelperText>{fieldErrors.verified}</FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={updateData.suspicious}
                                        name="suspicious"
                                        onChange={handleChange}
                                    />
                                }
                                label="Suspicious"
                            />
                        </Grid>
                        <Grid>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={updateData.role}
                                    name="role"
                                    label="Role"
                                    labelId="role-label"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="regular">Regular</MenuItem>
                                    <MenuItem value="cashier">Cashier</MenuItem>
                                    {currentInterface === 'superuser'
                                        ? [
                                            <MenuItem key="manager" value="manager">Manager</MenuItem>,
                                            <MenuItem key="superuser" value="superuser">Superuser</MenuItem>
                                        ]
                                        : null}
                                </Select>
                            </FormControl>
                        </Grid>
                        <DialogActions sx={{ px: 0, mt: 0, justifyContent: "center" }} >
                            <Button variant="outlined" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleSubmit} variant="contained" sx={{bgcolor:"#4a4e69"}}>
                                Save
                            </Button>
                        </DialogActions>
                    </Grid>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditUserDialog;
