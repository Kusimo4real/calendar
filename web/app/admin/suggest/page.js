'use client'
import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/router';
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import AdminLayout from '../component/admin-layout';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Skeleton } from 'antd';

const localizer = momentLocalizer(moment);

export default function SchedulePage() {
    const [events, setEvents] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchEvents = async (date, selectedRequests) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_PREFIX}/schedule/suggest/${date}`, {
            method: 'POST',
            body: JSON.stringify({ add_schedule: selectedRequests.map(req => req.event).join(';') }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const data = await response.json();
            setEvents(data.map(event => ({
                title: event.event,
                start: new Date(`${date} ${event.start_time}`),
                end: new Date(`${date} ${event.end_time}`),
                importance: event.importance
            })));
            setData(data);
            setLoading(false);
        } else {
            console.error("Error fetching events");
        }
    };

    const saveCalendar = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_PREFIX}/schedule/update_schedule`, {
            method: 'POST',
            body: JSON.stringify({date, events: data, ids: selectedRequests.map(item => item.id)}),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 200) {
            router.push('/admin/calendar');
        } else {
            console.error("Error saving calendar");
        }
    };

    useEffect(() => {
        const date = router.query.date;
        const selectedRequests = JSON.parse(router.query.selectedRequests);
        if (date && selectedRequests && loading) {
            fetchEvents(date, selectedRequests);
        }
    }, [router.query.date, router.query.selectedRequests]); // Добавил зависимости

    return (
        <AdminLayout title="Suggests">
            <Suspense fallback={<Skeleton active />}>
                {loading ? (
                    <Skeleton active />
                ) : (
                    <>
                        <Calendar
                            localizer={localizer}
                            defaultDate={new Date(router.query.date)}
                            defaultView={Views.DAY}
                            events={events}
                            views={['day']}
                            style={{ height: 700 }}
                        />
                        <button
                            onClick={() => saveCalendar()}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                        >
                            Save Calendar
                        </button>
                    </>
                )}
            </Suspense>
        </AdminLayout>
    );
}
