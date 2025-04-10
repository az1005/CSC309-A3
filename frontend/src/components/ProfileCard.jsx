import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Avatar,
    Grid,
    Box
} from "@mui/material";
import DisplayQrCodeDialog from "./DisplayQRCodeDialog";

function ProfileCard({ user, onEdit, avatarSrc, onUpdate }) {
    const [qrDialogOpen, setQrDialogOpen] = useState(false);

    const handleOpenQrDialog = () => {
        setQrDialogOpen(true);
    };

    const handleCloseQrDialog = () => {
        setQrDialogOpen(false);
    };
    return (
        <Card className="profile-card" variant="outlined">
            <CardContent>
                <Grid container spacing={2} alignItems="center">
                    {/* Avatar Column */}
                    <Grid item>
                        <Avatar
                            alt={user?.name}
                            src={avatarSrc(user?.avatarUrl, true)} // Add a URL or fallback if not available
                            sx={{ width: 80, height: 80 }}
                        />
                    </Grid>

                    {/* Details Column */}
                    <Grid item xs>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                                UTORid:
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                {user?.utorid}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                                Name:
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                {user?.name}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                                Email:
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                {user?.email}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                                Birthday:
                            </Typography>
                            <Typography variant="body1">{user?.birthday || "YYYY-MM-DD"}</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
            <CardActions>
                <Button variant="outlined" onClick={onEdit}>
                    Edit Profile
                </Button>
                <Button variant="outlined" onClick={onUpdate}>
                    Change Password
                </Button>
                <Button variant="outlined" onClick={handleOpenQrDialog}>
                    Display QR Code
                </Button>

                <DisplayQrCodeDialog
                    open={qrDialogOpen}
                    onClose={handleCloseQrDialog}
                    qrValue={String(user?.id)}
                />
            </CardActions>
        </Card>
    );
}

export default ProfileCard;
