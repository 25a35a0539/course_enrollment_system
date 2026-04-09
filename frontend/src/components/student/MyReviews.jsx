import React, { useEffect, useState } from "react";
import API from "../../api/axiosInstance";
import { ArrowLeft, Star, MessageSquare, Send, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({ rating: 0, comments: "" });
  const navigate = useNavigate();

  const fetchReviews = async () => {
    try {
      const res = await API.get("/api/student/reviews");
      setReviews(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) return alert("Please select a star rating!");
    try {
      await API.post("/api/student/reviews", {
        course_id: selectedCourse.course_id,
        ...formData
      });
      fetchReviews();
      setSelectedCourse(null);
      setFormData({ rating: 0, comments: "" });
    } catch (err) { alert("Submission failed"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic text-2xl animate-pulse">STUDIO.</div>;

  return (
    <div className="min-h-screen bg-white text-[#0a0a0a] font-sans">
      
      {/* --- TOP BAR & BACK BUTTON --- */}
      <header className="h-24 px-12 border-b border-blue-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 border-2 border-blue-50 rounded-2xl flex items-center justify-center hover:border-blue-600 transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-0.5">Academic Feedback</p>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">My Reviews</h1>
          </div>
        </div>
      </header>

      <main className="p-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* COURSE LIST */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8">Enrolled Curriculum</h3>
            <div className="grid grid-cols-1 gap-4">
              {reviews.map((item) => (
                <div 
                  key={item.course_id}
                  onClick={() => setSelectedCourse(item)}
                  className={`p-8 rounded-[35px] border-2 transition-all cursor-pointer flex items-center justify-between group ${
                    selectedCourse?.course_id === item.course_id ? "border-blue-600 bg-blue-50/20" : "border-blue-50 bg-white hover:border-blue-200"
                  }`}
                >
                  <div>
                    <h4 className="font-black text-lg uppercase tracking-tight mb-1">{item.title}</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} fill={s <= item.rating ? "#3b82f6" : "none"} className={s <= item.rating ? "text-blue-600" : "text-slate-200"}/>
                        ))}
                      </div>
                      {item.rating > 0 && <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10}/> Feedback Logged</span>}
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-200 group-hover:text-blue-600 transition-colors"/>
                </div>
              ))}
            </div>
          </div>

          {/* REVIEW FORM PANEL */}
          <div className="lg:col-span-1">
            <div className="sticky top-36 bg-white border-2 border-blue-50 rounded-[45px] p-10 shadow-sm">
              {selectedCourse ? (
                <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="text-center">
                    <h2 className="text-xl font-black uppercase tracking-tighter italic mb-2">Rate Course</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedCourse.title}</p>
                  </div>

                  {/* STAR RATING */}
                  <div className="flex justify-center gap-3 py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="transition-transform hover:scale-125"
                      >
                        <Star 
                          size={32} 
                          fill={star <= formData.rating ? "#3b82f6" : "none"} 
                          className={star <= formData.rating ? "text-blue-600" : "text-blue-50"}
                        />
                      </button>
                    ))}
                  </div>

                  {/* COMMENT BOX */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-2">Comments</label>
                    <textarea 
                      className="w-full bg-blue-50/30 border-2 border-blue-50 rounded-[28px] p-6 text-sm font-bold focus:border-blue-600 outline-none transition-all placeholder:text-slate-300 min-h-[150px]"
                      placeholder="Your feedback helps instructors..."
                      value={formData.comments}
                      onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-black text-white rounded-[24px] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-blue-600 transition-all shadow-xl shadow-blue-50 flex items-center justify-center gap-3"
                  >
                    <Send size={16}/> Submit Review
                  </button>
                </form>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 italic">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-200 mb-6 border-2 border-blue-50 border-dashed">
                    <MessageSquare size={28}/>
                  </div>
                  <p className="text-slate-300 font-bold text-xs uppercase tracking-widest">Select a course to start your review process</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const ChevronRight = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);