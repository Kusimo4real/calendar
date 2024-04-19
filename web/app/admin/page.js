'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Home = () => {
    const router = useRouter();

    useEffect(() => {
        router.push('/admin/login');
    }, []);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '24px'
        }}>
            Loading...
        </div>
    );
};

export default Home;
