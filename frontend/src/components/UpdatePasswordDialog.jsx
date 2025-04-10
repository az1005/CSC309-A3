import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Snackbar,
    Alert,
} from "@mui/material";
import { useUser } from "../contexts/UserContext";
const UpdatePasswordDialog = ({ open, onClose }) => {
    const { user, updatePassword } = useUser();
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    // state for field-specific errors
    const [fieldErrors, setFieldErrors] = useState({});
    // state for success popup
    const [successMessageOpen, setSuccessMessageOpen] = useState(false);

    // populate form fields with current user data when available
    useEffect(() => {
        if (user) {
            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        // clear field errors on change
        setFieldErrors((prevErrors) => {
            if (name === 'oldPassword') {
                return {
                    ...prevErrors,
                    oldPassword: "",
                };
            }

            if (name === 'newPassword' || name === 'confirmPassword') {
                return {
                    ...prevErrors,
                    newPassword: "",
                    confirmPassword: "",
                };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        const errors = {};
        if (passwordData.confirmPassword !== passwordData.newPassword) {
            errors.confirmPassword = "Passwords do not match."
            errors.newPassword = "Passwords do not match."
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            await updatePassword(passwordData.oldPassword, passwordData.newPassword);
            // send success message on succesful update
            setSuccessMessageOpen(true);
            setTimeout(() => {
                setSuccessMessageOpen(false);
                onClose();
            }, 2000);
        } catch (err) {
            if (err.message.includes("Forbidden")) {
                errors.oldPassword = "Incorrect old password.";
                setFieldErrors(errors);
            } else if (err.message.includes("format")) {
                errors.confirmPassword = "Incorrect password format.";
                errors.newPassword = "Incorrect password format.";
                setFieldErrors(errors);
            }
        }
    };

    return (<>
        <Dialog open={open} onClose={onClose} maxWidth="sm">
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <Grid container direction="column" spacing={2} sx={{ mt: 1 }}>
                        <Grid item>
                            <TextField
                                fullWidth
                                label="Old Password"
                                name="oldPassword"
                                type="password"
                                value={passwordData.oldPassword}
                                onChange={handleChange}
                                variant="outlined"
                                error={Boolean(fieldErrors.oldPassword)}
                                helperText={fieldErrors.oldPassword}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                fullWidth
                                label="New Password"
                                name="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={handleChange}
                                variant="outlined"
                                error={Boolean(fieldErrors.newPassword)}
                                helperText={fieldErrors.newPassword}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={handleChange}
                                variant="outlined"
                                error={Boolean(fieldErrors.confirmPassword)}
                                helperText={fieldErrors.confirmPassword}
                            />
                        </Grid>
                    </Grid>
                    <DialogActions sx={{ px: 0, mt: 0, justifyContent: "center" }}>
                        <Button variant="outlined" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="contained" sx={{bgcolor:"#4a4e69"}}>
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
        <Snackbar
            open={successMessageOpen}
            autoHideDuration={2000}
            onClose={() => {setSuccessMessageOpen(false)}}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            <Alert severity="success" onClose={() => setSuccessMessageOpen(false)}>
                Password updated successfully!
            </Alert>
        </Snackbar>
    </>
    );
};

export default UpdatePasswordDialog;