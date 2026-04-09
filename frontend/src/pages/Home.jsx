import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Star, CheckCircle2, Users, BookOpen, 
  MessageSquare, Layout, Shield
} from "lucide-react";
import { motion } from "framer-motion";

// Import your images (Solution 2: put in public folder and use path)
const HERO_IMG = "/hero.png"; 

export default function Home() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, iRes, tRes] = await Promise.all([
          axios.get("http://127.0.0.1:5000/api/top-courses"),
          axios.get("http://127.0.0.1:5000/api/instructors"),
          axios.get("http://127.0.0.1:5000/api/testimonials")
        ]);
        setCourses(cRes.data);
        setInstructors(iRes.data);
        setReviews(tRes.data);
      } catch (err) { console.error("Fetch Error:", err); }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* 🟦 NAVIGATION (Same as Register Branding) */}
      <nav className="flex items-center justify-between px-6 lg:px-20 py-8 border-b border-slate-50 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold italic shadow-lg shadow-blue-100">E</div>
          <span className="text-2xl font-black tracking-tighter uppercase">EduEnroll</span>
        </div>
        <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <a href="#courses" className="hover:text-blue-600 transition">Courses</a>
          <a href="#instructors" className="hover:text-blue-600 transition">Mentors</a>
          <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
        </div>
        <button 
          onClick={() => navigate("/login")} 
          className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
        >
          Login Portal
        </button>
      </nav>

      {/* 🚀 HERO SECTION (Clean & Bold) */}
      <section className="px-6 lg:px-20 py-24 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-10 text-center lg:text-left">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 italic underline decoration-2 underline-offset-8">Engineering Excellence</p>
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.95] uppercase italic">
              Learn Skills <br /> <span className="text-blue-600 underline decoration-slate-100">That Matter.</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium max-w-md mt-8 leading-relaxed mx-auto lg:mx-0">
              High-quality, actionable guidance for full-stack developers and AI engineers. No sugarcoating, just real-world engineering.
            </p>
          </motion.div>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <button onClick={() => navigate("/register")} className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-2xl shadow-blue-100 flex items-center gap-3">
              Get Started Now <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
           <div className="absolute inset-0 bg-blue-50 rounded-full blur-3xl -z-10 opacity-60" />
           <motion.img 
             initial={{ opacity: 0, scale: 0.9 }} 
             animate={{ opacity: 1, scale: 1 }} 
             src={HERO_IMG} 
             alt="Hero" 
             className="w-full max-w-lg mx-auto drop-shadow-2xl" 
           />
        </div>
      </section>

      {/* 📚 COURSES (Clean Cards) */}
      <section id="courses" className="px-6 lg:px-20 py-32 bg-[#fcfdfe]">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic underline decoration-blue-600 decoration-4">Our Curriculum</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Brutally honest roadmaps</p>
          </div>
          <button onClick={() => navigate("/courses")} className="text-[10px] font-black uppercase tracking-widest border-b-4 border-slate-900 pb-1 hover:text-blue-600 hover:border-blue-600 transition">Explore All</button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          {courses.map(c => (
            <motion.div whileHover={{ y: -10 }} key={c.id} className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between group">
              <div className="space-y-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-xl font-black italic">0{c.id}</div>
                <h3 className="text-2xl font-black tracking-tight leading-none group-hover:text-blue-600 transition">{c.title}</h3>
                <p className="text-slate-400 text-xs font-bold leading-relaxed">{c.description}</p>
              </div>
              <button className="mt-10 bg-slate-50 text-[10px] font-black uppercase py-4 rounded-xl tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center gap-2">View Syllabus <ArrowRight size={12}/></button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🧑‍🏫 MENTORS SECTION */}
      <section id="instructors" className="px-6 lg:px-20 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic">The Mentors</h2>
          <div className="h-1.5 w-20 bg-blue-600 mx-auto mt-4" />
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {instructors.map((i, idx) => (
            <div key={idx} className="text-center space-y-6">
               <div className="w-48 h-48 bg-slate-100 rounded-full mx-auto overflow-hidden border-[8px] border-slate-50 group">
                  {/* Placeholder for Profile */}
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-4xl font-black italic">
                    {i.name.charAt(0)}
                  </div>
               </div>
               <div className="space-y-1">
                  <p className="text-blue-600 text-[9px] font-black uppercase tracking-[0.2em]">{i.expertise}</p>
                  <h4 className="text-2xl font-black tracking-tight">{i.name}</h4>
                  <p className="text-slate-400 text-[10px] font-bold italic max-w-[200px] mx-auto leading-relaxed mt-2">{i.bio}</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* ⭐ TESTIMONIALS (Clean Layout) */}
      <section className="bg-slate-900 text-white py-32 px-6 lg:px-20 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none uppercase font-black text-[20vw] leading-none select-none italic">FEEDBACK</div>
         <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
               <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Voices of <br /> Success</h2>
               <div className="flex gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10"><Users size={24} className="text-blue-500"/></div>
                  <p className="text-slate-400 text-xs font-bold max-w-[200px]">Join 5,000+ engineers building high-performance systems.</p>
               </div>
            </div>
            <div className="space-y-8">
               {reviews.slice(0, 2).map((r, i) => (
                 <div key={i} className="bg-white/5 p-10 rounded-[40px] border border-white/10 space-y-4">
                   <div className="flex gap-1 text-yellow-500">
                     {[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill={idx < r.rating ? "currentColor" : "none"} />)}
                   </div>
                   <p className="text-lg font-bold italic leading-relaxed">"{r.comment}"</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">— Alumnus, EduEnroll</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* 📧 CONTACT (Underline Form Style) */}
      <section id="contact" className="px-6 lg:px-20 py-32 flex flex-col lg:flex-row gap-20">
         <div className="flex-1 space-y-12">
            <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Let's <br /> Connect</h2>
            <div className="space-y-8">
               <ContactInfo icon={<Shield size={20}/>} label="SECURE SUPPORT" detail="support@eduenroll.com" />
               <ContactInfo icon={<MessageSquare size={20}/>} label="CHAT WITH US" detail="+91 98765 43210" />
            </div>
         </div>
         <div className="flex-1">
            <form className="bg-slate-50 p-12 rounded-[48px] space-y-8 border border-slate-100 shadow-sm">
               <UnderlineInput label="YOUR FULL NAME" placeholder="K. S.T. Ramya Sri" />
               <UnderlineInput label="EMAIL ADDRESS" placeholder="ramya@example.com" />
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">YOUR MESSAGE</label>
                  <textarea placeholder="Ask us anything..." className="w-full bg-transparent border-b-2 border-slate-200 focus:border-blue-600 outline-none py-4 text-sm font-bold h-32 resize-none transition-all" />
               </div>
               <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-blue-100">Send Message</button>
            </form>
         </div>
      </section>

      {/* 🏁 FOOTER */}
      <footer className="px-6 lg:px-20 py-16 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 text-white rounded flex items-center justify-center font-black italic text-[10px]">E</div>
            <span className="text-sm font-black tracking-tighter uppercase">EduEnroll</span>
         </div>
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">© 2026 EDUEPROLL ACADEMY. ALL RIGHTS RESERVED.</p>
         {/* <div className="flex gap-6 text-slate-300">
            <Github size={18} className="hover:text-blue-600 transition cursor-pointer" />
            <Linkedin size={18} className="hover:text-blue-600 transition cursor-pointer" />
            <Twitter size={18} className="hover:text-blue-600 transition cursor-pointer" />
         </div> */}
      </footer>
    </div>
  );
}

// 🛠️ REUSABLE COMPONENTS
function UnderlineInput({ label, ...props }) {
  return (
    <div className="space-y-2 group">
      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-focus-within:text-blue-600 transition-colors">{label}</label>
      <input {...props} className="w-full bg-transparent border-b-2 border-slate-200 focus:border-blue-600 outline-none py-4 text-sm font-bold transition-all placeholder:text-slate-200" />
    </div>
  );
}

function ContactInfo({ icon, label, detail }) {
  return (
    <div className="flex items-center gap-6 group">
       <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
          {icon}
       </div>
       <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-lg font-black tracking-tight">{detail}</p>
       </div>
    </div>
  );
}