import React from 'react';
import NotFound from './NotFound';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import EventCard from '../components/EventCard';
import { useEvent } from '../contexts/EventContext';

function EventPage() {
    const { eventId } = useParams();
    const { singleEvent, getEvent } = useEvent();

    useEffect(() => {
        getEvent(eventId);
    }, []);

    return <>
        {singleEvent ? <>
            <EventCard 
            event={singleEvent}/>
        </>
        : <NotFound />}
    </>
};

export default EventPage;