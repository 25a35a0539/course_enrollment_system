import React, { useState, useEffect } from "react";
import API from "../../api/axiosInstance";
import { 
  Search, Trash2, Eye, X, Mail, Phone, Hash, Calendar, 
  Activity, User, ShieldCheck, Award, BookOpen, Loader2 
} from "lucide-react";

export default function UserManagement({ roleType }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  // const [selectedUser, setSelectedUser] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, [roleType]);

  const fetchUsers = async () => {
    const res = await API.get(`/api/admin/all-users?role=${roleType}`);
    setUsers(res.data);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = async (userId) => {
  setIsModalLoading(true);
  try {
    const res = await API.get(`/api/admin/user-details/${userId}`);
    setSelectedUser(res.data); // Motha data ikkada store avthundi
  } catch (err) {
    alert("Failed to fetch details");
  } finally {
    setIsModalLoading(false);
  }
};

  return (
    <div className="space-y-4">
      {/* 🔍 SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" placeholder={`FILTER ${roleType}...`}
          className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold uppercase text-xs tracking-widest outline-none shadow-sm focus:border-blue-500"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 📊 TABLE */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white font-black uppercase text-[9px] tracking-widest">
            <tr>
              <th className="p-6">Identification</th>
              <th className="p-6">Contact Details</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(u => (
              <tr key={u.user_id} className="hover:bg-slate-50 transition-all">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    {/* 🖼️ PROFILE IMAGE LOGIC */}
                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                      {u.profile_image ? (
                        <img src={u.profile_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-slate-400" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase text-slate-900 leading-tight">{u.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <p className="text-[11px] font-black text-slate-900">{u.phone}</p>
                  <span className="text-[9px] font-black uppercase text-emerald-600">● {u.status}</span>
                </td>
                <td className="p-6 text-right space-x-2">
                  <button 
                    onClick={() => handleViewDetails(u.user_id)} 
                    disabled={isModalLoading === u.user_id}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:scale-105 transition-all shadow-md shadow-blue-100 disabled:opacity-50"
                  >
                    {/* 🚩 Ikkada loading icon or eye icon */}
                    {isModalLoading === u.user_id ? (
                      <Loader2 className="animate-spin" size={16}/>
                    ) : (
                      <Eye size={16}/>
                    )}
                  </button>
                  
                  <button className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={16}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🚩 OPTIMIZED POPUP */}
      {/* {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[40px] p-10 shadow-2xl relative border border-white animate-in zoom-in duration-200">
            <button onClick={() => setSelectedUser(null)} className="absolute right-8 top-8 p-2 bg-slate-100 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20}/></button>

            <div className="flex items-center gap-6 mb-8 border-b border-slate-100 pb-8">
               <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black italic shadow-lg">
                {selectedUser.profile_image ? <img src={selectedUser.profile_image} className="w-full h-full rounded-2xl object-cover"/> : selectedUser.name[0]}
               </div>
               <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tight text-slate-900">{selectedUser.name}</h2>
                  <p className="text-blue-600 font-black uppercase tracking-widest text-[9px] mt-1">Verified Profile Data</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailBox icon={<Mail size={12}/>} label="Email" value={selectedUser.email} />
              <DetailBox icon={<Phone size={12}/>} label="Phone" value={selectedUser.phone} />
              <DetailBox icon={<Hash size={12}/>} label="User ID" value={`#${selectedUser.user_id}`} />
              <DetailBox icon={<Activity size={12}/>} label="Status" value={selectedUser.status} />
              
              {roleType === 'INSTRUCTOR' ? (
                <div className="col-span-2 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Bio & Expertise</p>
                  <p className="text-[12px] font-bold text-slate-900 leading-snug">{selectedUser.bio || "No description available."}</p>
                </div>
              ) : (
                <div className="col-span-2 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedUser.skills) ? selectedUser.skills.map((s,i)=>(
                      <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[9px] font-black uppercase">{s}</span>
                    )) : <span className="text-[10px] text-slate-400">Not Provided</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )} */}

      {/* 🚩 Optimized Detail Modal */}
{selectedUser && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative border border-white/20 overflow-hidden animate-in zoom-in duration-200">
      
      {/* Header with Background Color */}
      <div className="bg-slate-900 p-8 text-white flex items-center gap-6 relative">
        <button onClick={() => setSelectedUser(null)} className="absolute right-6 top-6 p-2 bg-white/10 rounded-full hover:bg-red-500 transition-all">
          <X size={20}/>
        </button>
        
        {/* Profile Image Logic */}
        <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white/20 overflow-hidden flex items-center justify-center shadow-xl">
          {selectedUser.profile_image ? (
            <img src={selectedUser.profile_image} className="w-full h-full object-cover" onError={(e) => e.target.src="https://ui-avatars.com/api/?name="+selectedUser.name} />
          ) : (
            <User size={32} className="text-slate-900" />
          )}
        </div>
        
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{selectedUser.name}</h2>
          <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[9px] mt-2 flex items-center gap-1">
            <ShieldCheck size={10}/> Verified {roleType} Account
          </p>
        </div>
      </div>

      <div className="p-8 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
        <DetailBox icon={<Mail size={12}/>} label="Official Email" value={selectedUser.email} />
        <DetailBox icon={<Phone size={12}/>} label="Contact Number" value={selectedUser.phone} />
        <DetailBox icon={<Calendar size={12}/>} label="Registration Date" value={selectedUser.joined_at} />
        <DetailBox icon={<Hash size={12}/>} label="Database ID" value={`#${selectedUser.user_id}`} />
        
        {/* Education & Bio - Full Width */}
        <div className="col-span-2 space-y-4 mt-2">
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-900 uppercase mb-2 tracking-widest flex items-center gap-2">
              <Award size={12} className="text-blue-600"/> Bio & Professional Summary
            </p>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">{selectedUser.bio || "No biography provided by the user."}</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-900 uppercase mb-2 tracking-widest flex items-center gap-2">
              <BookOpen size={12} className="text-blue-600"/> Skills & Expertise
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedUser.skills && selectedUser.skills.length > 0 ? (
                selectedUser.skills.split(',').map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-tighter">
                    {s.trim()}
                  </span>
                ))
              ) : <span className="text-[10px] text-slate-400 font-bold italic">No technical skills listed</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-t flex gap-3">
        <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-800 transition-all">Download Audit Log</button>
        <button onClick={() => setSelectedUser(null)} className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-100 transition-all">Close</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

function DetailBox({ icon, label, value }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-slate-400 font-black text-[8px] uppercase tracking-widest">
        {icon} {label}
      </div>
      <p className="font-black text-[11px] uppercase text-slate-900 truncate">{value}</p>
    </div>
  );
}