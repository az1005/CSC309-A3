const eventService = require('../services/eventService');
const { validatePayload } = require('../util/helpers');

async function createEvent(req, res) {
    try {
        const payload = req.body;
        const allowedFields = ['name', 'description', 'location',
            'startTime', 'endTime', 'capacity', 'points'];
        const requiredFields = ['name', 'description', 'location',
            'startTime', 'endTime', 'points'];

        validatePayload(payload, allowedFields, requiredFields);

        const event = await eventService.createEvent(payload);

        return res.status(201).json(event);

    } catch (error) {
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getEvents(req, res) {
    try {
        // payload in query for get
        const payload = req.query;

        // retreive current user since we need to give different events dependent on
        // the role of the logged in user
        const currentUser = req.user;
        let allowedFields;
        if (currentUser.role == 'regular' || currentUser.role == 'cashier') {
            allowedFields = ['name', 'location', 'started', 'ended',
                'showFull', 'page', 'limit', 'order', 'orderBy'];
        } else {
            // should be manager or superuser
            allowedFields = ['name', 'location', 'started', 'ended',
                'showFull', 'page', 'limit', 'published', 'order', 'orderBy'];
        }

        validatePayload(payload, allowedFields, []);

        const { count, results } = await eventService.getEvents(payload, currentUser);

        // apply filtering to hide description
        const safeResults = results.map(event => {
            const filteredEvent = {
                id: event.id,
                name: event.name,
                location: event.location,
                startTime: event.startTime,
                endTime: event.endTime,
                capacity: event.capacity,
                pointsRemain: event.pointsRemain,
                pointsAwarded: event.pointsAwarded,
                published: event.published,
                numGuests: event.guests.length
            }
            return filteredEvent;
        });

        return res.status(200).json({ count, results: safeResults });

    } catch (error) {
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getEventById(req, res) {
    try {
        // payload should be empty
        const payload = req.body;
        validatePayload(payload, [], []);

        const { eventId } = req.params;
        const currentUser = req.user;

        // assume getEventById does the logic for what informationt to show
        // based on role of current user/if current user is an organizer 
        // for this event
        const event = await eventService.getEventById(eventId, currentUser);

        return res.status(200).json(event);

    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updateEvent(req, res) {
    try {
        const { eventId } = req.params;
        const currentUser = req.user;
        const payload = req.body;
        const allowedFields = ['name', 'description', 'location',
            'startTime', 'endTime', 'capacity', 'points', 'published'];
        validatePayload(payload, allowedFields, []);

        // assume service will check for authorization and only return the
        // updated fields + some base fields
        const updatedEvent = await eventService.updateEvent(payload, eventId, currentUser);

        return res.status(200).json(updatedEvent);

    } catch (error) {
        if (error.code === 'FORBIDDEN') {
            return res.status(403).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deleteEvent(req, res) {
    try {
        const { eventId } = req.params;
        // payload should be empty
        const payload = req.body;
        validatePayload(payload, [], []);

        await eventService.deleteEvent(eventId);

        return res.status(204).end();

    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function addOrganizerToEvent(req, res) {
    try {
        const { eventId } = req.params;
        const payload = req.body;
        validatePayload(payload, ['utorid'], ['utorid']);

        const event = await eventService.addOrganizerToEvent(payload, eventId);

        return res.status(201).json(event);

    } catch (error) {
        if (error.code === 'EVENT_ENDED') {
            return res.status(410).json({ error: error.message });
        }
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deleteOrganizerFromEvent(req, res) {
    try {
        const { eventId, userId } = req.params;
        // payload should be empty
        const payload = req.body;
        validatePayload(payload, [], []);

        await eventService.deleteOrganizerFromEvent(eventId, userId);

        return res.status(204).end();

    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function addGuestToEvent(req, res) {
    try {
        const { eventId } = req.params;
        const currentUser = req.user;
        const payload = req.body;
        validatePayload(payload, ['utorid'], ['utorid']);

        // assume service will send back the wanted fields
        const event = await eventService.addGuestToEvent(payload, eventId, currentUser);

        return res.status(201).json(event);
        
    } catch (error) {
        if (error.code === 'EVENT_GONE') {
            return res.status(410).json({ error: error.message });
        }
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'FORBIDDEN') {
            return res.status(403).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deleteGuestFromEvent(req, res) {
    try {
        const { eventId, userId } = req.params;
        // payload should be empty
        const payload = req.body;
        validatePayload(payload, [], []);

        await eventService.deleteGuestFromEvent(eventId, userId);

        return res.status(204).end();

    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function addCurrentUserToEvent(req, res) {
    try {
        const { eventId } = req.params;
        const currentUser = req.user;

        // payload should be empty
        const payload = req.body;
        validatePayload(payload, [], []);

        // assume service will send back the wanted fields
        const event = await eventService.addCurrentUserToEvent(eventId, currentUser);

        return res.status(201).json(event);

    } catch (error) {
        if (error.code === 'EVENT_GONE') {
            return res.status(410).json({ error: error.message });
        }
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deleteCurrentUserFromEvent(req, res) {
    try {
        const { eventId } = req.params;
        const currentUser = req.user;
        // payload should be empty
        const payload = req.body;
        validatePayload(payload, [], []);

        await eventService.deleteCurrentUserFromEvent(eventId, currentUser);

        return res.status(204).end();

    } catch (error) {
        if (error.code === 'EVENT_GONE') {
            return res.status(410).json({ error: error.message });
        }
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function createEventTransactions(req, res) {
    try {
        const { eventId } = req.params;
        const currentUser = req.user;
        const payload = req.body;
        validatePayload(payload, ['type', 'amount', 'utorid'], ['type', 'amount']);

        const transaction = await eventService.createEventTransactions(payload, eventId, currentUser);

        return res.status(201).json(transaction);

    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: error.message });
        }
        if (error.code === 'FORBIDDEN') {
            return res.status(403).json({ error: error.message });
        }
        if (error.code === 'BAD_PAYLOAD') {
            return res.status(400).json({ error: error.message });
        }
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    createEvent, getEvents, getEventById, updateEvent, deleteEvent,
    addOrganizerToEvent, deleteOrganizerFromEvent, addGuestToEvent,
    deleteGuestFromEvent, addCurrentUserToEvent, deleteCurrentUserFromEvent,
    createEventTransactions
};