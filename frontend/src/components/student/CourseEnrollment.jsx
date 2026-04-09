import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axiosInstance';
import { CheckCircle, PlayCircle, Loader2, ArrowLeft } from 'lucide-react';
import QuizModal from './QuizModal'; // Make sure this path is correct!

// 🚩 YOUTUBE EMBED FIXER
const getEmbedUrl = (url) => {
    if (!url) return "";
    try {
        if (url.includes("youtube.com/watch?v=")) {
            const videoId = url.split("v=")[1].split("&")[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (url.includes("youtu.be/")) {
            const videoId = url.split("youtu.be/")[1].split("?")[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
    } catch (e) { return url; }
    return url;
};

export default function CourseViewer() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showQuiz, setShowQuiz] = useState(false);

    const fetchContent = async () => {
        try {
            const res = await API.get(`/api/student/course-content/${courseId}`);
            setContent(res.data);
            if (res.data.lessons.length > 0 && !activeLesson) {
                setActiveLesson(res.data.lessons[0]);
            }
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    useEffect(() => { if (courseId) fetchContent(); }, [courseId]);

    const handleComplete = async (lessonId) => {
        try {
            await API.post('/api/student/complete-lesson', { lesson_id: lessonId, course_id: courseId });
            fetchContent(); 
        } catch (err) { alert("Error updating progress"); }
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-blue-600">LOADING CURRICULUM...</div>;
    if (!content || content.lessons.length === 0) return <div className="p-20 text-center font-black">No lessons found.</div>;

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            {/* SIDEBAR */}
            <div className="w-80 bg-white border-r-[3px] border-slate-200 overflow-y-auto flex flex-col">
                <div className="p-6 border-b-[3px] border-slate-200">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6 transition-colors">
                        <ArrowLeft size={16}/> Back to Dashboard
                    </button>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">Curriculum</h2>
                </div>
                
                <div className="p-4 space-y-2 flex-1">
                    {content.lessons.map((lesson, idx) => (
                        <div 
                            key={lesson.lesson_id} onClick={() => setActiveLesson(lesson)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border-[3px] ${activeLesson?.lesson_id === lesson.lesson_id ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:border-slate-200'}`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Module {idx + 1}</p>
                                    <p className="text-xs font-black uppercase leading-tight pr-2">{lesson.title}</p>
                                </div>
                                {lesson.is_completed ? <CheckCircle size={18} className="text-emerald-500 shrink-0"/> : <PlayCircle size={18} className="text-slate-300 shrink-0"/>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN AREA */}
            <div className="flex-1 p-8 overflow-y-auto flex flex-col">
                <div className="w-full aspect-video bg-slate-900 rounded-[40px] overflow-hidden border-[8px] border-white shadow-sm mb-8 relative">
                    {activeLesson?.url ? (
                        <iframe 
                            width="100%" height="100%" 
                            src={getEmbedUrl(activeLesson.url)} // 🚩 YOUTUBE FIX APPLIED
                            title="Video Player" frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white font-black italic uppercase tracking-widest">No Media URL Provided</div>
                    )}
                </div>

                <div className="flex justify-between items-center bg-white p-8 rounded-[40px] border-[3px] border-slate-200 shrink-0">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic mb-2">{activeLesson?.title}</h1>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{activeLesson?.duration} Min Read/Watch</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {!activeLesson?.is_completed && (
                            <button onClick={() => handleComplete(activeLesson.lesson_id)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 transition-all">
                                Mark Completed ✅
                            </button>
                        )}

                        {content?.current_progress >= 95 && (
                            <button onClick={() => setShowQuiz(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-900 transition-all animate-bounce">
                                Take Final Quiz 🧠
                            </button>
                        )}
                        {content?.current_progress === 100 && (
                            <div className="px-8 py-4 bg-emerald-50 border-[3px] border-emerald-200 text-emerald-700 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                                Course Completed 🏆
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {showQuiz && <QuizModal courseId={courseId} onComplete={() => setShowQuiz(false)} />}
        </div>
    );
}