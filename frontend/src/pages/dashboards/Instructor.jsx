import React, { useEffect, useState } from 'react';
import API from '../../api/axiosInstance'; 
import { useNavigate } from 'react-router-dom';

const InstructorDashboard = () => {
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('courses');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await API.get('/api/instructor/dashboard-data');
                setData(res.data);
            } catch (err) { console.error("Dashboard Fetch Failed", err); }
        };
        fetchDashboard();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!data) return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black italic tracking-widest text-xs animate-pulse uppercase">Syncing Studio Data...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Nav Bar */}
            <header className="bg-slate-900 text-white p-4 px-8 flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-8">
                    <h1 className="text-xl font-black tracking-tighter italic">EDUINSTRUCT<span className="text-blue-500 text-2xl">.</span></h1>
                    <nav className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <button onClick={() => navigate('/instructor/dashboard')} className="text-blue-500">Overview</button>
                        <button onClick={() => navigate('/instructor/settings')} className="hover:text-white transition">Profile Settings</button>
                    </nav>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-xs font-bold bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
                        CREDITS: <span className="text-yellow-400">{data.stats?.credits || 0}</span>
                    </div>
                    <button onClick={() => navigate('/instructor/create-course')} className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl font-bold text-xs transition uppercase shadow-lg shadow-blue-900/40">
                        + New Course
                    </button>
                    <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition font-bold text-xs uppercase">Logout</button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 md:p-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <StatCard title="Total Courses" value={data.stats.total_courses} color="blue" />
                    <StatCard title="Enrolled Students" value={data.stats.total_students} color="emerald" />
                    <StatCard title="Average Rating" value={`${data.stats.rating || 0} / 5`} color="yellow" />
                    <StatCard title="Credits Earned" value={`₹${data.stats.credits || 0}`} color="indigo" />
                </div>

                {/* Tabs Container */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
                    <div className="flex border-b bg-slate-50/50 p-2 gap-2">
                        <TabBtn active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} label="My Catalog" />
                        <TabBtn active={activeTab === 'students'} onClick={() => setActiveTab('students')} label="Recent Students" />
                        <TabBtn active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} label="Feedback" />
                    </div>

                    <div className="p-8">
                        {activeTab === 'courses' && <CourseList courses={data.courses} navigate={navigate} />}
                        {activeTab === 'students' && <StudentList students={data.students} />}
                        {activeTab === 'reviews' && <ReviewList reviews={data.reviews} />}
                    </div>
                </div>
            </main>
        </div>
    );
};

// Sub-components as defined previously but with UI polish...
const StatCard = ({ title, value, color }) => (
    <div className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition`}>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-slate-800 mt-2">{value}</p>
    </div>
);

const TabBtn = ({ active, onClick, label }) => (
    <button onClick={onClick} className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-tighter transition ${active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>
        {label}
    </button>
);

const CourseList = ({ courses, navigate }) => (
    <div className="grid grid-cols-1 gap-4">
        {courses.map(c => (
            <div key={c.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition">
                <div>
                    <h4 className="font-bold text-slate-800">{c.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{c.category}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${c.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span>
                    <button onClick={() => navigate(`/instructor/edit-course/${c.id}`)} className="text-blue-600 font-bold text-xs hover:underline uppercase">Edit Course</button>
                </div>
            </div>
        ))}
    </div>
);

const StudentList = ({ students }) => (
    <div className="space-y-4">
        {students.length > 0 ? students.map((s, i) => (
            <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">{s.name[0]}</div>
                    <div>
                        <p className="font-bold text-sm">{s.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Joined: {s.course}</p>
                    </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400">{s.date}</p>
            </div>
        )) : <p className="text-center text-slate-400 font-bold py-10">No enrollments yet.</p>}
    </div>
);

const ReviewList = ({ reviews }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.length > 0 ? reviews.map((r, i) => (
            <div key={i} className="p-5 border border-slate-100 rounded-3xl bg-slate-50 shadow-sm">
                <div className="flex justify-between mb-3">
                    <span className="font-black text-[10px] text-blue-600 uppercase tracking-tighter">{r.course}</span>
                    <span className="text-yellow-500 text-xs">{'★'.repeat(Math.round(r.rating))}</span>
                </div>
                <p className="text-sm text-slate-600 font-medium italic">"{r.comment}"</p>
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-slate-400">— {r.student}</span>
                </div>
            </div>
        )) : <p className="text-center text-slate-400 font-bold py-10 col-span-2">No reviews found.</p>}
    </div>
);

export default InstructorDashboard;