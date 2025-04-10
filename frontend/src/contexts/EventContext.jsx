import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { addGuestAPI, addOrganizerAPI, addSelfToEventAPI, createEventAPI, createEventTransactionAPI, deleteEventAPI, deleteGuestAPI, deleteOrganizerAPI, getEventAPI, getEventsAPI, removeSelfFromEventAPI, updateEventAPI } from '../api/event';
import { useUser } from './UserContext';

export const EventContext = createContext(null);

export const EventProvider = ({ children }) => {
    const { token, user } = useAuth();
    const { currentInterface } = useUser();
    const [loading, setLoading] = useState(false);
    const [createMessage, setCreateMessage] = useState(null);
    const [allEventsCount, setAllEventsCount] = useState(0);
    const [error, setError] = useState(null);
    const [singleEvent, setSingleEvent] = useState(null);
    const [updateMessage, setUpdateMessage] = useState(null);

    // status state for updating the single event:
    const [statusChange, setStatusChange] = useState(false);

    const addEvent = async (formData) => {
        if (!token) return;
        setLoading(true);
        setCreateMessage(null);
        const data = {
            name: formData.name,
            description: formData.description,
            location: formData.location,
            startTime: formData.startTime,
            endTime: formData.endTime,
            capacity: null,
            points: parseInt(formData.points)
        };
        if (formData.capacity !== "") {
            data.capacity = parseInt(formData.capacity);
        }
        try {
            const event = await createEventAPI(data, token);
            setCreateMessage("Success!");
        } catch (err) {
            setCreateMessage(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getAllEventsCount = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await getEventsAPI('', token);
            setAllEventsCount(response.count);
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getEvents = async (params) => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            return await getEventsAPI(params, token);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getEvent = async (eventId) => {
        if (!token) return;
        setLoading(true);
        const parsedId = parseInt(eventId);
        try {
            const promotion = await getEventAPI(parsedId, token);
            setSingleEvent(promotion);
        } catch (err) {
            setSingleEvent(null);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateEvent = async (eventId, params) => {
        if (!token) return;
        setUpdateMessage(null);
        setLoading(true);
        setError(null);
        const parsedId = parseInt(eventId);
        try {
            await updateEventAPI(parsedId, params, token);
            setUpdateMessage("Success!")
            return;
        } catch (err) {
            setUpdateMessage(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // on an edit/change of an event, fetch+update the event
    useEffect(() => {
        async function fetchData() {
            if (singleEvent) {
                const updated = await getEventAPI(singleEvent.id, token);
                setSingleEvent(updated);
            }
        }
        fetchData();
    }, [statusChange]);

    const addSelfToEvent = async (eventId) => {
        if (!token) return;
        setError(null);
        setLoading(true);
        setError(null);
        const parsedId = parseInt(eventId);
        try {
            await addSelfToEventAPI(parsedId, token);
            return;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const removeSelfFromEvent = async (eventId) => {
        if (!token) return;
        setError(null);
        setLoading(true);
        setError(null);
        const parsedId = parseInt(eventId);
        try {
            await removeSelfFromEventAPI(parsedId, token);
            return;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const deleteEvent = async (eventId) => {
        if (!token) return;
        setError(null);
        setLoading(true);
        const parsedId = parseInt(eventId);
        try {
            await deleteEventAPI(parsedId, token);
            return;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const addGuest = async (utorid, eventId) => {
        if (!token) return;
        setError(null);
        setLoading(true);
        const parsedId = parseInt(eventId);
        try {
            await addGuestAPI(utorid, parsedId, token);
            return;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const deleteGuest = async (userId, eventId) => {
        if (!token) return;
        setError(null);
        setLoading(true);
        const parsedEventId = parseInt(eventId);
        const parsedUserId = parseInt(userId)
        try {
            await deleteGuestAPI(parsedUserId, parsedEventId, token);
            return;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const addOrganizer = async (utorid, eventId) => {
        if (!token) return;
        setError(null);
        setLoading(true);
        const parsedId = parseInt(eventId);
        try {
            await addOrganizerAPI(utorid, parsedId, token);
            return;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const deleteOrganizer = async (userId, eventId) => {
        if (!token) return;
        setError(null);
        setLoading(true);
        const parsedEventId = parseInt(eventId);
        const parsedUserId = parseInt(userId)
        try {
            await deleteOrganizerAPI(parsedUserId, parsedEventId, token);
            return;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const createEventTransaction = async (eventId, params) => {
        if (!token) return;
        setUpdateMessage(null);
        setLoading(true);
        setError(null);
        const parsedId = parseInt(eventId);
        try {
            await createEventTransactionAPI(parsedId, params, token);
            setUpdateMessage("Success!")
            return;
        } catch (err) {
            setUpdateMessage(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }


    return (
        <EventContext.Provider value={{
            user, loading, createMessage, allEventsCount, error, singleEvent,
            setCreateMessage, addEvent, getAllEventsCount, setError, getEvents,
            getEvent, updateEvent, updateMessage, setUpdateMessage, statusChange,
            setStatusChange, addSelfToEvent, removeSelfFromEvent, deleteEvent,
            addGuest, deleteGuest, addOrganizer, deleteOrganizer, createEventTransaction
        }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvent = () => {
    return useContext(EventContext);
};
