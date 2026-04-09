import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axiosInstance";
import { User, ArrowLeft, Save, ShieldCheck } from "lucide-react";

export default function StudentProfile() {
  const [formData, setFormData] = useState({ name: "", phone: "", skills: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/student/dashboard-main").then(res => {
      setFormData({
        name: res.data.profile?.name || "",
        phone: res.data.profile?.phone || "",
        skills: res.data.profile?.skills ? res.data.profile.skills.join(", ") : ""
      });
      setLoading(false);
    });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        skills: formData.skills.split(",").map(s => s.trim()) // Convert back to array
      };
      await API.put("/api/student/profile/update", payload);
      alert("Identity Updated Successfully! 🛡️");
      navigate("/student/dashboard");
    } catch (err) { alert("Update failed"); }
  };

  if (loading) return <div className="h-screen flex justify-center items-center font-black animate-pulse uppercase">Decrypting Profile...</div>;

  return (
    <div className="min-h-screen bg-white p-12 text-slate-900 font-sans flex justify-center">
      <div className="max-w-2xl w-full">
        <header className="mb-12 border-b-[3px] border-slate-100 pb-8">
          <button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6 transition-colors">
              <ArrowLeft size={16}/> Return to Dashboard
          </button>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter flex items-center gap-4">
            <User size={40}/> User Database
          </h1>
        </header>

        <form onSubmit={handleUpdate} className="bg-slate-50 border-[4px] border-slate-900 rounded-[40px] p-10 space-y-8 shadow-sm">
          <div className="flex items-center gap-3 bg-blue-100 text-blue-700 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2 border-blue-200">
             <ShieldCheck size={18}/> Secure Edit Mode Active
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
            <input 
              type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-white border-[3px] border-slate-200 p-5 rounded-2xl font-black text-sm outline-none focus:border-blue-600 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Number</label>
            <input 
              type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-white border-[3px] border-slate-200 p-5 rounded-2xl font-black text-sm outline-none focus:border-blue-600 transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Technical Skills (Comma Separated)</label>
            <textarea 
              value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})}
              className="w-full bg-white border-[3px] border-slate-200 p-5 rounded-2xl font-black text-sm outline-none focus:border-blue-600 transition-all min-h-[120px]"
              placeholder="e.g. React, Python, Flask"
            />
          </div>

          <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[20px] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-slate-900 transition-all flex justify-center items-center gap-3">
            <Save size={18}/> Commit Changes
          </button>
        </form>
      </div>
    </div>
  );
}