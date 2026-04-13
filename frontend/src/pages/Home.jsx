import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Star, CheckCircle2, Users, BookOpen, 
  MessageSquare, Layout, Shield, X, ChevronRight, Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";



export default function Home() {
  const navigate = useNavigate();
  const hero = "../assets/hero1.png";
  
  // Data States
  const [allCourses, setAllCourses] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [allInstructors, setAllInstructors] = useState([]);
  const [topInstructors, setTopInstructors] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Modal States
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [showAllMentors, setShowAllMentors] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, iRes, tRes] = await Promise.all([
          axios.get("http://127.0.0.1:5000/api/courses"), 
          axios.get("http://127.0.0.1:5000/api/instructors"),
          axios.get("http://127.0.0.1:5000/api/testimonials")
        ]);
        
        // Setup Courses
        setAllCourses(cRes.data);
        setTopCourses(cRes.data.slice(0, 3)); 

        // Setup Mentors (Sort by highest credits, slice top 4)
        const sortedMentors = iRes.data.sort((a, b) => b.credits - a.credits);
        setAllInstructors(sortedMentors);
        setTopInstructors(sortedMentors.slice(0, 4));

        setReviews(tRes.data);
      } catch (err) { 
        console.error("Fetch Error:", err); 
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white relative">
      
      {/* 🟦 NAVIGATION */}
      <nav className="flex items-center justify-between px-6 lg:px-20 py-6 border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-xl z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-200">E</div>
          <span className="text-xl font-bold tracking-tight text-slate-900">EduEnroll</span>
        </div>
        <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
          <a href="#courses" className="hover:text-blue-600 transition">Courses</a>
          <a href="#instructors" className="hover:text-blue-600 transition">Mentors</a>
          <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
        </div>
        <button onClick={() => navigate("/login")} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-sm">
          Login Portal
        </button>
      </nav>

      {/* 🚀 HERO SECTION */}
      <section className="px-6 lg:px-20 py-24 flex flex-col lg:flex-row items-center gap-16 bg-white">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">Engineering Excellence</p>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight text-slate-900">
              Learn Skills <br /> <span className="text-blue-600">That Matter.</span>
            </h1>
            <p className="text-slate-500 text-base font-medium max-w-lg mt-6 leading-relaxed mx-auto lg:mx-0">
              High-quality, actionable guidance for full-stack developers and AI engineers. No sugarcoating, just real-world engineering.
            </p>
          </motion.div>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <button onClick={() => navigate("/register")} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-slate-900 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
              Get Started Now <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 relative w-full max-w-lg">
           <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full blur-3xl -z-10" />
           <img src="https://i.pinimg.com/736x/cf/66/33/cf66334166ddd4c120148dc07c492449.jpg" alt="Coding" className="mx-auto drop-shadow-2xl animate-in zoom-in duration-700" />
        </div>
      </section>

      {/* 📚 COURSES SECTION */}
      <section id="courses" className="px-6 lg:px-20 py-24 bg-slate-50">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Our Curriculum</h2>
            <p className="text-slate-500 font-medium">Brutally honest roadmaps for serious engineers.</p>
          </div>
          <button onClick={() => setShowAllCourses(true)} className="text-sm font-bold text-blue-600 bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2">
            Explore All Courses <ArrowRight size={16}/>
          </button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {topCourses.map(c => (
            <CourseCard key={c.id} course={c} onViewSyllabus={() => setSelectedSyllabus(c)} />
          ))}
        </div>
      </section>

      {/* 🧑‍🏫 MENTORS SECTION (PROFESSIONAL REDESIGN) */}
      <section id="instructors" className="px-6 lg:px-20 py-24 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Top Rated Mentors</h2>
            <p className="text-slate-500 font-medium">Learn directly from the highest-ranked engineers.</p>
          </div>
          <button onClick={() => setShowAllMentors(true)} className="text-sm font-bold text-blue-600 bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2">
            View All Mentors <ArrowRight size={16}/>
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topInstructors.map(mentor => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      </section>


      {/* ⭐ TESTIMONIALS SECTION (Dark Mode Contrast) */}
      <section className="px-6 lg:px-20 py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Watermark */}
        <div className="absolute inset-0 opacity-5 pointer-events-none uppercase font-black text-[12vw] leading-none select-none flex items-center justify-center overflow-hidden">
          FEEDBACK
        </div>
        
        <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
           <div className="space-y-6">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Student Success</p>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">Voices of <br /> Excellence</h2>
              <div className="flex gap-4 items-center mt-8">
                 <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <Users size={24} className="text-blue-400"/>
                 </div>
                 <p className="text-slate-300 text-sm font-medium max-w-[200px]">Join 5,000+ engineers building high-performance systems.</p>
              </div>
           </div>
           
           <div className="space-y-6">
              {reviews.slice(0, 2).map((r, i) => (
                <div key={i} className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-4 backdrop-blur-md hover:bg-white/10 transition-colors">
                  <div className="flex gap-1 text-yellow-400">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={16} fill={idx < r.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="text-lg font-medium leading-relaxed text-slate-100">"{r.comment || "Amazing course! Highly recommended."}"</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">— Verified Alumnus</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 📧 CONTACT SECTION (Modern SaaS Form) */}
      <section id="contact" className="px-6 lg:px-20 py-24 bg-white max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
         <div className="flex-1 space-y-10">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Support & Inquiry</p>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">Let's <br /> Connect</h2>
            </div>
            
            <div className="space-y-8 mt-8">
               <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition-colors shadow-sm group-hover:bg-blue-600 group-hover:text-white">
                     <Shield size={24}/>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Secure Support</p>
                     <p className="text-lg font-bold text-slate-900">support@eduenroll.com</p>
                  </div>
               </div>
               <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition-colors shadow-sm group-hover:bg-blue-600 group-hover:text-white">
                     <MessageSquare size={24}/>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Chat With Us</p>
                     <p className="text-lg font-bold text-slate-900">+91 98765 43210</p>
                  </div>
               </div>
            </div>
         </div>
         
         <div className="flex-[1.5]">
            <form className="bg-slate-50 p-8 md:p-10 rounded-[32px] space-y-6 border border-slate-200 shadow-sm">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Your Full Name</label>
                 <input type="text" placeholder="John Doe" className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none px-5 py-4 rounded-xl text-sm font-semibold transition-all shadow-sm" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                 <input type="email" placeholder="john@example.com" className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none px-5 py-4 rounded-xl text-sm font-semibold transition-all shadow-sm" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Your Message</label>
                  <textarea placeholder="Ask us anything..." className="w-full bg-white border border-slate-200 focus:border-blue-500 outline-none px-5 py-4 rounded-xl text-sm font-semibold h-32 resize-none transition-all shadow-sm" />
               </div>
               <button type="button" onClick={(e) => {e.preventDefault(); alert("Message Sent Successfully! We will get back to you.");}} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-900 transition-colors shadow-md mt-4">
                 Send Message
               </button>
            </form>
         </div>
      </section>

      {/* 🏁 FOOTER */}
      <footer className="px-6 lg:px-20 py-10 bg-slate-900 text-slate-400 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">E</div>
            <span className="text-lg font-bold text-white">EduEnroll</span>
         </div>
         <p className="text-sm font-medium">© 2026 EduEnroll Academy. All rights reserved.</p>
      </footer>


      {/* ===================================================================== */}
      {/* 🚩 MODALS SECTION */}
      {/* ===================================================================== */}
      <AnimatePresence>
        
        {/* 1. SYLLABUS MODAL */}
        {selectedSyllabus && (
          <ModalOverlay onClose={() => setSelectedSyllabus(null)}>
             <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen size={24}/></div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{selectedSyllabus.title}</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Course Syllabus</p>
             </div>
             <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedSyllabus.syllabus && selectedSyllabus.syllabus.length > 0 ? (
                  selectedSyllabus.syllabus.map((lesson, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <span className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">{idx + 1}</span>
                       <p className="font-semibold text-slate-700 text-sm">{lesson}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 font-medium py-10">Syllabus is currently being updated.</p>
                )}
             </div>
          </ModalOverlay>
        )}

        {/* 2. ALL COURSES MODAL */}
        {showAllCourses && (
          <ModalOverlay onClose={() => setShowAllCourses(false)} maxWidth="max-w-5xl">
             <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
               <h3 className="text-3xl font-black text-slate-900">All Available Courses</h3>
               <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-bold">{allCourses.length} Courses</span>
             </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[65vh] overflow-y-auto pr-4 custom-scrollbar">
                {allCourses.map(c => (
                  <CourseCard key={c.id} course={c} onViewSyllabus={() => setSelectedSyllabus(c)} />
                ))}
             </div>
          </ModalOverlay>
        )}

        {/* 3. ALL MENTORS MODAL */}
        {showAllMentors && (
          <ModalOverlay onClose={() => setShowAllMentors(false)} maxWidth="max-w-5xl">
             <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
               <h3 className="text-3xl font-black text-slate-900">Our Expert Mentors</h3>
               <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1"><Award size={16}/> Top Ranked</span>
             </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[65vh] overflow-y-auto pr-4 custom-scrollbar">
                {allInstructors.map(mentor => (
                  <MentorCard key={mentor.id} mentor={mentor} />
                ))}
             </div>
          </ModalOverlay>
        )}

      </AnimatePresence>
    </div>
  );
}

// =====================================================================
// 🛠️ REUSABLE UI COMPONENTS
// =====================================================================

function CourseCard({ course, onViewSyllabus }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 flex flex-col justify-between transition-all">
      <div>
        <div className="flex justify-between items-start mb-4">
           <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">{course.category || "General"}</span>
           <span className="flex items-center gap-1 text-xs font-bold text-slate-700"><Star size={14} className="text-orange-400 fill-orange-400"/> {(course.rating || 0).toFixed(1)}</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight leading-snug text-slate-900 mb-3">{course.title}</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3 mb-6">{course.description}</p>
      </div>
      <button onClick={onViewSyllabus} className="w-full bg-slate-50 text-slate-700 font-bold text-sm py-3.5 rounded-xl hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-center gap-2">
        View Syllabus <BookOpen size={16}/>
      </button>
    </div>
  );
}

function MentorCard({ mentor }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-center flex flex-col items-center">
      <div className="relative mb-4">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-full flex items-center justify-center text-3xl font-black shadow-md border-4 border-white">
          {mentor.name[0].toUpperCase()}
        </div>
        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
          <div className="bg-orange-100 text-orange-600 rounded-full p-1.5"><Award size={14}/></div>
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">{mentor.expertise || "Senior Engineer"}</span>
      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{mentor.name}</h3>
      <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4 px-2">{mentor.bio || "Passionate about building scalable systems and teaching the next generation of engineers."}</p>
      <div className="mt-auto bg-slate-50 border border-slate-100 w-full py-2.5 rounded-xl flex justify-center items-center gap-1.5 text-sm font-bold text-slate-700">
        <Star size={16} className="text-yellow-400 fill-yellow-400" /> {mentor.credits} Credits
      </div>
    </div>
  );
}

function ModalOverlay({ children, onClose, maxWidth = "max-w-md" }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-6"
    >
       <motion.div 
         initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
         className={`bg-white rounded-[32px] p-8 md:p-10 w-full relative shadow-2xl ${maxWidth}`}
       >
           <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors">
              <X size={20}/>
           </button>
           {children}
       </motion.div>
    </motion.div>
  );
}