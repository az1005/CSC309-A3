import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Avatar,
    Box
} from "@mui/material";
import { useUser } from "../contexts/UserContext";
const EditProfileDialog = ({ open, onClose, avatarSrc }) => {
    const { user, updateProfile } = useUser();
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        birthday: "",
        avatar: null,
    });
    // state for field-specific errors
    const [fieldErrors, setFieldErrors] = useState({});
    const [avatarPreview, setAvatarPreview] = useState("");

    // populate form fields with current user data when available
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || "",
                email: user.email || "",
                birthday: user.birthday || "",
                avatar: null,
            });
            setAvatarPreview(avatarSrc(user.avatarUrl, true) || "");
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setFieldErrors((prevErrors) => ({
            ...prevErrors,
            [name]: "",
        }));
    };

    // handle file selection for the avatar
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData((prevData) => ({
                ...prevData,
                avatar: file,
            }));
            // create a preview URL for the avatar image
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        // create a new object where empty strings are converted to undefined
        const cleanedData = Object.fromEntries(
            Object.entries(profileData).map(([key, value]) => [
                key,
                value === "" ? undefined : value,
            ])
        );

        // implement client-side validation
        const errors = {};
        if (!cleanedData.email || !cleanedData.email.endsWith('utoronto.ca')) {
            errors.email = "Must be a utoronto.ca email.";
        }
        if (!cleanedData.name || cleanedData.name.length > 50) {
            errors.name = "Must be between 1-50 characters.";
        }
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            await updateProfile(cleanedData);
            onClose(); // Close the dialog on success
        } catch (err) {
            if (err.message.includes("email")) {
                errors.email = "User with this email already exists."
                setFieldErrors(errors);
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm">
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <Grid container direction="column" spacing={2} sx={{ mt: 0 }}>
                        <Grid item>
                            <Box display="flex" alignItems="center" gap={2} mb={1}>
                                <Avatar
                                    src={avatarPreview}
                                    alt="Avatar Preview"
                                    sx={{ width: 80, height: 80 }}
                                />
                                <Button variant="outlined" component="label">
                                    Upload Avatar
                                    <input
                                        type="file"
                                        name="avatar"
                                        accept="image/*"
                                        hidden
                                        onChange={handleAvatarChange}
                                    />
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={profileData.name}
                                onChange={handleChange}
                                variant="outlined"
                                error={Boolean(fieldErrors.name)}
                                helperText={fieldErrors.name}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={profileData.email}
                                onChange={handleChange}
                                variant="outlined"
                                error={Boolean(fieldErrors.email)}
                                helperText={fieldErrors.email}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                fullWidth
                                label="Birthday"
                                name="birthday"
                                type="date"
                                value={profileData.birthday}
                                onChange={handleChange}
                                variant="outlined"
                                slotProps={{ inputLabel: { shrink: true } }}
                                error={Boolean(fieldErrors.birthday)}
                                helperText={fieldErrors.birthday}
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
    );
};

export default EditProfileDialog;