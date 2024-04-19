'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';
import AdminLayout from '../component/admin-layout';

const RequestList = () => {
    const [date, setDate] = useState(new Date().toISOString().substr(0, 10));
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [selectedRequests, setSelectedRequests] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_PREFIX}/schedule/requests`);
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        const filteredData = requests.filter((request) => request.date === date && !request.approved);
        setFilteredRequests(filteredData);
    }, [date, requests]);

    const handleDateChange = (newDate) => {
        setSelectedRequests([]);
        setDate(newDate);
    };

    const handleRowClick = (request) => {
        if (selectedRequests.includes(request)) {
            setSelectedRequests(selectedRequests.filter((item) => item !== request));
        } else {
            setSelectedRequests([...selectedRequests, request]);
        }
    };

    const handleSuggestCalendar = () => {
        if (selectedRequests.length === 0) return;
        const selected = JSON.stringify(selectedRequests);
        router.push(`/admin/suggest?date=${date}&selectedRequests=${selected}`);
    };


    const handlePrevDay = () => {
        const currentDate = new Date(date);
        currentDate.setDate(currentDate.getDate() - 1);
        handleDateChange(currentDate.toISOString().substr(0, 10));
    };

    const handleNextDay = () => {
        const currentDate = new Date(date);
        currentDate.setDate(currentDate.getDate() + 1);
        handleDateChange(currentDate.toISOString().substr(0, 10));
    };

    return (
        <AdminLayout title="Requests">
            <h1 className="text-2xl font-semibold mb-4">Request List</h1>
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center'>
                    <button onClick={handlePrevDay} className='mr-2'>
                        <ChevronLeftIcon className="h-5 w-5"/>
                    </button>
                    <input
                        type='date'
                        value={date}
                        onChange={handleDateChange}
                        className='border px-4 py-2 mr-2'
                    />
                    <button onClick={handleNextDay} className='ml-2'>
                        <ChevronRightIcon className="h-5 w-5"/>
                    </button>
                </div>
                <button
                    onClick={handleSuggestCalendar}
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                >
                    Suggest schedules
                </button>
            </div>
            {filteredRequests.length === 0 ? (
                <p className='text-center'>No requests found for the selected date.</p>
            ) : (
                <table className="table-auto w-full">
                    <thead>
                    <tr>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Event</th>
                        <th className="px-4 py-2">Create Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredRequests.map((request) => (
                        <tr key={request.id} onClick={() => handleRowClick(request)}
                            className={selectedRequests.includes(request) ? 'bg-gray-200' : ''}>
                            <td className="border px-4 py-2"><input type="checkbox"
                                                                    checked={selectedRequests.includes(request)}
                                                                    onChange={() => {
                                                                    }}/></td>
                            <td className="border px-4 py-2">{request.date}</td>
                            <td className="border px-4 py-2">{request.event}</td>
                            <td className="border px-4 py-2">{new Date(request.create_time).toISOString().replace('T', ' ').split('.')[0]}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </AdminLayout>
    );
};

export default RequestList;
