import React, { useState, useEffect } from "react";
import API from "../../api/axiosInstance";
import { 
  Save, Layout, Video, ListChecks, 
  Plus, Trash2, CheckCircle, User, 
  ArrowLeft, XCircle, RefreshCcw
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Instructor");
  const [loading, setLoading] = useState(true);

  const [course, setCourse] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    difficulty_level: "Beginner",
    lessons: [],
    quizzes: []
  });

  // 1. Fetch Data on Load
  useEffect(() => {
    const storedUser = localStorage.getItem("user_name");
    if (storedUser) setUserName(storedUser);

    const fetchCourseData = async () => {
      try {
        const res = await API.get(`/api/instructor/course-details/${id}`);
        setCourse(res.data);
        setLoading(false);
      } catch (err) {
        alert("Error fetching data! ❌");
        navigate("/instructor/dashboard");
      }
    };
    fetchCourseData();
  }, [id, navigate]);

  // --- Metadata Updates ---
  const updateMetadata = (field, val) => setCourse({ ...course, [field]: val });

  // --- Lessons Logic ---
  const addLesson = () => setCourse({ ...course, lessons: [...course.lessons, { title: "", url: "", duration: "" }] });
  const updateLesson = (idx, field, val) => {
    const newL = [...course.lessons];
    newL[idx][field] = val;
    setCourse({ ...course, lessons: newL });
  };
  const removeLesson = (idx) => setCourse({ ...course, lessons: course.lessons.filter((_, i) => i !== idx) });

  // --- Quizzes Logic ---
  const addQuiz = () => setCourse({ ...course, quizzes: [...course.quizzes, { quiz_title: "", passing_marks: 1, questions: [] }] });
  
  const addQuestion = (qIdx) => {
    const newQuizzes = [...course.quizzes];
    newQuizzes[qIdx].questions.push({ 
      text: "", 
      options: [
        { text: "", is_correct: true }, { text: "", is_correct: false }, 
        { text: "", is_correct: false }, { text: "", is_correct: false }
      ] 
    });
    setCourse({ ...course, quizzes: newQuizzes });
  };

// 🚩 UPDATE QUESTION TEXT
const updateQuestionText = (qIdx, qstIdx, val) => {
    setCourse(prev => {
        const newQuizzes = [...prev.quizzes];
        newQuizzes[qIdx].questions[qstIdx] = { 
            ...newQuizzes[qIdx].questions[qstIdx], 
            text: val 
        };
        return { ...prev, quizzes: newQuizzes };
    });
};

// 🚩 UPDATE OPTION TEXT 
const updateOptionText = (qIdx, qstIdx, oIdx, val) => {
    setCourse(prev => {
        const newQuizzes = [...prev.quizzes];
        const newOptions = [...newQuizzes[qIdx].questions[qstIdx].options];
        newOptions[oIdx] = { ...newOptions[oIdx], text: val };
        newQuizzes[qIdx].questions[qstIdx].options = newOptions;
        return { ...prev, quizzes: newQuizzes };
    });
};

  const toggleCorrectOption = (qIdx, qstIdx, oIdx) => {
    const newQuizzes = [...course.quizzes];
    newQuizzes[qIdx].questions[qstIdx].options.forEach((opt, i) => {
      opt.is_correct = i === oIdx;
    });
    setCourse({ ...course, quizzes: newQuizzes });
  };

  // --- Final Update Submit ---
  const handleUpdate = async () => {
    try {
      await API.put(`/api/instructor/update-course/${id}`, course);
      alert("Course Updated Successfully! 🆙");
      navigate("/instructor/dashboard");
    } catch (err) { alert("Update Error: " + err.response?.data?.error); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <RefreshCcw className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* --- TOP BAR --- */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white p-4 px-8 flex justify-between items-center border-b-2 border-blue-600">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="hover:text-blue-400 transition"><ArrowLeft size={22} /></button>
          <h1 className="text-xl font-black italic uppercase tracking-tighter">STUDIO<span className="text-blue-500">.</span>EDIT</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 border-l-2 border-slate-700 pl-6">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Editor Mode</p>
              <p className="text-sm font-bold tracking-tight">{userName}</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white"><User size={20}/></div>
          </div>
          <button onClick={handleUpdate} className="bg-blue-600 text-white hover:bg-white hover:text-slate-900 px-6 py-2 rounded-lg font-black text-xs transition-all uppercase shadow-lg shadow-blue-500/20">
            Save Changes
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        
        {/* 1. CORE INFO */}
        <section className="mb-16 border-l-4 border-blue-600 pl-8">
          <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-slate-400">01. Update Blueprint</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-10 rounded-3xl border-2 border-slate-200">
            <InputField label="Course Title" value={course.title} onChange={e => updateMetadata('title', e.target.value)} />
            <InputField label="Category" value={course.category} onChange={e => updateMetadata('category', e.target.value)} />
            <InputField label="Duration (Hrs)" type="number" value={course.duration} onChange={e => updateMetadata('duration', e.target.value)} />
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Difficulty</label>
              <select className="border-2 border-slate-900 p-4 rounded-xl font-bold text-sm outline-none bg-white" value={course.difficulty_level} onChange={e => updateMetadata('difficulty_level', e.target.value)}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Course Description</label>
              <textarea className="w-full border-2 border-slate-900 p-4 rounded-2xl h-32 mt-2 outline-none font-medium" value={course.description} onChange={e => updateMetadata('description', e.target.value)} />
            </div>
          </div>
        </section>

        {/* 2. CURRICULUM */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8 border-b-2 border-slate-100 pb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">02. Edit Curriculum</h3>
            <button onClick={addLesson} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2"><Plus size={14}/> Add Lesson</button>
          </div>
          <div className="space-y-4">
            {course.lessons.map((l, i) => (
              <div key={i} className="bg-white border-2 border-slate-900 p-6 rounded-2xl flex flex-wrap md:flex-nowrap gap-4 items-end relative shadow-[6px_6px_0px_0px_rgba(15,23,42,0.05)]">
                <div className="flex-1 min-w-[200px]"><InputField label="Title" value={l.title} onChange={e => updateLesson(i, 'title', e.target.value)} /></div>
                <div className="flex-[2] min-w-[300px]"><InputField label="URL" value={l.url} onChange={e => updateLesson(i, 'url', e.target.value)} /></div>
                <div className="w-24"><InputField label="Min" value={l.duration} onChange={e => updateLesson(i, 'duration', e.target.value)} /></div>
                <button onClick={() => removeLesson(i)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition"><Trash2 size={20}/></button>
              </div>
            ))}
          </div>
        </section>

        {/* 3. QUIZZES */}
        <section className="mb-20">
           <div className="flex justify-between items-center mb-8 border-b-2 border-slate-100 pb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">03. Edit Quizzes</h3>
            <button onClick={addQuiz} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2"><Plus size={14}/> Add New Quiz</button>
          </div>
          
          <div className="space-y-12">
            {course.quizzes?.map((q, qIdx) => (
              <div key={qIdx} className="bg-slate-900 p-8 rounded-[3rem] text-white">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex-1 max-w-md">
                    <input className="bg-transparent border-b-2 border-blue-500 text-xl font-black italic outline-none w-full pb-2" placeholder="Quiz Title" value={q.quiz_title} onChange={e => {
                        const n = [...course.quizzes]; n[qIdx].quiz_title = e.target.value; setCourse({...course, quizzes: n});
                    }}/>
                  </div>
                  <button onClick={() => setCourse({...course, quizzes: course.quizzes.filter((_, i) => i !== qIdx)})} className="text-red-400 p-2 hover:bg-white/10 rounded-full transition"><XCircle/></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {q.questions.map((qst, qstIdx) => (
                    <div key={qstIdx} className="bg-white text-slate-900 p-6 rounded-3xl space-y-4">
                      <input className="w-full border-b-2 border-slate-100 font-bold text-sm pb-2 outline-none focus:border-blue-500" placeholder="Question?" value={qst.text} onChange={e => {
                          const n = [...course.quizzes]; n[qIdx].questions[qstIdx].text = e.target.value; setCourse({...course, quizzes: n});
                      }}/>
                      <div className="space-y-2">
                        {qst.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input className={`flex-1 p-2 rounded-lg text-[11px] font-bold border-2 ${opt.is_correct ? 'border-green-500 bg-green-50' : 'border-slate-100'}`} value={opt.text} onChange={e => {
                                const n = [...course.quizzes]; n[qIdx].questions[qstIdx].options[oIdx].text = e.target.value; setCourse({...course, quizzes: n});
                            }}/>
                            <button onClick={() => toggleCorrectOption(qIdx, qstIdx, oIdx)} className={`p-2 rounded-lg ${opt.is_correct ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300'}`}><CheckCircle size={14}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => addQuestion(qIdx)} className="border-2 border-dashed border-slate-700 rounded-3xl p-8 flex items-center justify-center text-slate-500 font-black text-xs hover:border-blue-500 hover:text-blue-500 transition-all">+ Add Question</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// Reusable Sub-Component
const InputField = ({ label, type = "text", value, onChange }) => (
  <div className="flex flex-col gap-2 w-full text-left">
    <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{label}</label>
    <input type={type} className="border-2 border-slate-900 p-4 rounded-xl font-bold text-slate-700 text-sm outline-none bg-white focus:shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] transition-all" value={value || ""} onChange={onChange} />
  </div>
);

export default EditCourse;