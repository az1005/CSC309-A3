import React from 'react';
import { useUser } from '../contexts/UserContext';
import NotFound from './NotFound';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import UserCard from '../components/UserCard';

function UserPage() {
    const { userId } = useParams();
    const { getUser, singleUser } = useUser();

    useEffect(() => {
        getUser(userId);
    }, []);

    return <>
        {singleUser ? <>
            <UserCard/>
        </>
        : <NotFound />}
    </>
};

export default UserPage;