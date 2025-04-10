// similar to register from T11
import './form.css';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ResetTokenFlow from '../components/ResetTokenFlow';

const Register = () => {
    const { register, error, clearError } = useAuth();
    const [data, setData] = useState({
        utorid: '',
        name: '',
        email: '',
    });
    const [showResetFlow, setShowResetFlow] = useState(false);
    const [resetToken, setResetToken] = useState(null);

    // on mount, clear the error:
    useEffect(() => {
        clearError();
    }, []);

    const handle_change = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const handle_submit = async (e) => {
        e.preventDefault();
        const user = await register(data.utorid, data.name, data.email);
        setResetToken(user.resetToken);
        setShowResetFlow(true);
    };

    return <>
        <h2>Registration</h2>
        {!showResetFlow ? (
            <form onSubmit={handle_submit}>
                <label htmlFor="utorid">UTORid:</label>
                <input
                    type="text"
                    id="utorid"
                    name="utorid"
                    placeholder='UTORid'
                    value={data.utorid}
                    onChange={handle_change}
                    required
                />
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder='Name'
                    value={data.name}
                    onChange={handle_change}
                    required
                />
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder='Email'
                    value={data.email}
                    onChange={handle_change}
                    required
                />
                <div className="btn-container">
                    <button type="submit">Register</button>
                </div>
                <p className="error">{error}</p>
            </form>
        ) : (
            <ResetTokenFlow
                utoridFromParent={data.utorid}
                resetTokenFromParent={resetToken}
            />
        )}

    </>;
};

export default Register;