import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axiosInstance";
import { 
  LayoutDashboard, BookOpen, Award, Flame, User, LogOut, 
  CheckCircle, Play, Star, Compass, MessageSquare, ChevronRight,
  Clock, PlusCircle, Download, ShieldCheck, ArrowLeft, Save, Send,
  Hexagon, Lock, Sparkles, BrainCircuit, Trophy, SearchX
} from "lucide-react";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview"); 
  const [selectedCourseId, setSelectedCourseId] = useState(null); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadDashboardData = () => {
    setLoading(true);
    API.get("/api/student/dashboard-main")
       .then(res => setData(res.data))
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
  };

  useEffect(() => { loadDashboardData(); }, []);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const switchTab = (tab, courseId = null) => {
    if (tab === 'overview') loadDashboardData(); 
    setActiveTab(tab);
    if (courseId) setSelectedCourseId(courseId);
    window.scrollTo(0, 0); 
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-semibold text-blue-600 animate-pulse">Loading Portal...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50/50 text-slate-900 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-200 flex flex-col p-6 bg-white z-10 sticky top-0 h-screen shadow-sm">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-200">E</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">EduEnroll</h1>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
          <SidebarLink icon={<LayoutDashboard size={18}/>} label="Overview" active={activeTab === 'overview'} onClick={() => switchTab('overview')} />
          <SidebarLink icon={<User size={18}/>} label="My Profile" active={activeTab === 'profile'} onClick={() => switchTab('profile')} />
          
          <div className="pt-6 pb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Learning</div>
          <SidebarLink icon={<Compass size={18}/>} label="Explore Courses" active={activeTab === 'explore'} onClick={() => switchTab('explore')} />
          <SidebarLink icon={<BookOpen size={18}/>} label="My Courses" active={activeTab === 'courses' || activeTab === 'viewer'} onClick={() => switchTab('courses')} />
          
          <div className="pt-6 pb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Achievements</div>
          <SidebarLink icon={<Hexagon size={18}/>} label="My Badges" active={activeTab === 'badges'} onClick={() => switchTab('badges')} />
          <SidebarLink icon={<Award size={18}/>} label="Certificates" active={activeTab === 'certificates'} onClick={() => switchTab('certificates')} />
          <SidebarLink icon={<BrainCircuit size={18}/>} label="Quiz Results" active={activeTab === 'quiz_results'} onClick={() => switchTab('quiz_results')} />
          
          <div className="pt-6 pb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Feedback</div>
          <SidebarLink icon={<MessageSquare size={18}/>} label="Course Reviews" active={activeTab === 'reviews'} onClick={() => switchTab('reviews')} />
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50 font-semibold text-sm mt-4 p-3 rounded-xl transition-all border border-transparent hover:border-red-100">
          <LogOut size={18}/> Logout
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        {activeTab === 'overview' && <OverviewTab data={data} switchTab={switchTab} />}
        {activeTab === 'explore' && <ExploreTab switchTab={switchTab} />}
        {activeTab === 'courses' && <MyCoursesTab switchTab={switchTab} />}
        {activeTab === 'viewer' && <CourseViewerTab courseId={selectedCourseId} switchTab={switchTab} />}
        {activeTab === 'badges' && <BadgesTab switchTab={switchTab} />}
        {activeTab === 'certificates' && <CertificatesTab switchTab={switchTab} />}
        {activeTab === 'quiz_results' && <QuizResultsTab switchTab={switchTab} />}
        {activeTab === 'profile' && <ProfileTab data={data} switchTab={switchTab} />}
        {activeTab === 'reviews' && <ReviewsTab switchTab={switchTab} />}
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------
// 1. OVERVIEW TAB
// ----------------------------------------------------------------------
function OverviewTab({ data, switchTab }) {
  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 md:p-10 rounded-3xl mb-8 shadow-lg shadow-blue-900/20 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Hello, {data?.user_name} 👋</h2>
           <div className="flex items-center gap-2 text-blue-200 font-medium text-lg">
             <Sparkles size={20}/> <p>{data?.tricky_question}</p>
           </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-4 rounded-2xl flex items-center gap-3 font-semibold shadow-inner shrink-0">
          <Flame size={28} className="text-orange-400"/> 
          <div>
            <p className="text-[10px] text-blue-200 uppercase tracking-widest leading-none">Current Streak</p>
            <p className="text-xl leading-none mt-1">{data?.stats?.current_streak} Days</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Enrolled" value={data?.stats?.enrolled} />
        <StatCard label="Completed" value={data?.stats?.completed} />
        <StatCard label="Badges Earned" value={data?.stats?.badges} />
        <StatCard label="Longest Streak" value={data?.stats?.longest_streak} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <Play size={18} className="text-blue-600"/> Jump Back In
          </h3>
          <div className="space-y-3">
            {data?.active_courses?.length > 0 ? data.active_courses.map(c => {
              const currentProgress = c.progress || 0;
              return (
              <div key={c.id} onClick={() => switchTab('viewer', c.id)} className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all">
                <h4 className="font-semibold text-slate-900 mb-3">{c.title}</h4>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                  <div className="bg-blue-600 h-full transition-all duration-1000 rounded-full" style={{ width: `${currentProgress}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                  <span>{currentProgress.toFixed(0)}% Complete</span>
                  <span className="text-blue-600 flex items-center gap-1">Continue <ChevronRight size={14}/></span>
                </div>
              </div>
            )}) : (
              <div className="p-6 border border-dashed border-slate-300 bg-slate-50 rounded-2xl text-center font-medium text-slate-500 text-sm">No active courses found.</div>
            )}
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <Star size={18} className="text-orange-500"/> Recommended For You
          </h3>
          <div className="space-y-3">
            {data?.recommended_courses?.length > 0 ? data.recommended_courses.map(c => (
              <div key={c.id} onClick={() => switchTab('explore')} className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all flex justify-between items-center">
                <div>
                   <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">{c.category || "General"}</span>
                   <h4 className="font-semibold text-slate-900">{c.title}</h4>
                   <p className="text-xs text-slate-500 mt-1">{c.difficulty || "Beginner"}</p>
                </div>
                <ChevronRight size={20} className="text-slate-300"/>
              </div>
            )) : (
              <div className="p-6 border border-dashed border-slate-300 bg-slate-50 rounded-2xl text-center font-medium text-slate-500 text-sm">Explore catalog to find more.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. EXPLORE TAB
// ----------------------------------------------------------------------
function ExploreTab({ switchTab }) {
  const [courses, setCourses] = useState([]);
  
  useEffect(() => { 
    API.get("/api/student/explore-courses")
       .then(res => { setCourses(Array.isArray(res.data) ? res.data : []); })
       .catch(err => console.error(err));
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await API.post("/api/student/enroll", { course_id: courseId });
      alert("Enrolled Successfully! 🚀");
      switchTab('courses'); 
    } catch (err) { alert(err.response?.data?.message || "Enrollment failed"); }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Compass size={32} className="text-blue-600"/> Explore Catalog
        </h1>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all">
              <div>
                <div className="flex justify-between items-start mb-3">
                   <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{course.category || "General"}</span>
                   <span className="flex items-center gap-1 text-xs font-bold text-slate-700"><Star size={14} className="text-orange-400 fill-orange-400"/> {(course.rating || 0).toFixed(1)}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2 mb-2 leading-snug">{course.title}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-2 mb-6">
                  <Clock size={16}/> {course.duration || 0} Hours
                </p>
              </div>
              <button onClick={() => handleEnroll(course.id)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
                <PlusCircle size={18}/> Enroll Now
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 text-center border border-slate-200 rounded-3xl bg-white mt-10">
           <Trophy size={64} strokeWidth={1.5} className="text-yellow-500 mb-4" />
           <h3 className="text-2xl font-bold text-slate-900 mb-2">You Conquered the Catalog!</h3>
           <p className="text-slate-500 max-w-md">There are no new courses left to explore. We need to hire more instructors just for you!</p>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. MY COURSES TAB
// ----------------------------------------------------------------------
function MyCoursesTab({ switchTab }) {
  const [courses, setCourses] = useState([]);
  
  useEffect(() => { 
    API.get("/api/student/enrolled-courses")
       .then(res => { setCourses(Array.isArray(res.data) ? res.data : []); })
       .catch(err => console.error(err));
  }, []);

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <BookOpen size={32} className="text-blue-600"/> My Courses
        </h1>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map(course => {
            const currentProgress = course.progress || 0;
            return (
            <div key={course.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-5">{course.title}</h3>
                <div className="mb-6">
                   <div className="flex justify-between text-xs font-semibold mb-2 text-slate-600">
                      <span>Progress</span>
                      <span className={currentProgress >= 100 ? "text-emerald-600" : "text-blue-600"}>{currentProgress.toFixed(0)}%</span>
                   </div>
                   <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${currentProgress >= 100 ? "bg-emerald-500" : "bg-blue-600"}`} style={{ width: `${currentProgress}%` }}></div>
                   </div>
                </div>
              </div>
              <button onClick={() => switchTab('viewer', course.id)} className={`w-full py-3 rounded-xl font-semibold transition-colors flex justify-center items-center gap-2 ${currentProgress >= 100 ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-blue-600"}`}>
                {currentProgress >= 100 ? <><CheckCircle size={18}/> Review Content</> : <><Play size={18}/> Resume Learning</>}
              </button>
            </div>
          )})}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-slate-300 rounded-3xl bg-white mt-10">
           <SearchX size={64} strokeWidth={1} className="text-slate-400 mb-6" />
           <h3 className="text-2xl font-bold text-slate-900 mb-2">No Active Courses</h3>
           <p className="text-slate-500 mb-6">You haven't enrolled in any courses yet.</p>
           <button onClick={() => switchTab('explore')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700">Go to Explore Catalog</button>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. BADGES TAB
// ----------------------------------------------------------------------
function BadgesTab({ switchTab }) {
  const [badges, setBadges] = useState([]);
  useEffect(() => { API.get("/api/student/badges").then(res => setBadges(res.data)); }, []);

  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Hexagon size={32} className="text-blue-600"/> My Badges
        </h1>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Star className="text-yellow-500 fill-yellow-500"/> Unlocked Achievements</h2>
        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {earnedBadges.map(b => (
              <div key={b.id} className="bg-white border border-blue-200 shadow-md shadow-blue-50 rounded-3xl p-6 flex flex-col items-center text-center transition-all hover:-translate-y-1">
                <img src={b.image_url} alt={b.title} className="w-24 h-24 object-contain mb-4 drop-shadow-xl" />
                <h3 className="text-lg font-bold mb-2 text-slate-900">{b.title}</h3>
                <p className="text-xs font-medium text-slate-500 mb-4">{b.description}</p>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-widest">Earned {b.earned_at}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-slate-300 rounded-2xl bg-slate-50 text-center text-slate-500">You haven't earned any badges yet. Keep learning!</div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Lock className="text-slate-400"/> Available to Earn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {lockedBadges.map(b => (
            <div key={b.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col items-center text-center opacity-80 hover:opacity-100 transition-opacity">
              <div className="relative mb-4">
                 <img src={b.image_url} alt={b.title} className="w-24 h-24 object-contain grayscale opacity-40" />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Lock size={32} className="text-slate-500 drop-shadow-md"/>
                 </div>
              </div>
              <h3 className="text-lg font-bold mb-2 text-slate-600">{b.title}</h3>
              <p className="text-xs font-medium text-slate-500 mb-4">{b.description}</p>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full uppercase tracking-widest">Locked</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. QUIZ RESULTS TAB
// ----------------------------------------------------------------------
function QuizResultsTab({ switchTab }) {
  const [results, setResults] = useState([]);
  useEffect(() => { API.get("/api/student/quiz-results").then(res => setResults(res.data)); }, []);

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <BrainCircuit size={32} className="text-blue-600"/> Quiz Results
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.length > 0 ? results.map((r, idx) => {
          const currentPercent = r.percentage || 0;
          return (
          <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
               <h3 className="text-lg font-bold text-slate-900 mb-2">{r.course_title}</h3>
               <p className="text-sm font-semibold text-slate-500">Score: {r.score || 0} / {r.total_marks || 0}</p>
            </div>
            <div className="flex flex-col items-end">
               <span className={`text-2xl font-black ${r.is_passed ? 'text-emerald-500' : 'text-red-500'}`}>{currentPercent.toFixed(0)}%</span>
               <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mt-1 ${r.is_passed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                 {r.is_passed ? "Passed" : "Failed"}
               </span>
            </div>
          </div>
        )}) : (
          <div className="col-span-full p-12 border border-dashed border-slate-300 rounded-3xl text-center text-slate-500 bg-slate-50">
            No quiz attempts recorded yet. Finish a course to unlock its final quiz!
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 6. COURSE VIEWER TAB
// ----------------------------------------------------------------------
const getEmbedUrl = (url) => {
  if (!url) return "";
  try {
      let videoId = "";
      if (url.includes("youtube.com/watch?v=")) videoId = url.split("v=")[1].split("&")[0];
      else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
      else if (url.includes("youtube.com/embed/")) return url; 
      else return url; 
      return `https://www.youtube.com/embed/${videoId}`;
  } catch (e) { return url; }
};

// ----------------------------------------------------------------------
// 🚩 FIX 3: COURSE VIEWER LOGIC (Remembers completed lessons & Shows Popup)
// ----------------------------------------------------------------------
function CourseViewerTab({ courseId, switchTab }) {
  const [content, setContent] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const fetchContent = () => {
      API.get(`/api/student/course-content/${courseId}`).then(res => {
          setContent(res.data);
          
          if (res.data.lessons.length > 0) {
              // 🚩 FIX: Keep the currently selected lesson active, and update its 'is_completed' status
              setActiveLesson(prev => {
                  if (prev) {
                      const updated = res.data.lessons.find(l => l.lesson_id === prev.lesson_id);
                      return updated || res.data.lessons[0];
                  }
                  return res.data.lessons[0];
              });
          }

          // Trigger Celebration if exactly 100%
          if (res.data.current_progress === 100 && !res.data.celebrated) {
              setShowCelebration(true);
          }
      });
  };

  useEffect(() => { if(courseId) fetchContent(); }, [courseId]);

  const handleComplete = async (lessonId) => {
      await API.post('/api/student/complete-lesson', { lesson_id: lessonId, course_id: courseId });
      fetchContent(); 
  };

  if (!content) return <div className="text-center font-semibold p-20 text-slate-500 animate-pulse">Loading Curriculum...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* CELEBRATION MODAL */}
      {showCelebration && (
         <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
             <div className="bg-white p-12 rounded-3xl text-center shadow-2xl animate-in zoom-in duration-500 max-w-sm">
                 <Trophy size={80} className="text-yellow-500 mx-auto mb-6" />
                 <h2 className="text-4xl font-black text-slate-900 mb-2">100%</h2>
                 <h3 className="text-xl font-bold text-slate-700 mb-6">Course Completed!</h3>
                 <p className="text-sm text-slate-500 mb-8">You have passed all lessons and quizzes. Your certificate is now available.</p>
                 <button onClick={() => { setShowCelebration(false); switchTab('certificates'); }} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700">
                     Claim Certificate 🎓
                 </button>
             </div>
         </div>
      )}

      <div className="flex-[2] flex flex-col gap-4">
        <button onClick={() => switchTab('courses')} className="self-start flex items-center gap-2 font-medium text-sm text-slate-500 hover:text-blue-600 transition-all">
          <ArrowLeft size={16}/> Back to Courses
        </button>
        
        <div className="w-full aspect-video bg-slate-900 rounded-2xl shadow-lg overflow-hidden relative border border-slate-800">
          {activeLesson?.url ? (
             <iframe width="100%" height="100%" src={getEmbedUrl(activeLesson.url)} frameBorder="0" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
          ) : <div className="text-slate-400 flex h-full items-center justify-center font-medium">No Video URL Uploaded</div>}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
           <div>
             <h2 className="text-2xl font-bold text-slate-900">{activeLesson?.title}</h2>
             <p className="text-sm font-medium text-slate-500 mt-1">{activeLesson?.duration || 0} Mins Duration</p>
           </div>
           
           <div className="flex items-center gap-3">
             {/* 🚩 FIX: Dynamic Button State */}
             {!activeLesson?.is_completed ? (
               <button onClick={() => handleComplete(activeLesson.lesson_id)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition-all">
                 Mark Complete ✅
               </button>
             ) : (
               <span className="text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 border border-emerald-200"><CheckCircle size={18}/> Completed</span>
             )}
             
             {/* 🚩 FIX: Show Quiz button if lessons are done (>=95%) AND there are unpassed quizzes */}
             {content?.current_progress >= 95 && content?.has_quiz && !content?.all_quizzes_passed && (
                 <button onClick={() => setShowQuiz(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-slate-800 transition-all animate-pulse">
                   Take Final Quiz 🧠
                 </button>
             )}
           </div>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 h-fit">
        <h3 className="text-lg font-bold mb-4 text-slate-900 border-b border-slate-100 pb-3">Lessons</h3>
        <div className="space-y-2">
          {content.lessons.map((lesson, idx) => (
             <div key={lesson.lesson_id} onClick={() => setActiveLesson(lesson)} className={`p-3 rounded-xl cursor-pointer border transition-all flex justify-between items-center ${activeLesson?.lesson_id === lesson.lesson_id ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}>
                <p className={`font-medium text-sm ${activeLesson?.lesson_id === lesson.lesson_id ? 'text-blue-800' : 'text-slate-700'}`}>{idx+1}. {lesson.title}</p>
                {lesson.is_completed && <CheckCircle size={16} className="text-emerald-500"/>}
             </div>
          ))}
        </div>
      </div>

      {showQuiz && <InternalQuizModal courseId={courseId} onClose={() => { setShowQuiz(false); fetchContent(); }} />}
    </div>
  );
}

function InternalQuizModal({ courseId, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => { API.get(`/api/student/get-quiz/${courseId}`).then(res => setQuestions(res.data)); }, [courseId]);

  const handleSubmit = async () => {
      const res = await API.post('/api/student/submit-quiz', { course_id: courseId, answers: userAnswers });
      setResult(res.data);
  };

  if (result) {
      const currentPercent = result.percentage || 0;
      return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6 z-[200]">
          <div className="bg-white p-10 rounded-3xl text-center shadow-xl max-w-sm w-full">
              <h2 className="text-5xl font-bold mb-3 text-slate-900">{currentPercent.toFixed(0)}%</h2>
              <p className="font-semibold text-lg mb-8 text-slate-600">{result.passed ? "Passed! ✅" : "Failed. Try Again ❌"}</p>
              <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">Close</button>
          </div>
      </div>
  )}

  return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
          <div className="bg-white p-8 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl">
              <h2 className="text-2xl font-bold mb-6 border-b border-slate-100 pb-4 text-slate-900">Knowledge Check</h2>
              {questions.map((q, idx) => (
                  <div key={q.id} className="mb-8">
                      <p className="font-semibold text-lg mb-4 text-slate-800">{idx + 1}. {q.text}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map(opt => (
                              <button key={opt.id} onClick={() => setUserAnswers({...userAnswers, [q.id]: opt.id})}
                                  className={`p-3 rounded-xl text-left font-medium border transition-all text-sm ${userAnswers[q.id] === opt.id ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}>
                                  {opt.text}
                              </button>
                          ))}
                      </div>
                  </div>
              ))}
              <div className="flex justify-end gap-3 mt-4">
                 <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-300 font-semibold rounded-xl text-slate-700 hover:bg-slate-50">Cancel</button>
                 <button onClick={handleSubmit} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">Submit</button>
              </div>
          </div>
      </div>
  );
}

// ----------------------------------------------------------------------
// 7. CERTIFICATES TAB
// ----------------------------------------------------------------------
function CertificatesTab() {
  const [certs, setCerts] = useState([]);
  useEffect(() => { API.get("/api/student/my-certificates").then(res => setCerts(res.data)); }, []);

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <Award size={32} className="text-blue-600"/> My Certificates
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {certs.map(cert => (
          <div key={cert.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">ID: #{cert.id}</p>
              <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">{cert.course_title}</h3>
              <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded inline-block">Issued: {cert.issue_date}</p>
            </div>
            <a href={cert.file_url} target="_blank" rel="noreferrer" download className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
              <Download size={20}/>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 🚩 FIX 2: CRASH-PROOF PROFILE TAB
// ----------------------------------------------------------------------
function ProfileTab({ data, switchTab }) {
  const [formData, setFormData] = useState({ name: "", phone: "", skills: "" });

  useEffect(() => {
    // Safely check if data exists before setting state
    if(data && data.profile) {
      setFormData({
        name: data.profile.name || "",
        phone: data.profile.phone || "",
        skills: Array.isArray(data.profile.skills) ? data.profile.skills.join(", ") : (data.profile.skills || "")
      });
    }
  }, [data]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put("/api/student/profile/update", { 
        name: formData.name,
        phone: formData.phone,
        skills: formData.skills.split(",").map(s => s.trim()).filter(s => s !== "")
      });
      alert("Profile Updated Successfully! 🛡️");
      switchTab('overview');
    } catch (err) { alert("Failed to update profile."); }
  };

  // Safe fallback for Initial extraction
  const userInitial = data?.user_name ? data.user_name.charAt(0).toUpperCase() : "S";

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <User size={32} className="text-blue-600"/> Edit Profile
        </h1>
      </div>

      <form onSubmit={handleUpdate} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 p-4 rounded-xl text-sm font-medium mb-6">
          <ShieldCheck size={18}/> Secure Edit Mode
        </div>

        <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-lg border-4 border-blue-100">
                {userInitial}
            </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600">Full Name</label>
          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-white border border-slate-300 p-3.5 rounded-xl font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600">Phone</label>
          <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-white border border-slate-300 p-3.5 rounded-xl font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600">Skills (Comma Separated)</label>
          <textarea value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="bg-white border border-slate-300 p-3.5 rounded-xl font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all h-28 resize-none" placeholder="e.g. React, Python, Java" />
        </div>
        
        <button type="submit" className="w-full py-4 mt-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
          <Save size={18}/> Save Changes
        </button>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------
// 9. REVIEWS TAB
// ----------------------------------------------------------------------
function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({ rating: 0, comments: "" });

  const fetchReviews = () => { API.get("/api/student/reviews").then(res => setReviews(res.data)); };
  useEffect(() => { fetchReviews(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) return alert("Select a star rating!");
    try {
      await API.post("/api/student/reviews", { course_id: selectedCourse.course_id, ...formData });
      fetchReviews(); setSelectedCourse(null); alert("Feedback Submitted!");
    } catch (err) { alert("Submission failed"); }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <MessageSquare size={32} className="text-blue-600"/> Course Reviews
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {reviews.map(r => (
            <div key={r.course_id} onClick={() => { setSelectedCourse(r); setFormData({ rating: r.rating||0, comments: r.comments||""}); }} className={`bg-white border rounded-2xl p-5 cursor-pointer flex justify-between items-center ${selectedCourse?.course_id === r.course_id ? 'border-blue-600 ring-2 ring-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
               <div>
                 <h3 className="font-bold text-slate-900 mb-1">{r.title}</h3>
                 {r.rating > 0 ? <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle size={14}/> Feedback Given ({r.rating}/5)</span> : <span className="text-xs font-medium text-orange-500">Pending Review</span>}
               </div>
               <ChevronRight size={20} className={selectedCourse?.course_id === r.course_id ? "text-blue-600" : "text-slate-300"}/>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-10 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            {selectedCourse ? (
              <form onSubmit={handleSubmit} className="animate-in fade-in duration-300">
                <h3 className="font-bold text-slate-900 mb-1">Rate Course</h3>
                <p className="text-xs font-medium text-slate-500 mb-6 line-clamp-1">{selectedCourse.title}</p>
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setFormData({ ...formData, rating: star })} className="transition-transform hover:scale-110">
                      <Star size={36} className={`${star <= formData.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-50"}`}/>
                    </button>
                  ))}
                </div>
                <div className="mb-6"><textarea value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:border-blue-500 h-32 resize-none" placeholder="What did you think of this course?" /></div>
                <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex justify-center items-center gap-2"><Send size={16}/> Submit Review</button>
              </form>
            ) : <div className="h-64 flex flex-col items-center justify-center text-center"><Star size={40} className="text-slate-200 mb-4"/><p className="text-sm font-medium text-slate-500">Select a course to leave or edit a review.</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// UI HELPERS
// ----------------------------------------------------------------------
const SidebarLink = ({ icon, label, active = false, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer font-semibold text-sm transition-all ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>{icon} {label}</button>
);
const StatCard = ({ label, value }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-center shadow-sm"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p><p className="text-3xl font-bold text-slate-900">{value || 0}</p></div>
);