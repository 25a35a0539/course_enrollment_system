import React, { useState, useEffect } from 'react';
import API from '../../api/axiosInstance';
import { 
  User, Phone, Award, BookOpen, 
  TrendingUp, Wallet, Save, 
  Plus, Minus, RefreshCcw 
} from 'lucide-react';

const InstructorSettings = () => {
    const [profile, setProfile] = useState({ 
        name: '', phone: '', bio: '', expertise: '', experience: 0, credits: 0 
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await API.get('/api/instructor/profile-details');
                // Filter out remarks from response if they exist
                setProfile(res.data);
                setLoading(false);
            } catch (err) { 
                console.error("Profile Fetch Failed", err); 
                setLoading(false); 
            }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async () => {
        try {
            await API.put('/api/instructor/update-profile', profile);
            alert("Profile Synced! 🦾");
        } catch (err) { alert("Update Failed!"); }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
            <RefreshCcw className="animate-spin text-blue-600" size={32} />
            <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Loading Studio...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800">
            <div className="max-w-5xl mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                            Instructor <span className="text-blue-600">Settings</span>
                        </h2>
                        <p className="text-sm text-slate-400 font-bold">Update your public profile and teaching credentials</p>
                    </div>
                    
                    {/* Wallet Chip */}
                    <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Earnings</p>
                            <p className="text-lg font-black text-slate-900 italic">₹{profile.credits}</p>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        
                        {/* Column 1: Personal Info */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Basic Identity</h3>
                            
                            <IconField label="Full Name" icon={<User size={18}/>} value={profile.name} 
                                onChange={e => setProfile({...profile, name: e.target.value})} />
                            
                            <IconField label="Phone Number" icon={<Phone size={18}/>} value={profile.phone} 
                                onChange={e => setProfile({...profile, phone: e.target.value})} />

                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    <TrendingUp size={12}/> Teaching Experience
                                </label>
                                <div className="flex items-center bg-slate-50 border border-slate-100 p-2 rounded-2xl w-full md:w-48">
                                    <button onClick={() => setProfile({...profile, experience: Math.max(0, profile.experience - 1)})} 
                                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:text-red-500 transition shadow-sm">
                                        <Minus size={16}/>
                                    </button>
                                    <span className="flex-1 text-center font-black text-slate-800 text-sm">{profile.experience}Y</span>
                                    <button onClick={() => setProfile({...profile, experience: profile.experience + 1})} 
                                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:text-green-600 transition shadow-sm">
                                        <Plus size={16}/>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Professional Details */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Professional Bio</h3>
                            
                            <IconField label="Core Expertise" icon={<Award size={18}/>} value={profile.expertise} 
                                onChange={e => setProfile({...profile, expertise: e.target.value})} />

                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    <BookOpen size={12}/> About You (Bio)
                                </label>
                                <textarea className="bg-slate-50 border border-slate-100 p-5 rounded-[2rem] h-44 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition resize-none font-medium text-slate-600 text-sm leading-relaxed"
                                    placeholder="Write your teaching philosophy..." value={profile.bio} 
                                    onChange={e => setProfile({...profile, bio: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-12 pt-8 border-t border-slate-50 flex justify-end">
                        <button onClick={handleUpdate} className="w-full md:w-auto bg-slate-900 hover:bg-blue-600 text-white px-12 py-5 rounded-[2rem] flex items-center justify-center gap-3 font-black text-sm transition-all shadow-2xl hover:scale-[1.02] active:scale-[0.98]">
                            <Save size={20} /> SYNC PROFILE 🚀
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Custom Field Component
const IconField = ({ label, icon, value, onChange }) => (
    <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            {label}
        </label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                {icon}
            </div>
            <input className="w-full bg-slate-50 border border-slate-100 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition font-bold text-slate-700 text-sm shadow-sm"
                value={value} onChange={onChange} />
        </div>
    </div>
);

export default InstructorSettings;