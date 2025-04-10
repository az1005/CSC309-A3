const e = require('express');
const repository = require('../repositories/repository');
const { validateStartAndEndTimes, validatePositiveNumber, validateBooleanField, isValidISO8601 } = require('../util/helpers');

async function createEvent(payload) {
    let { name, description, location,
        startTime, endTime, capacity, points } = payload;

    const details = {}

    // validate payload data
    if (!name || typeof (name) !== 'string') {
        const error = new Error('Invalid name, must be a string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    if (!description || typeof (description) !== 'string') {
        const error = new Error('Invalid description, must be a string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    if (!location || typeof (location) !== 'string') {
        const error = new Error('Invalid location, must be a string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    // use helper function to throw bad payload errors if 
    // start and end times are not valid
    validateStartAndEndTimes(startTime, endTime);


    // use helper to throw error if capacity (if defined) 
    // or points is not a positive integer
    if (capacity !== undefined && capacity !== null) {
        capacity = validatePositiveNumber(capacity, 'capacity', true);
        details.capacity = capacity

    }
    points = validatePositiveNumber(points, 'points', true);

    details.name = name;
    details.description = description;
    details.location = location;
    details.startTime = startTime;
    details.endTime = endTime;
    details.pointsRemain = points;

    const event = await repository.createEvent(details);
    return event;

}

async function getEvents(payload, currentUser) {
    let { name, location, started, ended,
        showFull = false, page = 1, limit = 10, published,
        order, orderBy } = payload;

    // validate payload data
    if (name !== undefined && typeof (name) !== 'string') {
        const error = new Error('Invalid name, must be a string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    if (location !== undefined && typeof (location) !== 'string') {
        const error = new Error('Invalid location, must be a string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    // build query filter
    const filters = {}
    if (name) filters.name = name;
    if (location) filters.location = location;

    page = validatePositiveNumber(page, 'page', true);
    limit = validatePositiveNumber(limit, 'limit', true);

    const now = new Date();
    if (started !== undefined && ended !== undefined) {
        // should not have both of these defined
        const error = new Error('Both started and ended should not be specified');
        error.code = 'BAD_PAYLOAD';
        throw error;
    } else if (started !== undefined) {
        started = validateBooleanField(started, 'started');
        // if started, we want to filter by start time that is less than current time
        filters.startTime = started ? { lte: now } : { gt: now };
    } else if (ended !== undefined) {
        ended = validateBooleanField(ended, 'ended');
        filters.endTime = ended ? { lte: now } : { gt: now };
    }

    if (showFull !== undefined && showFull !== null) {
        showFull = validateBooleanField(showFull, 'showFull');
    }

    // assume we already check that the current user has sufficient clearance
    if (published !== undefined) {
        if (currentUser.role === 'regular' || currentUser.role === 'cashier') {
            const error = new Error('unknown field published');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        published = validateBooleanField(published, 'published');
        filters.published = published;
    } else {
        // if it is undefined and the current user is a regular
        // they are not allowed to see unpublished events, so set published to true
        // not sure if this also applies for cashiers, see later in testing
        if (currentUser.role === 'regular' || currentUser.role === 'cashier') {
            filters.published = true;
        }
    }

    // validate order and orderBy
    order = order !== null ? order : undefined
    orderBy = orderBy !== null ? orderBy : undefined
    if (order !== undefined && orderBy !== undefined) {
        const sortableFields = ['name', 'location', 'startTime', 'endTime', 'capacity', 'numGuests'];
        if (orderBy !== undefined && !sortableFields.includes(orderBy)) {
            const error = new Error(`Invalid "orderBy" field, must be one of: ${sortableFields.join(', ')}`);
            error.code = 'BAD_PAYLOAD';
            throw error;
        }

        if (order !== undefined && !['asc', 'desc'].includes(order.toLowerCase())) {
            const error = new Error('Invalid "order" value, must be "asc" or "desc".');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    } else if (order !== undefined || orderBy !== undefined) {
        const error = new Error('order and orderBy must be specified together');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    // build the sort options
    const sortOptions = (order && orderBy) ? { field: orderBy, direction: order } : undefined

    const events = await repository.getAllEventsWithFilters(filters);

    // try manual paging instead since we need to do showFull on all events, 
    // not just the ones provided in results capped at limit
    // let { count, results } = await repository.getEventsWithFilters(filters, skip, limit);
    // other fix could be containing a numGuests field for the guests, so we can filter by that directly
    // but this would require more business logic, like incrementing every time we add a guest,
    // could try if this doesn't work

    // if showFull is false, don't include events where capacity equals the number of guests
    // only include events that are not at their capacity
    let filteredEvents;
    if (!showFull) {
        filteredEvents = events.filter(event =>
            event.capacity === null || event.capacity !== event.guests.length
        );
    } else {
        filteredEvents = events;
    }
    const count = filteredEvents.length;

    // apply sorting on the filteredEvents array if sortOptions exist
    if (sortOptions) {
        filteredEvents.sort((a, b) => {
            let valA;
            let valB;
            // if we are sorting by numGuests, set the values to the 
            // length of the guests array
            if (sortOptions.field === 'numGuests') {
                valA = a.guests.length
                valB = b.guests.length
            } else {
                valA = a[sortOptions.field];
                valB = b[sortOptions.field];
            }

            // handle for undefined
            if (valA === undefined || valA === null) return 1;
            if (valB === undefined || valB === null) return -1;

            // convert to date objects if field is start/endTime
            if (sortOptions.field === 'startTime' || sortOptions.field === 'endTime') {
                valA = new Date(valA);
                valB = new Date(valB);
            }

            if (typeof valA === 'string' && typeof valB === 'string') {
                const comparison = valA.localeCompare(valB);
                return sortOptions.direction === 'asc' ? comparison : -comparison;
            } else if (typeof valA === 'number' && typeof valB === 'number') {
                return sortOptions.direction === 'asc' ? valA - valB : valB - valA;
            } else if (valA instanceof Date && valB instanceof Date) {
                return sortOptions.direction === 'asc' ? valA - valB : valB - valA;
            } else {
                // fallback: try converting to string
                const comparison = String(valA).localeCompare(String(valB));
                return sortOptions.direction === 'asc' ? comparison : -comparison;
            }
        });
    }

    // apply pagination manually
    // calculate skip and take, then slice the filteredEvents array
    const skip = (page - 1) * limit;
    const paginatedResults = filteredEvents.slice(skip, skip + limit);

    return { count, results: paginatedResults };
}

async function getEventById(eventId, currentUser) {
    // validate eventId parameter
    eventId = validatePositiveNumber(eventId, 'eventId', true);

    // find event with eventId and decide whether we are in
    // case 1: manager/superuser/organizer for this event
    // case 2: regular/cashier

    const event = await repository.getEventById(eventId);
    if (!event) {
        const error = new Error('Event not found');
        error.code = 'NOT_FOUND';
        throw error;
    }

    const isPrivileged =
        currentUser.role === 'manager' ||
        currentUser.role === 'superuser' ||
        (event.organizers.some(org => org.id === currentUser.id));

    if (isPrivileged) {
        // case 1
        const filteredEvent = {
            id: event.id,
            name: event.name,
            description: event.description,
            location: event.location,
            startTime: event.startTime,
            endTime: event.endTime,
            capacity: event.capacity,
            pointsRemain: event.pointsRemain,
            pointsAwarded: event.pointsAwarded,
            published: event.published,
            organizers: event.organizers.map(org => ({
                id: org.id,
                utorid: org.utorid,
                name: org.name
            })),
            guests: event.guests
        };
        return filteredEvent;
    } else {
        // case 2 regular/cashier users 
        // if event is not published, throw a 404 not found error
        if (!event.published) {
            const error = new Error('Event not published');
            error.code = 'NOT_FOUND';
            throw error;
        }
        const filteredEvent = {
            id: event.id,
            name: event.name,
            description: event.description,
            location: event.location,
            startTime: event.startTime,
            endTime: event.endTime,
            capacity: event.capacity,
            organizers: event.organizers.map(org => ({
                id: org.id,
                utorid: org.utorid,
                name: org.name
            })),
            numGuests: event.guests.length
        };
        return filteredEvent;
    }
}

async function updateEvent(payload, eventId, currentUser) {
    // clean the payload and convert null to undefined
    const cleanPayload = Object.fromEntries(
        Object.entries(payload).map(([key, value]) => [key, value === null ? undefined : value])
    );

    let { name, description, location, startTime,
        endTime, capacity, points, published } = cleanPayload;

    eventId = validatePositiveNumber(eventId, 'eventId', true);

    // find the original event to check if it exists and if has started already
    const originalEvent = await repository.getEventById(eventId);
    if (!originalEvent) {
        const error = new Error('Event not found');
        error.code = 'NOT_FOUND';
        throw error;
    }

    // check that we have the proper authorization
    const authorized =
        currentUser.role === 'manager' ||
        currentUser.role === 'superuser' ||
        (originalEvent.organizers.some(org => org.id === currentUser.id));

    if (!authorized) {
        const error = new Error('Forbidden, not authorized to update this event');
        error.code = 'FORBIDDEN';
        throw error;
    }

    const now = new Date();

    // if the event has already started/ended, we cannot make edits to some fields
    if (originalEvent.startTime < now) {
        const fields = [name, description, location, startTime, capacity];
        if (fields.some(field => field !== undefined)) {
            // cannot change any of these fields if promo has started
            const error = new Error('Event has already started');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    }
    if (originalEvent.endTime < now) {
        const fields = [name, description, location, startTime, endTime, capacity];
        if (fields.some(field => field !== undefined)) {
            // cannot change any of these fields if promo has ended
            const error = new Error('Event has already ended');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    }

    // validate payload data
    if (name !== undefined && typeof (name) !== 'string') {
        const error = new Error('Invalid name, must be a string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    if (description !== undefined && typeof (description) !== 'string') {
        const error = new Error('Invalid description, must be a string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }
    if (location !== undefined && typeof (location) !== 'string') {
        const error = new Error('Invalid location, must be a string.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    // validate start and end times
    if (startTime !== undefined && endTime !== undefined) {
        validateStartAndEndTimes(startTime, endTime);
    } else if (startTime !== undefined) {
        if (typeof (startTime) !== 'string' ||
            !isValidISO8601(startTime)) {
            const error = new Error('Invalid startTime format, must be a ISO 8601 string.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        const start = new Date(startTime);
        if (start < now) {
            const error = new Error('Invalid startTime, cannot be in the past.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        if (start > originalEvent.endTime) {
            const error = new Error('Invalid startTime, must be before the end time.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    } else if (endTime !== undefined) {
        if (typeof (endTime) !== 'string' ||
            !isValidISO8601(endTime)) {
            const error = new Error('Invalid endTime format, must be a ISO 8601 string representing a date in the future.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        const end = new Date(endTime);
        if (end < now) {
            const error = new Error('Invalid endTime, cannot be in the past.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        if (end < originalEvent.startTime) {
            const error = new Error('Invalid endTime, must be after the start time.');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    }

    if (capacity !== undefined && capacity !== null) {
        capacity = validatePositiveNumber(capacity, 'capacity');
        // check if num of confirmed guests exceed the new capacity
        if (capacity < originalEvent.guests.length) {
            const error = new Error('Invalid capacity, number of guests would exceed this capacity');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    }

    let pointsRemain = undefined;
    if (points !== undefined && points !== null) {
        // can only be modified by managers or higher
        if (!(currentUser.role === 'manager' || currentUser.role === 'superuser')) {
            const error = new Error('Forbidden, not authorized to update the points for this event');
            error.code = 'FORBIDDEN';
            throw error;
        }
        points = validatePositiveNumber(points, 'points', true);
        // check if changing total points would require setting pointsRemain to negative
        const currAwarded = originalEvent.pointsAwarded;
        pointsRemain = points - currAwarded;
        if (pointsRemain < 0) {
            const error = new Error('Invalid points, cannot reduce points more than how much already awarded');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    }

    if (published !== undefined && published !== null) {
        // can only be modified by managers or higher
        if (!(currentUser.role === 'manager' || currentUser.role === 'superuser')) {
            const error = new Error('Forbidden, not authorized to publish this event');
            error.code = 'FORBIDDEN';
            throw error;
        }
        published = validateBooleanField(published, 'published');
        if (!published) {
            const error = new Error('Invalid published, can only be true');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
    }

    // passes all checks, update the promo
    // filter out undefined fields
    const updates = Object.fromEntries(
        Object.entries({
            name, description, location, startTime,
            endTime, capacity, pointsRemain, published
        }).filter(([_, v]) => v !== undefined && v !== null)
    );

    if (Object.keys(updates).length === 0) {
        const error = new Error('No valid fields to update.');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    const updatedEvent = await repository.updateEvent(eventId, updates);

    // shouldn't happen since it was found earlier
    if (!updatedEvent) {
        const error = new Error('Event not found');
        error.code = 'NOT_FOUND'
        throw error;
    }

    // include some base fields in the response
    const baseFields = ['id', 'name', 'location'];

    // in addition, add the fields we used to update
    const allowedKeys = Array.from(new Set([...Object.keys(updates), ...baseFields]));

    // return only the specific keys
    return Object.fromEntries(
        Object.entries(updatedEvent).filter(([key]) => allowedKeys.includes(key))
    );
}

async function deleteEvent(eventId) {
    eventId = validatePositiveNumber(eventId, 'eventId', true);

    // make sure the event hasn't been published yet
    const event = await repository.getEventById(eventId);
    if (!event) {
        const error = new Error('Event not found');
        error.code = 'NOT_FOUND'
        throw error;
    }

    if (event.published) {
        const error = new Error('Event already published, cannot delete');
        error.code = 'BAD_PAYLOAD'
        throw error;
    }

    await repository.deleteEvent(eventId);
    return;
}

async function addOrganizerToEvent(payload, eventId) {
    // validate payload and id
    const { utorid } = payload;
    eventId = validatePositiveNumber(eventId, 'eventId', true);
    if (typeof (utorid) !== 'string') {
        const error = new Error('Invalid utorid, must be a string');
        error.code = 'BAD_PAYLOAD'
        throw error;
    }

    // check if utorid is a valid user
    const organizer = await repository.findUserByUtorid(utorid);
    if (!organizer) {
        const error = new Error('User not found');
        error.code = 'NOT_FOUND'
        throw error;
    }

    // check if event exists or has ended
    const event = await repository.getEventById(eventId);
    if (!event) {
        const error = new Error('Event not found');
        error.code = 'NOT_FOUND'
        throw error;
    }
    const now = new Date()
    if (event.endTime < now) {
        const error = new Error('Event has ended, cannot add an organizer');
        error.code = 'EVENT_ENDED'
        throw error;
    }

    // check if user is registered to event already as a guest
    if (event.guests.some(guest => guest.id === organizer.id)) {
        const error = new Error('User is already registered as guest, remove as guest first');
        error.code = 'BAD_PAYLOAD'
        throw error;
    }

    // passes all checks, add organizer to event
    // assume repository only gives back the desired fields
    const updatedEvent = await repository.addOrganizerToEvent(eventId, organizer.id);

    return updatedEvent;

}

async function deleteOrganizerFromEvent(eventId, userId) {
    // validate ids
    eventId = validatePositiveNumber(eventId, 'eventId', true);
    userId = validatePositiveNumber(userId, 'userId', true);

    // check if userId is a valid user
    const organizer = await repository.getUserById(userId);
    if (!organizer) {
        const error = new Error('User not found');
        error.code = 'NOT_FOUND'
        throw error;
    }

    // check if eventId is a valid event
    const event = await repository.getEventById(eventId);
    if (!event) {
        const error = new Error('Event not found');
        error.code = 'NOT_FOUND'
        throw error;
    }

    // check if user is indeed an organizer for this event
    if (!(event.organizers.some(org => org.id === organizer.id))) {
        const error = new Error('User is not an organizer for this event');
        error.code = 'BAD_PAYLOAD'
        throw error;
    }

    // passes all checks, delete organizer from event
    await repository.deleteOrganizerFromEvent(eventId, userId);
    return;
}

async function addGuestToEvent(payload, eventId, currentUser) {
    // validate payload and id
    const { utorid } = payload;
    eventId = validatePositiveNumber(eventId, 'eventId', true);
    if (typeof (utorid) !== 'string') {
        const error = new Error('Invalid utorid, must be a string');
        error.code = 'BAD_PAYLOAD'
        throw error;
    }

    const event = await repository.getEventById(eventId);
    if (!event) {
        const error = new Error('Event not found');
        error.code = 'NOT_FOUND'
        throw error;
    }
    // check if current user has sufficient authorization
    const isPrivileged =
        currentUser.role === 'manager' ||
        currentUser.role === 'superuser' ||
        (event.organizers.some(org => org.id === currentUser.id));

    if (!isPrivileged) {
        const error = new Error("Forbidden");
        error.code = "FORBIDDEN";
        throw error;
    }

    // check if utorid is a valid user
    const guest = await repository.findUserByUtorid(utorid);
    if (!guest) {
        const error = new Error('User not found');
        error.code = 'NOT_FOUND'
        throw error;
    }

    // check if event is not published, has ended, or is full
    // not sure if this should only throw an error if current user is a regular/cashier
    if (!event.published && currentUser.role !== 'manager' && currentUser.role !== 'superuser') {
        const error = new Error('Event not published, cannot add a guest');
        error.code = 'NOT_FOUND'
        throw error;
    }

    const now = new Date()
    if (event.endTime < now) {
        const error = new Error('Event has ended, cannot add a guest');
        error.code = 'EVENT_GONE'
        throw error;
    }

    if (event.guests.length === event.capacity) {
        const error = new Error('Event is full, cannot add a guest');
        error.code = 'EVENT_GONE'
        throw error;
    }

    // check if user is registered to event already as a organizer
    if (event.organizers.some(org => org.id === guest.id)) {
        const error = new Error('User is already registered as organizer, remove as organizer first');
        error.code = 'BAD_PAYLOAD'
        throw error;
    }

    // all checks pass
    const updatedEvent = await repository.addGuestToEvent(eventId, guest.id);

    const filteredEvent = {
        id: updatedEvent.id,
        name: updatedEvent.name,
        location: updatedEvent.location,
        // return only the guest that was added
        guestAdded: updatedEvent.guests.find(user => user.id === guest.id),
        numGuests: updatedEvent.guests.length
    };
    return filteredEvent;
}

async function deleteGuestFromEvent(eventId, userId) {
    // validate ids
    eventId = validatePositiveNumber(eventId, 'eventId', true);
    userId = validatePositiveNumber(userId, 'userId', true);

    // check if userId is a valid user
    const guest = await repository.getUserById(userId);
    if (!guest) {
        const error = new Error('User not found');
        error.code = 'NOT_FOUND'
        throw error;
    }

    // check if eventId is a valid event
    const event = await repository.getEventById(eventId);
    if (!event) {
        const error = new Error('Event not found');
        error.code = 'NOT_FOUND'
        throw error;
    }

    // check if user is indeed a guest for this event
    if (!(event.guests.some(user => user.id === guest.id))) {
        const error = new Error('User is not a guest for this event');
        error.code = 'BAD_PAYLOAD'
        throw error;
    }

    // passes all checks, delete organizer from event
    await repository.deleteGuestFromEvent(eventId, userId);
    return;
}

async function addCurrentUserToEvent(eventId, currentUser) {
    eventId = validatePositiveNumber(eventId, 'eventId', true);

    const event = await repository.getEventById(eventId);
    if (!event) {
        const error = new Error('Event not found');
        error.code = 'NOT_FOUND'
        throw error;
    }

    // check if event is not published, has ended, or is full
    // not sure if this should only throw an error if current user is a regular/cashier
    // currently throws for every user if event not published
    if (!event.published) {
        const error = new Error('Event not published, cannot add a guest');
        error.code = 'NOT_FOUND'
        throw error;
    }

    const now = new Date()
    if (event.endTime < now) {
        const error = new Error('Event has ended, cannot add a guest');
        error.code = 'EVENT_GONE'
        throw error;
    }

    if (event.guests.length === event.capacity) {
        const error = new Error('Event is full, cannot add a guest');
        error.code = 'EVENT_GONE'
        throw error;
    }

    // check if user is registered to event already as a organizer/guest
    if (event.organizers.some(user => user.id === currentUser.id) ||
        event.guests.some(user => user.id === currentUser.id)) {
        const error = new Error('User is already registered to this event');
        error.code = 'BAD_PAYLOAD'
        throw error;
    }

    // all checks pass
    const updatedEvent = await repository.addGuestToEvent(eventId, currentUser.id);

    const filteredEvent = {
        id: updatedEvent.id,
        name: updatedEvent.name,
        location: updatedEvent.location,
        // return only the guest that was added
        guestAdded: updatedEvent.guests.find(user => user.id === currentUser.id),
        numGuests: updatedEvent.guests.length
    };
    return filteredEvent;
}

async function deleteCurrentUserFromEvent(eventId, currentUser) {
    // validate eventId
    eventId = validatePositiveNumber(eventId, 'eventId', true);

    // check if eventId is a valid event
    const event = await repository.getEventById(eventId);
    if (!event) {
        const error = new Error('Event not found');
        error.code = 'NOT_FOUND'
        throw error;
    }

    // check if user is indeed a guest for this event
    if (!(event.guests.some(user => user.id === currentUser.id))) {
        const error = new Error('User is not a guest for this event');
        error.code = 'NOT_FOUND'
        throw error;
    }

    // check if event has ended
    const now = new Date()
    if (event.endTime < now) {
        const error = new Error('Event has ended, cannot delete a guest');
        error.code = 'EVENT_GONE'
        throw error;
    }

    // passes all checks, delete organizer from event
    await repository.deleteGuestFromEvent(eventId, currentUser.id);
    return;
}

async function createEventTransactions(payload, eventId, currentUser) {
    // validate eventId
    eventId = validatePositiveNumber(eventId, 'eventId', true);

    const event = await repository.getEventById(eventId);
    if (!event) {
        const error = new Error('Event not found');
        error.code = 'NOT_FOUND';
        throw error;
    }

    // authenicate currentUser
    const isPrivileged =
        currentUser.role === 'manager' ||
        currentUser.role === 'superuser' ||
        (event.organizers.some(org => org.id === currentUser.id));

    if (!isPrivileged) {
        const error = new Error('Forbidden, not authorized to do this action');
        error.code = 'FORBIDDEN';
        throw error;
    }

    let { type, utorid, amount } = payload;

    // validate payload data
    if (type !== 'event') {
        const error = new Error('Invalid type, must be "event"');
        error.code = 'BAD_PAYLOAD';
        throw error;
    }

    amount = validatePositiveNumber(amount, 'amount', true);

    if (utorid !== undefined && utorid !== null) {
        // utorid is defined, create a reward specific for this user
        // check that this user was a guest to this event
        if (!event.guests.some(guest => guest.utorid === utorid)) {
            // utorid was not found on the guest list
            const error = new Error(`${utorid} was not found on the event's guest list`);
            error.code = 'BAD_PAYLOAD';
            throw error;
        }

        // check that we have enough points to handout
        if (event.pointsRemain < amount) {
            const error = new Error('Event does not have sufficient points remaining');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }

        // passes all checks, we can create the transaction
        const details = {
            owner: { connect: { utorid } },
            amount,
            type,
            remark: "",
            createdBy: currentUser.utorid,
            relatedId: event.id
        };

        const reward = await repository.createTransaction(details);

        // update the event's points awarded and remaining points
        await repository.updateEventPoints(event.id, amount);

        // update the user's point balance
        await repository.updateUserPoints(utorid, amount);

        const response = {
            id: reward.id,
            recipient: reward.utorid,
            awarded: reward.amount,
            type: reward.type,
            relatedId: reward.relatedId,
            remark: reward.remark,
            createdBy: reward.createdBy
        };

        return response;

    } else {
        // create a transaction for all of the guests
        // check that we have enough points for all guests
        if (event.pointsRemain < event.guests.length * amount) {
            const error = new Error('Event does not have sufficient points remaining');
            error.code = 'BAD_PAYLOAD';
            throw error;
        }
        const responses = [];
        // loop through all guests and create a transaction for each
        for (const guest of event.guests) {
            const details = {
                owner: { connect: { utorid: guest.utorid } },
                amount,
                type,
                remark: "",
                createdBy: currentUser.utorid,
                relatedId: event.id
            };

            const reward = await repository.createTransaction(details);

            // update the event's points awarded and remaining points
            await repository.updateEventPoints(event.id, amount);

            // update the user's point balance
            await repository.updateUserPoints(guest.utorid, amount);

            const response = {
                id: reward.id,
                recipient: reward.utorid,
                awarded: reward.amount,
                type: reward.type,
                relatedId: reward.relatedId,
                remark: reward.remark,
                createdBy: reward.createdBy
            };

            responses.push(response);
        }

        return responses;
    }
}

module.exports = {
    createEvent, getEvents, getEventById, updateEvent, deleteEvent,
    addOrganizerToEvent, deleteOrganizerFromEvent, addGuestToEvent,
    deleteGuestFromEvent, addCurrentUserToEvent, deleteCurrentUserFromEvent,
    createEventTransactions
};