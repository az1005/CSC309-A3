const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const createEventAPI = async (payload, token) => {
    const start = new Date(payload.startTime);
    const end = new Date(payload.endTime);
    const body = payload;
    body.startTime = start.toISOString();
    body.endTime = end.toISOString();
    const res = await fetch(`${BACKEND_URL}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Create Promotion Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();
};

export const getEventsAPI = async (params, token) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BACKEND_URL}/events?${query}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Get Events Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();
};

export const getEventAPI = async (eventId, token) => {
    const res = await fetch(`${BACKEND_URL}/events/${eventId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Get Event Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();
};

export const updateEventAPI = async (eventId, payload, token) => {
    const start = new Date(payload.startTime);
    const end = new Date(payload.endTime);
    const body = payload;
    body.startTime = start.toISOString();
    body.endTime = end.toISOString();
    const res = await fetch(`${BACKEND_URL}/events/${eventId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Update Event Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();

};

export const addSelfToEventAPI = async (eventId, token) => {
    const res = await fetch(`${BACKEND_URL}/events/${eventId}/guests/me`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `RVSP Event Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();
};

export const removeSelfFromEventAPI = async (eventId, token) => {
    const res = await fetch(`${BACKEND_URL}/events/${eventId}/guests/me`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `UN-RVSP Event Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res;
};

export const deleteEventAPI = async (eventId, token) => {
    const res = await fetch(`${BACKEND_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Delete Event Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res;
};

export const addGuestAPI = async (utorid, eventId, token) => {
    const res = await fetch(`${BACKEND_URL}/events/${eventId}/guests`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ utorid })
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Add Guest Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();
};

export const deleteGuestAPI = async (userId, eventId, token) => {
    const res = await fetch(`${BACKEND_URL}/events/${eventId}/guests/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Delete Guest Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res;
};

export const addOrganizerAPI = async (utorid, eventId, token) => {
    const res = await fetch(`${BACKEND_URL}/events/${eventId}/organizers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ utorid })
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Add Organizer Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();
};

export const deleteOrganizerAPI = async (userId, eventId, token) => {
    const res = await fetch(`${BACKEND_URL}/events/${eventId}/organizers/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Delete Organizer Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res;
};

export const createEventTransactionAPI = async (eventId, payload, token) => {
    const res = await fetch(`${BACKEND_URL}/events/${eventId}/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = `Create Reward Failed: ${errorData.error || 'Unknown error'}`;
        throw new Error(errorMsg);
    }
    return await res.json();
};