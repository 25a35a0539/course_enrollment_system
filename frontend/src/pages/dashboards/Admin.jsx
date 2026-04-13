import React, { useState, useEffect } from "react";
import { 
  Users, UserCheck, BookOpen, LayoutDashboard, 
  LogOut, Star, CheckCircle, Trash2, ShieldCheck, Loader2, Award, Database, X, Eye
} from "lucide-react";
import API from "../../api/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import CreditManagement from "../../components/admin/CreditManagement";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); 
  const [stats, setStats] = useState({});
  const [listData, setListData] = useState([]);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null); // 🚩 NEW: User Details State

  const fetchStats = async () => {
    try {
      const res = await API.get("/api/admin/dashboard-stats");
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchDataForTab = async (tab) => {
    if (tab === "overview" || tab === "credits") {
      setLoading(false); return;
    }

    setLoading(true);
    try {
      let endpoint = "";
      if (tab === "instructors") endpoint = "/api/admin/pending-instructors";
      else if (tab === "courses") endpoint = "/api/admin/pending-courses";
      else if (tab === "certificates") endpoint = "/api/admin/pending-certificates";
      else if (tab === "all_courses") endpoint = "/api/admin/all-courses";
      else if (tab === "all_students") endpoint = "/api/admin/all-users?role=STUDENT";
      else if (tab === "all_instructors") endpoint = "/api/admin/all-users?role=INSTRUCTOR";
      
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

  const handleAction = async (method, url, itemId, body = {}) => {
    setProcessingId(itemId);
    try {
      const res = await API[method](url, body);
      alert(res.data.message);
      fetchStats();
      fetchDataForTab(activeTab);
    } catch (err) { alert(err.response?.data?.error || "Operation Failed"); }
    setProcessingId(null);
  };

  const viewCourseDetails = async (courseId) => {
    try {
      const res = await API.get(`/api/admin/course-details/${courseId}`);
      setSelectedCourseDetails(res.data);
    } catch (err) { alert("Failed to fetch course details"); }
  };

  // 🚩 NEW: Fetch User Details Function
  const viewUserDetails = async (userId) => {
    try {
      const res = await API.get(`/api/admin/user-details/${userId}`);
      setSelectedUserDetails(res.data);
    } catch (err) { alert("Failed to fetch user details"); }
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = "/login"; };

  if (loading && activeTab === "overview") return <div className="h-screen flex items-center justify-center font-black animate-pulse text-blue-600 tracking-widest uppercase">EDUADMIN SYSTEM BOOTING...</div>;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col sticky top-0 h-screen shadow-sm z-30">
        <div className="flex items-center gap-3 mb-12 px-2 font-black text-2xl tracking-tighter uppercase italic text-slate-900">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">A</div>
          EduAdmin
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          <SidebarItem active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<LayoutDashboard size={20}/>} label="Overview" />
          <SidebarItem active={activeTab === "instructors"} onClick={() => setActiveTab("instructors")} icon={<UserCheck size={20}/>} label="Instructor Queue" />
          <SidebarItem active={activeTab === "courses"} onClick={() => setActiveTab("courses")} icon={<BookOpen size={20}/>} label="Course Requests" />
          <SidebarItem active={activeTab === "certificates"} onClick={() => setActiveTab("certificates")} icon={<Award size={20}/>} label="Cert Queue" />
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Platform Data</div>
          <SidebarItem active={activeTab === "all_students"} onClick={() => setActiveTab("all_students")} icon={<Users size={20}/>} label="All Students" />
          <SidebarItem active={activeTab === "all_instructors"} onClick={() => setActiveTab("all_instructors")} icon={<ShieldCheck size={20}/>} label="All Instructors" />
          <SidebarItem active={activeTab === "all_courses"} onClick={() => setActiveTab("all_courses")} icon={<Database size={20}/>} label="All Courses" />
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Finances</div>
          <SidebarItem active={activeTab === "credits"} onClick={() => setActiveTab("credits")} icon={<Star size={20}/>} label="Manage Credits" />
        </nav>

        <button onClick={handleLogout} className="mt-4 flex items-center gap-3 px-6 py-4 text-red-600 font-black text-[11px] uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all">
          <LogOut size={20}/> Log Out System
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 mb-2">System Administrator</p>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter text-slate-900">Control Center</h1>
        </header>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <StatCard label="Total Students" value={stats.total_students} icon={<Users size={24}/>} color="text-blue-600" />
            <StatCard label="Active Courses" value={stats.active_courses} icon={<BookOpen size={24}/>} color="text-emerald-600" />
            <StatCard label="Pending Mentors" value={stats.pending_instructors} icon={<UserCheck size={24}/>} color="text-orange-600" />
            <StatCard label="Course Queue" value={stats.pending_courses} icon={<Star size={24}/>} color="text-purple-600" />
            <StatCard label="Pending Certs" value={stats.pending_certificates} icon={<Award size={24}/>} color="text-amber-500" />
          </div>
        )}

        {activeTab !== "overview" && activeTab !== "credits" && (
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden p-2">
             <table className="w-full text-left">
               <thead className="bg-slate-50 border-b border-slate-100">
                 <tr className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                   <th className="p-8">Entity Details</th>
                   <th className="p-8">Status/Context</th>
                   <th className="p-8 text-right">Control Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {listData.length > 0 ? (
                   listData.map((item, idx) => {
                     const currentId = item.user_id || item.course_id || item.enrollment_id;
                     const isProcessing = processingId === currentId;
                     const isCourse = activeTab === "courses" || activeTab === "all_courses";
                     const isUserTab = activeTab === "all_students" || activeTab === "all_instructors";
                     const isCert = activeTab === "certificates";

                     return (
                       <tr key={idx} className="hover:bg-slate-50 border-b border-slate-50 transition-colors">
                         <td className="p-8">
                            <p className="font-black text-sm uppercase text-slate-900">{item.name || item.title || item.student_name}</p>
                            <p className="text-[10px] font-bold text-slate-600 uppercase">{item.email || (item.course_title ? `Course: ${item.course_title}` : "ID: " + currentId)}</p>
                         </td>
                         <td className="p-8">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-black uppercase tracking-tight">
                              {item.status || item.instructor || (isCert ? "READY TO ISSUE" : "VERIFIED")}
                            </span>
                         </td>
                         <td className="p-8 text-right flex justify-end gap-2">
                            {isProcessing ? (
                              <button className="bg-slate-100 p-3 rounded-xl cursor-not-allowed w-[44px] h-[44px] flex items-center justify-center">
                                <Loader2 size={20} className="animate-spin text-slate-400"/>
                              </button>
                            ) : (
                              <>
                                {activeTab === "instructors" && (
                                  <button onClick={() => handleAction('post', `/api/admin/approve-instructor/${item.user_id}`, currentId)} className="bg-emerald-600 text-white p-3 rounded-xl hover:shadow-lg"><CheckCircle size={20}/></button>
                                )}
                                {activeTab === "courses" && (
                                  <button onClick={() => {
                                    const creds = prompt("Assign Credits:", "50");
                                    if(creds) handleAction('post', `/api/admin/approve-course/${item.course_id}`, currentId, { credits: parseInt(creds) });
                                  }} className="bg-blue-600 text-white p-3 rounded-xl hover:shadow-lg"><CheckCircle size={20}/></button>
                                )}
                                
                                {/* 🚩 View Button Enabled for Both Courses AND Users */}
                                {(isCourse || isUserTab) && (
                                  <button onClick={() => {
                                    if (isCourse) viewCourseDetails(item.course_id);
                                    if (isUserTab) viewUserDetails(item.user_id);
                                  }} className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600"><Eye size={20}/></button>
                                )}

                                {isCert && (
                                  <button onClick={() => handleAction('post', `/api/admin/issue-certificate/${item.enrollment_id}`, currentId)} className="bg-amber-500 text-white p-3 rounded-xl hover:bg-amber-600"><Award size={20}/></button>
                                )}
                                
                                {!isCert && (
                                  <button onClick={() => {
                                    const deleteUrl = isCourse ? `/api/admin/remove-course/${item.course_id}` : `/api/admin/remove-user/${item.user_id}`;
                                    if(window.confirm("Complete Data Wipe? Action cannot be undone.")) handleAction('delete', deleteUrl, currentId);
                                  }} className="bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-600 hover:text-white"><Trash2 size={20}/></button>
                                )}
                              </>
                            )}
                         </td>
                       </tr>
                     );
                   })
                 ) : (
                   <tr><td colSpan="3" className="p-24 text-center font-black uppercase text-slate-300 italic tracking-[0.3em]">No Records Found</td></tr>
                 )}
               </tbody>
             </table>
          </div>
        )}

        {activeTab === "credits" && <CreditManagement />}
      </main>

      {/* 🚩 MODALS SECTION */}
      <AnimatePresence>
        
        {/* Course Details Modal */}
        {selectedCourseDetails && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[40px] p-10 max-w-4xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar">
                <button onClick={() => setSelectedCourseDetails(null)} className="absolute top-8 right-8 p-2 bg-slate-100 rounded-full text-slate-500 hover:text-red-600 transition-colors"><X size={24}/></button>
                <h2 className="text-3xl font-black uppercase italic mb-2 text-slate-900">{selectedCourseDetails.title}</h2>
                <p className="text-slate-500 font-medium mb-8 pr-12">{selectedCourseDetails.description}</p>
                
                <div className="grid md:grid-cols-2 gap-10">
                   <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2"><BookOpen size={14}/> Curriculum Lessons ({selectedCourseDetails.lessons.length})</h3>
                      <div className="space-y-2">
                        {selectedCourseDetails.lessons.map((l, i) => (
                           <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                              <p className="font-bold text-sm text-slate-800">{i+1}. {l.title}</p>
                              <span className="text-[10px] font-black text-slate-400 uppercase">{l.duration}m</span>
                           </div>
                        ))}
                      </div>
                   </div>
                   <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-4 flex items-center gap-2"><Award size={14}/> Assessment Quizzes ({selectedCourseDetails.quizzes.length})</h3>
                      <div className="space-y-4">
                        {selectedCourseDetails.quizzes.map((q, i) => (
                           <div key={i} className="p-6 border-2 border-slate-100 rounded-3xl bg-slate-50/50">
                              <p className="font-black text-slate-900 uppercase text-xs mb-2">Quiz #{i+1}</p>
                              <div className="flex gap-4">
                                 <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600">QUESTIONS: {q.questions_count}</div>
                                 <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600">MARKS: {q.total_marks}</div>
                              </div>
                           </div>
                        ))}
                        {selectedCourseDetails.quizzes.length === 0 && <p className="p-10 text-center font-bold text-slate-300 italic uppercase text-xs">No Quizzes Added</p>}
                      </div>
                   </div>
                </div>
            </motion.div>
          </div>
        )}

     {/* 🚩 NEW: User Details Modal (Crash-Proofed & Expanded) */}
        {selectedUserDetails && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[40px] p-10 max-w-2xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar">
                <button onClick={() => setSelectedUserDetails(null)} className="absolute top-8 right-8 p-2 bg-slate-100 rounded-full text-slate-500 hover:text-red-600 transition-colors"><X size={24}/></button>
                
                <div className="flex items-center gap-6 mb-8 border-b border-slate-100 pb-8">
                   <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-lg shrink-0">
                      {selectedUserDetails.name ? selectedUserDetails.name[0].toUpperCase() : 'U'}
                   </div>
                   <div>
                      <h2 className="text-3xl font-black uppercase italic text-slate-900">{selectedUserDetails.name}</h2>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{selectedUserDetails.email}</p>
                      <span className={`mt-2 inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${selectedUserDetails.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                        {selectedUserDetails.status}
                      </span>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                   {/* General Details */}
                   <div className="space-y-6">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                         <p className="font-bold text-slate-900">{selectedUserDetails.phone || "Not Provided"}</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined Date</p>
                         <p className="font-bold text-slate-900">{selectedUserDetails.joined_at}</p>
                      </div>

                      {/* Instructor Specific - Bottom Left */}
                      {selectedUserDetails.expertise !== undefined && ( 
                         <>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expertise</p>
                              <p className="font-bold text-slate-900">{selectedUserDetails.expertise || "Not specified"}</p>
                           </div>
                         </>
                      )}
                   </div>

                   {/* Role Specific Details - Right Column */}
                   <div className="space-y-4">
                      
                      {/* 🚩 Student Specific (Rich Stats) */}
                      {selectedUserDetails.skills !== undefined && ( 
                         <>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Skills</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                 {/* 🛡️ Safely render skills array */}
                                 {Array.isArray(selectedUserDetails.skills) && selectedUserDetails.skills.length > 0 ? (
                                   selectedUserDetails.skills.map((s, i) => (
                                     <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold">{s}</span>
                                   ))
                                 ) : (
                                   <span className="text-xs font-bold text-slate-400">No skills added</span>
                                 )}
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4 mt-6">
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Courses</p>
                                 <p className="font-black text-emerald-600 text-2xl">{selectedUserDetails.completed_courses || 0} <span className="text-xs text-slate-400">/ {selectedUserDetails.total_enrolled || 0}</span></p>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Badges</p>
                                 <p className="font-black text-blue-600 text-2xl">{selectedUserDetails.badges_count || 0}</p>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Certs</p>
                                 <p className="font-black text-amber-500 text-2xl">{selectedUserDetails.certs_count || 0}</p>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Streak</p>
                                 <p className="font-black text-orange-500 text-2xl">{selectedUserDetails.current_streak || 0}</p>
                              </div>
                           </div>
                         </>
                      )}
                      
                      {/* Instructor Specific Stats */}
                      {selectedUserDetails.expertise !== undefined && ( 
                         <div className="flex gap-6 mt-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating</p>
                               <p className="font-bold text-orange-500 text-2xl flex items-center gap-1"><Star size={20} className="fill-orange-500"/> {selectedUserDetails.rating || 0}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Credits</p>
                               <p className="font-bold text-blue-600 text-2xl">{selectedUserDetails.credits || 0}</p>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
                
                {selectedUserDetails.bio && (
                   <div className="mt-8 pt-6 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Biography</p>
                      <p className="text-sm font-medium text-slate-600 italic">{selectedUserDetails.bio}</p>
                   </div>
                )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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