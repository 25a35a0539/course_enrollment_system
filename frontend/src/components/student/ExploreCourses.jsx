import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axiosInstance";
import { Search, Compass, Clock, Star, PlusCircle, ArrowLeft } from "lucide-react";

export default function ExploreCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/student/explore-courses")
       .then(res => setCourses(res.data))
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await API.post("/api/student/enroll", { course_id: courseId });
      alert("Enrolled Successfully! 🚀");
      setCourses(courses.filter(c => c.id !== courseId)); // Remove from explore list
    } catch (err) { alert(err.response?.data?.message || "Enrollment failed"); }
  };

  if (loading) return <div className="h-screen flex justify-center items-center font-black animate-pulse uppercase">Fetching Catalog...</div>;

  return (
    <div className="min-h-screen bg-white p-12 text-slate-900 font-sans">
      <header className="mb-12 border-b-[3px] border-slate-100 pb-8">
        <button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6 transition-colors">
            <ArrowLeft size={16}/> Return to Dashboard
        </button>
        <p className="text-blue-600 font-black text-[11px] uppercase tracking-[0.4em] mb-2">Learning Paths</p>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter flex items-center gap-4">
          <Compass size={40}/> Explore Catalog
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.length > 0 ? courses.map(course => (
          <div key={course.id} className="border-[3px] border-slate-200 rounded-[35px] p-8 hover:border-blue-600 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-100 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{course.category}</span>
                <span className="flex items-center gap-1 text-[10px] font-black"><Star size={12} className="text-orange-500 fill-orange-500"/> {course.rating.toFixed(1)}</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2 leading-tight">{course.title}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Clock size={14}/> {course.duration} Hours • {course.difficulty}
              </p>
            </div>
            
            <button onClick={() => handleEnroll(course.id)} className="w-full py-4 bg-slate-50 border-[3px] border-slate-100 text-slate-900 rounded-[20px] font-black uppercase text-[11px] tracking-[0.2em] group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all flex justify-center items-center gap-2">
              <PlusCircle size={16}/> Enroll Now
            </button>
          </div>
        )) : (
          <div className="col-span-full p-20 border-[3px] border-dashed border-slate-200 rounded-[40px] text-center font-black text-slate-400 uppercase tracking-widest">
            You've conquered the entire catalog. No new courses available.
          </div>
        )}
      </div>
    </div>
  );
}