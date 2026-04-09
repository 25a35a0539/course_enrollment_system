import React from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = () => {
    const navigate = useNavigate();
    return (
        <div className="w-full bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
            <div className="text-xl font-bold tracking-tight cursor-pointer" onClick={() => navigate('/instructor/dashboard')}>
                INSTRUCTOR <span className="text-blue-400">PORTAL</span>
            </div>
            <div className="flex gap-6 items-center text-sm font-medium">
                <button onClick={() => navigate('/instructor/dashboard')} className="hover:text-blue-400 transition">Dashboard</button>
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition">Help & Support</button>
            </div>
        </div>
    );
};

export default TopBar;