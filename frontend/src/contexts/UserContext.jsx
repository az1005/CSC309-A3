import React, { createContext, useState, useEffect, useContext } from 'react';
import { updateProfileAPI, avatarSrc, updatePasswordAPI, getUsersAPI, getUserAPI, getOwnTransactionsAPI, updateUserStatusAPI } from '../api/user';
import { useAuth } from './AuthContext';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    // get the authentication token + user from AuthContext
    const { token, user, fetchUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // store information about available interfaces in this context
    const [currentInterface, setCurrentInterface] = useState("regular");
    const [availableInterfaces, setAvailableInterfaces] = useState([]);

    // if we swapped user, need to update available interfaces
    // assume that we have in the beginning
    const [swappedUser, setSwappedUser] = useState(true);

    // store count of all users 
    const [allUsersCount, setAllUsersCount] = useState(0);

    // store single user for user page
    const [singleUser, setSingleUser] = useState(null);
    const [statusChange, setStatusChange] = useState(false);

    // function to update the current user's profile
    const updateProfile = async (profileData) => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const updatedUser = await updateProfileAPI(profileData, token);
            // update the user's info, fetchUser indirectly sets user state
            // user state will be updated, but this is not a user swap
            setSwappedUser(false);
            fetchUser();
            return updatedUser;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // update password
    const updatePassword = async (oldPassword, newPassword) => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            await updatePasswordAPI(oldPassword, newPassword, token);
            return;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // get a count of all users
    const getAllUsersCount = async () => {
        if (user && user.role !== "regular" && user.role !== "cashier") {
            setLoading(true);
            try {
                const response = await getUsersAPI('', token);
                setAllUsersCount(response.count);
            } catch (err) {
                throw err;
            } finally {
                setLoading(false);
            }
        }
    };

    // get all users:
    const getUsers = async (params) => {
        if (user && user.role !== "regular" && user.role !== "cashier") {
            if (!token) return;
            setLoading(true);
            setError(null);
            try {
                return await getUsersAPI(params, token);
            } catch (err) {
                setError(err.message);
                throw err;
            } finally {
                setLoading(false);
            }
        }
    };

    const getUser = async (userId) => {
        setLoading(true);
        const parsedId = parseInt(userId);
        try {
            const user = await getUserAPI(parsedId, token);
            setSingleUser(user);
        } catch (err) {
            setSingleUser(null);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getOwnTransactions = async (params) => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            return await getOwnTransactionsAPI(params, token);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateUserStatus = async (userId, params) => {
        if (!token) return;
        setLoading(true);
        setError(null);
        const parsedId = parseInt(userId);
        try {
            return await updateUserStatusAPI(parsedId, params, token);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // on a status change of a user from a manager, fetch+update the user
    useEffect(() => {
        async function fetchData() {
            if (singleUser) {
                const updated = await getUserAPI(singleUser.id, token);
                setSingleUser(updated);
            }
        }
        fetchData();
    }, [statusChange]);

    // on mount/user change, update the available and current interfaces
    useEffect(() => {
        // only make updates to interfaces if user has changed and it is a swapped user
        // if user has changed but we haven't swapped, means profile/some other update
        if (user && swappedUser) {
            const interfaces = [];

            if (user.role === 'superuser') {
                interfaces.push('superuser', 'manager', 'cashier', 'regular');
            } else if (user.role === 'manager') {
                interfaces.push('manager', 'cashier', 'regular');
            } else if (user.role === 'cashier') {
                interfaces.push('cashier', 'regular');
            } else {
                interfaces.push('regular');
                if (user.eventsAsOrganizer && user.eventsAsOrganizer.length > 0) interfaces.push('event organizer');
            }

            setAvailableInterfaces(interfaces);
            setCurrentInterface(interfaces[0]);
        } else if (!user) {
            // if user is null, i.e. user not logged in
            // no available interfaces
            setAvailableInterfaces([]);
            setCurrentInterface("");
        }
        setSwappedUser(true);
    }, [user]);

    return (
        <UserContext.Provider value={{
            user, loading, error, setError, updateProfile, updatePassword, avatarSrc, 
            getOwnTransactions,currentInterface, setCurrentInterface, availableInterfaces, 
            getUsers, allUsersCount, getAllUsersCount, getUser, singleUser, 
            updateUserStatus, statusChange, setStatusChange
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};
