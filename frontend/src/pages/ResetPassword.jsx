import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./form.css";
import ResetTokenFlow from "../components/ResetTokenFlow";

function ResetPassword() {
    const { requestPasswordReset, error, clearError } = useAuth();
    const [utorid, setUtorid] = useState("");
    const [resetToken, setResetToken] = useState(null);

    // on mount, clear the error
    useEffect(() => {
        clearError();
    }, []);

    // step 1: request the reset token
    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await requestPasswordReset(utorid);
            // backend will give back a reset token
            setResetToken(token);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <h2>Reset Password</h2>
            {!resetToken ? (
                <form onSubmit={handleRequestSubmit}>
                    <label htmlFor="utorid">UTORid:</label>
                    <input
                        type="text"
                        id="utorid"
                        placeholder="UTORid"
                        value={utorid}
                        onChange={(e) => setUtorid(e.target.value)}
                        required
                    />
                    <div className="btn-container">
                        <button type="submit">Request Password Reset</button>
                    </div>
                    <p className="error">{error}</p>
                </form>
            ) : (
                // use the reusable ResetTokenFlow component
                <ResetTokenFlow 
                    utoridFromParent={utorid} 
                    resetTokenFromParent={resetToken} 
                />
            )}
        </>
    );
}

export default ResetPassword;