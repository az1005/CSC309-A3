import React from "react";
import {
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Modal,
    Box
} from "@mui/material";
import { useUser } from "../contexts/UserContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EditEventDialog from "./EditEventDialog";
import { useEvent } from "../contexts/EventContext";
import RsvpEventDialog from "./RsvpEventDialog";
import DeleteEventDialog from "./DeleteEventDialog";
import UpdateEventDialog from "./UpdateEventDialog";
import ManageGuestDialog from "./ManageGuestDialog";
import ManageOrganizerDialog from "./ManageOrganizerDialog";
import RewardDialog from "./RewardDialog";

function EventCard({ event }) {
    const { currentInterface, user } = useUser();
    const { setUpdateMessage, setError } = useEvent();
    const [rsvpDialogOpen, setRsvpDialogOpen] = useState(false);
    const [unrsvpDialogOpen, setUnRsvpDialogOpen] = useState(false);
    // edit + delete for managers
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    // update for event organizers
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

    // manage guests/organizers
    const [manageGuestOpen, setManageGuestOpen] = useState(false);
    const [manageOrganizerOpen, setManageOrganizerOpen] = useState(false);

    // reward points from this event to a guest
    const [rewardOpen, setRewardOpen] = useState(false);

    const navigate = useNavigate();

    const rolesOrder = {
        regular: 1,
        cashier: 2,
        manager: 3,
        superuser: 4,
    };

    // you can only edit if you have a strictly higher privilege than the 
    // target user, and you are in at least the manager interface
    const canEdit = rolesOrder[currentInterface] >= rolesOrder["manager"];

    // can only edit this event if the current user is an organizer for this event
    const isEventOrganizer = currentInterface === 'event organizer' &&
        user?.eventsAsOrganizer?.some((e) => e.id === event.id);

    const isGuest = user?.eventsAsGuest?.some((e) => e.id === event.id);

    // calculate num guests in different ways depending on 
    // what role the current user is
    const numGuests = (user?.role === 'manager' ||
        user?.role === 'superuser' ||
        user?.eventsAsOrganizer?.some((e) => e.id === event.id))
        ? event.guests?.length : event.numGuests;

    return <>
        <Card variant="outlined" sx={{
            width: 300,
            height: 500,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            p: 1
        }}>
            <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                    Event {event.id}: {event.name}
                </Typography>
                <Typography variant="body2">Description: {event.description}</Typography>
                <Typography variant="body2">Location: {event.location}</Typography>
                <Typography variant="body2">From: {event.startTime}</Typography>
                <Typography variant="body2">Until: {event.endTime}</Typography>
                <Typography variant="body2">Capacity: {event.capacity ? event.capacity : 'None'}</Typography>
                <Typography variant="body2">Organizers: {event?.organizers?.length}</Typography>
                <Typography variant="body2">Guests: {numGuests}</Typography>
                {!(currentInterface === "regular" || currentInterface === "cashier") && <>
                    <Typography variant="body2">Published: {event.published ? 'Yes': 'No'}</Typography>
                    <Typography variant="body2">Points Remaining: {event.pointsRemain}</Typography>
                    <Typography variant="body2">Points Awarded: {event.pointsAwarded}</Typography>
                </>
                }
            </CardContent>
            <CardActions sx={{ flexWrap: "wrap", rowGap: 1, justifyContent: "center" }}>
                {isGuest && (
                    <Button size="small" variant="outlined" onClick={() => setUnRsvpDialogOpen(true)}>
                        Remove RSVP
                    </Button>
                )}
                {!isGuest && (
                    <Button size="small" variant="outlined" onClick={() => setRsvpDialogOpen(true)}>
                        RSVP
                    </Button>
                )}
                {canEdit && (<>
                    <Button size="small" variant="outlined" onClick={() => setEditDialogOpen(true)}>
                        Edit
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => setDeleteDialogOpen(true)}>
                        Delete
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => setManageOrganizerOpen(true)}>
                        Manage Organizers
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => setManageGuestOpen(true)}>
                        Manage Guests
                    </Button>
                </>
                )}
                {isEventOrganizer && (<>
                    <Button size="small" variant="outlined" onClick={() => setUpdateDialogOpen(true)}>
                        Update Info
                    </Button>
                </>
                )}
                {(canEdit || isEventOrganizer) && (<>
                    <Button size="small" variant="outlined" onClick={() => setRewardOpen(true)}>
                        Reward Points
                    </Button>
                </>
                )}
            </CardActions>
        </Card>

        {unrsvpDialogOpen && (
            <RsvpEventDialog
                open={unrsvpDialogOpen}
                onClose={() => setUnRsvpDialogOpen(false)}
            />
        )}
        {rsvpDialogOpen && (
            <RsvpEventDialog
                open={rsvpDialogOpen}
                onClose={() => { setRsvpDialogOpen(false); setError(null); }}
            />
        )}
        {editDialogOpen && (
            <EditEventDialog
                open={editDialogOpen}
                onClose={() => {
                    setUpdateMessage(null);
                    setEditDialogOpen(false);
                }}
            />
        )}
        {deleteDialogOpen && (
            <DeleteEventDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            />
        )}
        {updateDialogOpen && (
            <UpdateEventDialog
                open={updateDialogOpen}
                onClose={() => {
                    setUpdateMessage(null);
                    setUpdateDialogOpen(false);
                }}
            />
        )}
        {manageGuestOpen && (
            <ManageGuestDialog
                open={manageGuestOpen}
                onClose={() => setManageGuestOpen(false)}
            />
        )}
        {manageOrganizerOpen && (
            <ManageOrganizerDialog
                open={manageOrganizerOpen}
                onClose={() => setManageOrganizerOpen(false)}
            />
        )}
        {rewardOpen && (
            <RewardDialog
                open={rewardOpen}
                onClose={() => setRewardOpen(false)}
            />
        )}
        <Button variant="outlined" onClick={() => navigate("/event")}>Back</Button>
    </>;
};

export default EventCard;