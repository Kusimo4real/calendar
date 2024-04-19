'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_PREFIX}/user/login?username=${username}&password=${password}`);
            if (response.status === 200) {
                router.push('/admin/calendar');
            } else {
                setError('Invalid username or password');
            }
        } catch (error) {
            console.error('Login request error', error);
            setError('Login failed. Please try again later');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg">
                <h1 className="text-3xl font-semibold text-gray-800 mb-4">Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            className="w-full px-3 py-2 border rounded-md text-gray-700"
                            id="username"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="w-full px-3 py-2 border rounded-md text-gray-700"
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <button
                        className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 rounded-md"
                        type="submit"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
