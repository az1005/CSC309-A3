import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI, requestPasswordResetAPI, resetPasswordAPI } from '../api/auth';
import { getCurrentUserAPI, registerAPI } from '../api/user';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // initialize token from localStorage if it exists
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    // global user state provided by this Auth Provider
    const [user, setUser] = useState(null);

    // invariant: token and user should always represent the same current user
    // on token change, user is updated via the useEffect hook

    // use an authLoading state to maintain auth after hard reloads
    const [authLoading, setAuthLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // loading and error states for feedback to be used in children
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const clearError = () => setError(null);

    // use navigate so we can change pages without reload
    const navigate = useNavigate();

    // functions for user authentication using the api calls...
    // TODO: add navigation after success for the following functions:
    const login = async (utorid, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await loginAPI(utorid, password);
            setToken(data.token);
            localStorage.setItem('token', data.token);
            await fetchUser();
            navigate('/');
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setIsLoggingOut(true);
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        // navigate to default landing page, or somewhere else
        navigate("/");
        setIsLoggingOut(false);
    };

    // get current user and set it in this context
    const fetchUser = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getCurrentUserAPI(token);
            setUser(data);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // request password reset
    const requestPasswordReset = async (utorid) => {
        setLoading(true);
        setError(null);
        try {
            const data = await requestPasswordResetAPI(utorid);
            return data.resetToken;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // reset password
    const resetPassword = async (utorid, newPassword, resetToken) => {
        setLoading(true);
        setError(null);
        try {
            const data = await resetPasswordAPI(utorid, newPassword, resetToken);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // register
    const register = async (utorid, name, email) => {
        setLoading(true);
        setError(null);
        try {
            const data = await registerAPI(utorid, name, email, token);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    // on mount/on token change, run a useEffect hook to load the current user info
    // fetch will set the current user
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    await fetchUser();
                } catch (err) {
                    logout();
                }
            } else {
                setUser(null);
            }
            setAuthLoading(false);
        };
        loadUser();
    }, [token]);

    return (
        <AuthContext.Provider value={{
            user, token, loading, error, setUser, clearError, setError,
            login, logout, fetchUser, requestPasswordReset, resetPassword,
            authLoading, isLoggingOut, register
            /* and other global vars */
        }}>
            {children}
        </AuthContext.Provider>
    );
}


export const useAuth = () => {
    return useContext(AuthContext);
};