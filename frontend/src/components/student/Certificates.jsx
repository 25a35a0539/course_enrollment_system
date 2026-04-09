import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axiosInstance";
import { Award, Download, ArrowLeft } from "lucide-react";

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/student/my-certificates")
       .then(res => setCerts(res.data))
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-screen flex justify-center items-center font-black animate-pulse uppercase">Verifying Credentials...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-12 text-slate-900 font-sans">
      <header className="mb-12 border-b-[3px] border-slate-200 pb-8">
        <button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6 transition-colors">
            <ArrowLeft size={16}/> Return to Dashboard
        </button>
        <p className="text-emerald-600 font-black text-[11px] uppercase tracking-[0.4em] mb-2">Verified Achievements</p>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter flex items-center gap-4">
          <Award size={40}/> My Certificates
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {certs.length > 0 ? certs.map(cert => (
          <div key={cert.id} className="bg-white border-[4px] border-slate-900 rounded-[40px] p-10 flex items-center justify-between group hover:-translate-y-2 transition-transform">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Cert ID: #{cert.id}</p>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2 leading-none">{cert.course_title}</h3>
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 inline-block px-3 py-1 rounded-lg">Issued: {cert.issue_date}</p>
            </div>
            
            {/* 🚩 Native browser download behavior */}
            <a href={cert.file_url} target="_blank" rel="noreferrer" download className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
              <Download size={24}/>
            </a>
          </div>
        )) : (
          <div className="col-span-full p-20 border-[3px] border-dashed border-slate-300 rounded-[40px] text-center font-black text-slate-400 uppercase tracking-widest">
            No certificates earned yet. Complete a course to 100% and pass the quiz!
          </div>
        )}
      </div>
    </div>
  );
}