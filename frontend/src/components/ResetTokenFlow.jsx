import React, { useState } from "react";
import "./ResetTokenFlow.css"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ResetTokenFlow = ({ utoridFromParent, resetTokenFromParent }) => {
    // assert that resetToken must be provided from parent
    if (!resetTokenFromParent) return;
    // move the reset token flow to a component for reuse from reset password
    // and register
    const { resetPassword, error, setError } = useAuth();
    const navigate = useNavigate();

    // local state to switch between the token display and the reset form
    const [showResetForm, setShowResetForm] = useState(false);

    // reset form fields
    const [confirmUtorid, setConfirmUtorid] = useState(utoridFromParent || "");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmResetToken, setConfirmResetToken] = useState("");

    const handleProceed = () => {
        // clear any error and show the reset password form
        setError("");
        setShowResetForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (confirmUtorid !== utoridFromParent) {
            setError("Utorid does not match originally requested utorid.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (confirmResetToken !== resetTokenFromParent) {
            setError("Incorrect reset token.");
            return;
        }

        try {
            await resetPassword(confirmUtorid, newPassword, resetTokenFromParent);
            navigate("/success");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            {!showResetForm ? (
                // display the reset token and instructions
                <div className="details">
                    <p>
                        Your reset token is: <strong>{resetTokenFromParent}</strong>
                    </p>
                    <p>Please copy and paste the reset token in the next form.</p>
                    <div className="btn-container">
                        <button onClick={handleProceed}>
                            Proceed to Reset Your Password
                        </button>
                    </div>
                </div>
            ) : (
                // show form after proceeding
                <form onSubmit={handleSubmit}>
                    <p className="details">Password must include at least one:</p>
                    <p className="details">Uppercase, Lowercase, Number, and Special Character</p>

                    <label htmlFor="confirmUtorid">Utorid:</label>
                    <input
                        type="text"
                        id="confirmUtorid"
                        placeholder="UTORid"
                        value={confirmUtorid}
                        onChange={(e) => setConfirmUtorid(e.target.value)}
                        required
                    />

                    <label htmlFor="newPassword">New Password:</label>
                    <input
                        type="password"
                        id="newPassword"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />

                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <label htmlFor="confirmResetToken">Verify Reset Token:</label>
                    <input
                        type="text"
                        id="confirmResetToken"
                        placeholder="Reset Token"
                        value={confirmResetToken}
                        onChange={(e) => setConfirmResetToken(e.target.value)}
                        required
                    />

                    <div className="btn-container">
                        <button type="submit">Reset Password</button>
                    </div>
                    <p className="error">{error}</p>
                </form>
            )}
        </>
    );
};

export default ResetTokenFlow;
