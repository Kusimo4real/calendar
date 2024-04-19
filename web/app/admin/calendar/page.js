'use client'

import {useState, useEffect, useMemo} from 'react';
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/zh-cn';
import AdminLayout from '../component/admin-layout';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [view, setView] = useState('week');
    const [date, setDate] = useState('')

    useEffect(() => {
        const getGoogleCalendarEvents = async () => {
            try {
                const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
                const CALENDAR_ID = encodeURIComponent(process.env.NEXT_PUBLIC_CALENDAR_ID);
                const response = await fetch(
                    `https://content.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch Google Calendar events');
                }

                const data = await response.json();
                const eventsData = data.items.map(event => ({
                    title: event.summary,
                    start: new Date(event.start.dateTime || event.start.date),
                    end: new Date(event.end.dateTime || event.end.date),
                }));

                setEvents(eventsData);
            } catch (error) {
                console.error('Error fetching Google Calendar events', error);
            }
        };

        getGoogleCalendarEvents();
    }, []);

    return (
        <AdminLayout title="Calendar">
            <Calendar
                localizer={localizer}
                events={events}
                defaultView={Views.WEEK}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 700 }}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
            />
        </AdminLayout>
    );
};

export default CalendarPage;
