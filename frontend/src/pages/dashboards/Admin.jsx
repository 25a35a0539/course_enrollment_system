import React, { useState, useEffect } from "react";
import { 
  Users, UserCheck, BookOpen, LayoutDashboard, 
  LogOut, Star, CheckCircle, Trash2, ShieldCheck, Loader2, Award 
} from "lucide-react";
import API from "../../api/axiosInstance";
import UserManagement from "../../components/admin/UserManagement";
import CreditManagement from "../../components/admin/CreditManagement";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [listData, setListData] = useState([]);

  const fetchStats = async () => {
    try {
      const res = await API.get("/api/admin/dashboard-stats");
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchDataForTab = async (tab) => {
    if (["overview", "all_students", "all_instructors", "credits"].includes(tab)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let endpoint = "";
      if (tab === "instructors") endpoint = "/api/admin/pending-instructors";
      else if (tab === "courses") endpoint = "/api/admin/pending-courses";
      else if (tab === "certificates") endpoint = "/api/admin/pending-certificates"; // 🚩 NEW: Certificate endpoint
      
      if (endpoint) {
        const res = await API.get(endpoint);
        setListData(res.data);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    fetchDataForTab(activeTab);
  }, [activeTab]);

  const handleAction = async (method, url, body = {}) => {
    setActionLoading(true);
    try {
      const res = await API[method](url, body);
      alert(res.data.message);
      fetchStats();
      fetchDataForTab(activeTab);
    } catch (err) { alert(err.response?.data?.error || "Operation Failed"); }
    setActionLoading(false);
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = "/login"; };

  if (loading && activeTab === "overview") return <div className="h-screen flex items-center justify-center font-black animate-pulse text-blue-600 tracking-widest uppercase">INITIALISING ADMIN CONSOLE...</div>;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="flex items-center gap-3 mb-12 px-2 font-black text-2xl tracking-tighter uppercase italic text-slate-900">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">A</div>
          EduAdmin
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarItem active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<LayoutDashboard size={20}/>} label="Overview" />
          <SidebarItem active={activeTab === "instructors"} onClick={() => setActiveTab("instructors")} icon={<UserCheck size={20}/>} label="Instructor Queue" />
          <SidebarItem active={activeTab === "courses"} onClick={() => setActiveTab("courses")} icon={<BookOpen size={20}/>} label="Course Requests" />
          <SidebarItem active={activeTab === "certificates"} onClick={() => setActiveTab("certificates")} icon={<Award size={20}/>} label="Certificates Queue" /> {/* 🚩 NEW: Tab */}
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">User Database</div>
          <SidebarItem active={activeTab === "all_students"} onClick={() => setActiveTab("all_students")} icon={<Users size={20}/>} label="All Students" />
          <SidebarItem active={activeTab === "all_instructors"} onClick={() => setActiveTab("all_instructors")} icon={<ShieldCheck size={20}/>} label="All Instructors" />
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Finances</div>
          <SidebarItem active={activeTab === "credits"} onClick={() => setActiveTab("credits")} icon={<Star size={20}/>} label="Manage Credits" />
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-6 py-4 text-red-600 font-black text-[11px] uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all">
          <LogOut size={20}/> Log Out System
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 mb-2">System Administrator</p>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter text-slate-900">Control Center</h1>
        </header>

        {/* 1. OVERVIEW VIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6"> {/* 🚩 Changed to 5 columns */}
            <StatCard label="Total Students" value={stats.total_students} icon={<Users size={24}/>} color="text-blue-600" />
            <StatCard label="Active Courses" value={stats.active_courses} icon={<BookOpen size={24}/>} color="text-emerald-600" />
            <StatCard label="Pending Instructors" value={stats.pending_instructors} icon={<UserCheck size={24}/>} color="text-orange-600" />
            <StatCard label="Course Queue" value={stats.pending_courses} icon={<Star size={24}/>} color="text-purple-600" />
            <StatCard label="Pending Certs" value={stats.pending_certificates} icon={<Award size={24}/>} color="text-amber-500" /> {/* 🚩 NEW: Cert count */}
          </div>
        )}

        {/* 2. QUEUE VIEW (Instructors / Courses / Certificates) */}
        {(activeTab === "instructors" || activeTab === "courses" || activeTab === "certificates") && (
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden p-2 relative">
             {actionLoading && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center font-black text-blue-600 uppercase tracking-widest"><Loader2 className="animate-spin mr-2"/> Syncing...</div>}
             <table className="w-full text-left">
               <thead className="bg-slate-50 border-b border-slate-100">
                 <tr className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                   <th className="p-8">Entity Name</th>
                   <th className="p-8">Context</th>
                   <th className="p-8 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {listData.length > 0 ? listData.map((item, idx) => (
                   <tr key={idx} className="hover:bg-slate-50 border-b border-slate-50 transition-colors">
                     <td className="p-8">
                        {/* 🚩 Handles name for user, title for course, student_name for certs */}
                        <p className="font-black text-sm uppercase text-slate-900">{item.name || item.title || item.student_name}</p>
                        <p className="text-[10px] font-bold text-slate-600 uppercase">{item.email || (item.course_title ? `Course: ${item.course_title}` : "ID: " + item.course_id)}</p>
                     </td>
                     <td className="p-8">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-black uppercase tracking-tight">
                          {item.status || item.instructor || (activeTab === "certificates" ? "READY TO ISSUE" : "PENDING_REVIEW")}
                        </span>
                     </td>
                     <td className="p-8 text-right space-x-2">
                        {activeTab === "instructors" && (
                          <button onClick={() => handleAction('post', `/api/admin/approve-instructor/${item.user_id}`)} className="bg-emerald-600 text-white p-3 rounded-xl hover:shadow-lg transition-all"><CheckCircle size={20}/></button>
                        )}
                        {activeTab === "courses" && (
                          <button onClick={() => {
                            const credits = prompt("Assign Credits:", "50");
                            if(credits) handleAction('post', `/api/admin/approve-course/${item.course_id}`, { action: 'APPROVED', credits: parseInt(credits) });
                          }} className="bg-blue-600 text-white p-3 rounded-xl hover:shadow-lg transition-all"><CheckCircle size={20}/></button>
                        )}
                        {activeTab === "certificates" && (
                          <button onClick={() => handleAction('post', `/api/admin/issue-certificate/${item.enrollment_id}`)} className="bg-amber-500 text-white p-3 rounded-xl hover:shadow-lg hover:bg-amber-600 transition-all"><Award size={20}/></button>
                        )}
                        
                        {/* Remove Button for Instructors/Courses */}
                        {activeTab !== "certificates" && (
                          <button onClick={() => handleAction('delete', `/api/admin/remove-user/${item.user_id || item.course_id}`)} className="bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20}/></button>
                        )}
                     </td>
                   </tr>
                 )) : (
                   <tr><td colSpan="3" className="p-24 text-center font-black uppercase text-slate-300 italic tracking-[0.3em]">No Pending Requests</td></tr>
                 )}
               </tbody>
             </table>
          </div>
        )}

        {/* 3. DATABASE VIEW */}
        {(activeTab === "all_students" || activeTab === "all_instructors") && (
          <UserManagement roleType={activeTab === "all_students" ? "STUDENT" : "INSTRUCTOR"} />
        )}

        {/* 4. CREDIT VIEW */}
        {activeTab === "credits" && <CreditManagement />}
      </main>
    </div>
  );
}

// UI HELPERS
function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-4 w-full px-6 py-5 rounded-2xl transition-all ${active ? "bg-slate-900 text-white shadow-2xl scale-[1.02] font-black" : "text-slate-900 hover:bg-slate-100 font-bold"} text-[11px] uppercase tracking-widest`}>
      {icon} {label}
    </button>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group flex flex-col justify-between">
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-slate-50 ${color} group-hover:bg-slate-900 group-hover:text-white transition-all`}>{icon}</div>
       <div>
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
         <h4 className="text-4xl font-black tracking-tighter text-slate-900">{value || 0}</h4>
       </div>
    </div>
  );
}