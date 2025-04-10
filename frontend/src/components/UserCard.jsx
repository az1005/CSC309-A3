import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
} from "@mui/material";
import { useUser } from "../contexts/UserContext";
import EditUserDialog from "./EditUserDialog";
import { useNavigate } from "react-router-dom";

function UserCard() {
    const { currentInterface, singleUser } = useUser();
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const navigate = useNavigate();

    const rolesOrder = {
        regular: 1,
        cashier: 2,
        manager: 3,
        superuser: 4,
    };

    // you can only edit if you have a strictly higher privilege than the 
    // target user, and you are in at least the manager interface
    const canEdit = (rolesOrder[currentInterface] > rolesOrder[singleUser.role]) &&
        (rolesOrder[currentInterface] >= rolesOrder["manager"]);

    return <>
        <Card variant="outlined" sx={{ position: "relative", width: "250px", height: "400px" }}>
            <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                    UTORID: {singleUser.utorid}
                </Typography>
                <Typography variant="body2">
                    Name: {singleUser.name}
                </Typography>
                <Typography variant="body2">
                    Email: {singleUser.email}
                </Typography>
                <Typography variant="body2">
                    Birthday: {singleUser.birthday ? singleUser.birthday : 'N/A'}
                </Typography>
                <Typography variant="body2">
                    Role: {singleUser.role}
                </Typography>
                <Typography variant="body2">
                    Points: {singleUser.points}
                </Typography>
                <Typography variant="body2">
                    Verified: {singleUser.verified ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2">
                    Suspicious: {singleUser.suspicious ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body2">
                    Created At: <br></br>{singleUser.createdAt}
                </Typography>
                <Typography variant="body2">
                    Last Login: {singleUser.lastLogin ? <><br></br>{singleUser.lastLogin}</> : 'N/A'}
                </Typography>
            </CardContent>
            {canEdit && (
                <CardActions sx={{ position: "absolute", bottom: "0" }}>
                    <Button size="small" variant="outlined" onClick={() => setEditDialogOpen(true)}>
                        Edit
                    </Button>
                </CardActions>
            )}
        </Card>
        {editDialogOpen && (
            <EditUserDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
            />
        )}
        <Button variant="outlined" onClick={() => navigate("/users")}>Back</Button>
    </>;
};

export default UserCard;