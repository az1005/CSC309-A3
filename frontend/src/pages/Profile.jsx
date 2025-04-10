import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";
import ProfileCard from "../components/ProfileCard";
import EditProfileDialog from "../components/EditProfileDialog";
import UpdatePasswordDialog from "../components/UpdatePasswordDialog";

function Profile() {
    const { user, setError, avatarSrc } = useUser();
    // edit for profile editing
    const [editOpen, setEditOpen] = useState(false);
    // update for password change
    const [updateOpen, setUpdateOpen] = useState(false);

    return (<>
        <h2>Profile</h2>
        <div style={{ padding: "2px" }}>
            <ProfileCard
                user={user}
                onEdit={() => setEditOpen(true)}
                avatarSrc={avatarSrc}
                onUpdate={() => setUpdateOpen(true)} />
            {editOpen && (
                <EditProfileDialog open={editOpen} onClose={() => {
                    setError(null);
                    setEditOpen(false);
                }} avatarSrc={avatarSrc} />
            )}
            {updateOpen && (
                <UpdatePasswordDialog open={updateOpen} onClose={() => {
                    setError(null);
                    setUpdateOpen(false);
                }} />
            )}
        </div>
    </>
    );
}

export default Profile;
