const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireClearance } = require('../middleware/authMiddleware');
const { jwtAuth } = require('../middleware/jwtAuth');

// create an event
router.post('/', jwtAuth, requireClearance('manager'), eventController.createEvent);

// get events
router.get('/', jwtAuth, eventController.getEvents);

// add organizer to event
router.post('/:eventId/organizers', jwtAuth, requireClearance('manager'), eventController.addOrganizerToEvent);

// delete organizer from event
router.delete('/:eventId/organizers/:userId', jwtAuth, requireClearance('manager'), eventController.deleteOrganizerFromEvent);

// add guest to event
// do clearance check in service layer since we have additional business logic
router.post('/:eventId/guests', jwtAuth, eventController.addGuestToEvent);

// add current user as guest to event
router.post('/:eventId/guests/me', jwtAuth, eventController.addCurrentUserToEvent);

// delete current user as guest from event
router.delete('/:eventId/guests/me', jwtAuth, eventController.deleteCurrentUserFromEvent);

// delete guest from event
router.delete('/:eventId/guests/:userId', jwtAuth, requireClearance('manager'), eventController.deleteGuestFromEvent);

// create event reward transactions
// do clearance check in service layer since organizers can use this endpoint
router.post('/:eventId/transactions', jwtAuth, eventController.createEventTransactions)

// get event by id
router.get('/:eventId', jwtAuth, eventController.getEventById);

// update event by id, do the clearance check in service layer
// since organizers are authorized to use this endpoint
router.patch('/:eventId', jwtAuth, eventController.updateEvent);

// delete event by id
router.delete('/:eventId', jwtAuth, requireClearance('manager'), eventController.deleteEvent);

module.exports = router;