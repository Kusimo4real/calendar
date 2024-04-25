import React from "react";
import { CalendarIcon, InboxIcon, LogoutIcon } from '@heroicons/react/outline';

const AdminLayout = ({ children, title }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-gray-800 text-black h-16 flex items-center justify-between px-4">
                <div>
                    <h1 className="text-lg font-bold">{title}</h1>
                </div>
                <nav>
                    <a href="/admin/login" className="hover:text-gray-300 mx-2 flex items-center">Logout<LogoutIcon className="w-6 h-6 ml-1" /></a>
                </nav>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <aside className="bg-gray-900 text-gray-300 w-16 md:w-64 overflow-y-auto">
                    <ul className="p-4">
                        <li className="mb-2">
                            <a href="/admin/calendar" className="flex items-center hover:text-black">
                                <CalendarIcon className="w-6 h-6 mr-2" /> Calendar
                            </a>
                        </li>
                        <li className="mb-2">
                            <a href="/admin/requests" className="flex items-center hover:text-black">
                                <InboxIcon className="w-6 h-6 mr-2" /> Requests
                            </a>
                        </li>
                    </ul>
                </aside>
                <main className="flex-1 p-4 overflow-y-auto bg-gray-100">
                    {children}
                </main>
            </div>
            <footer className="bg-gray-800 text-black h-16 flex items-center justify-center">
                <p>Â© 2024 OpenAI Secretary</p>
            </footer>
        </div>
    );
};

export default AdminLayout;
