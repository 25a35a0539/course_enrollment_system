import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axiosInstance";
import { BookOpen, Play, CheckCircle, ArrowLeft, Clock } from "lucide-react";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/student/enrolled-courses")
       .then(res => setCourses(res.data))
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-screen flex justify-center items-center font-black animate-pulse uppercase">Loading Curriculum...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-12 text-slate-900 font-sans">
      <header className="mb-12 border-b-[3px] border-slate-200 pb-8">
        <button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6 transition-colors">
            <ArrowLeft size={16}/> Return to Dashboard
        </button>
        <p className="text-blue-600 font-black text-[11px] uppercase tracking-[0.4em] mb-2">Active Learning</p>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter flex items-center gap-4">
          <BookOpen size={40}/> My Courses
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {courses.length > 0 ? courses.map(course => (
          <div key={course.id} className="bg-white border-[4px] border-slate-900 rounded-[40px] p-8 flex flex-col justify-between group hover:-translate-y-2 transition-transform shadow-sm">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-100 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{course.category}</span>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400"><Clock size={14}/> {course.duration} Hrs</span>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-6 leading-none">{course.title}</h3>
              
              {/* Progress Bar */}
              <div className="mb-8">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span className="text-slate-400">Progress</span>
                    <span className={course.progress === 100 ? "text-emerald-500" : "text-blue-600"}>{course.progress.toFixed(0)}%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${course.progress === 100 ? "bg-emerald-500" : "bg-blue-600"}`} style={{ width: `${course.progress}%` }}></div>
                 </div>
              </div>
            </div>
            
            <button onClick={() => navigate(`/student/course-viewer/${course.id}`)} className="w-full py-4 bg-slate-900 text-white rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-blue-600 transition-all flex justify-center items-center gap-2">
              {course.progress === 100 ? <><CheckCircle size={16}/> Review Course</> : <><Play size={16}/> Enter Studio</>}
            </button>
          </div>
        )) : (
          <div className="col-span-full p-20 border-[3px] border-dashed border-slate-300 rounded-[40px] text-center font-black text-slate-400 uppercase tracking-widest">
            You are not enrolled in any courses yet. Visit the Explore page!
          </div>
        )}
      </div>
    </div>
  );
}