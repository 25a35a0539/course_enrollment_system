
import React, { useState, useEffect } from 'react';
import API from '../../api/axiosInstance';
import { Loader2 } from 'lucide-react';

export default function QuizModal({ courseId, onComplete }) {
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get(`/api/student/get-quiz/${courseId}`)
           .then(res => setQuestions(res.data))
           .catch(err => console.error(err))
           .finally(() => setLoading(false));
    }, [courseId]);

    const handleSubmit = async () => {
        if (Object.keys(userAnswers).length !== questions.length) {
            return alert("Please answer all questions before submitting.");
        }
        const res = await API.post('/api/student/submit-quiz', { 
            course_id: courseId, 
            answers: userAnswers 
        });
        setResult(res.data);
    };

    if (loading) return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[200]">
            <Loader2 className="animate-spin text-white" size={48} />
        </div>
    );

    if (result) return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 z-[200]">
            <div className="p-16 text-center bg-white border-4 border-white rounded-[50px] shadow-none max-w-lg w-full animate-in zoom-in duration-300">
                <h2 className="text-6xl font-black italic uppercase text-slate-900 mb-2">{result.percentage}%</h2>
                <p className="font-black uppercase tracking-widest text-xs mb-8">
                    {result.passed ? <span className="text-emerald-500">Validation Passed ✅</span> : <span className="text-red-500">Validation Failed ❌</span>}
                </p>
                <button onClick={onComplete} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-blue-600 transition-all">
                    Acknowledge & Close
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-6 z-[200]">
            <div className="bg-white p-12 border-4 border-slate-200 rounded-[50px] max-w-3xl w-full max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300">
                <div className="flex justify-between items-end mb-10 border-b-4 border-slate-100 pb-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Final Evaluation</p>
                        <h2 className="text-3xl font-black uppercase italic text-slate-900">Knowledge Check</h2>
                    </div>
                    <p className="text-[11px] font-black uppercase text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border-2 border-slate-100">
                        {questions.length} Questions
                    </p>
                </div>
                
                {questions.length === 0 ? (
                    <div className="p-10 text-center font-black uppercase text-slate-300 italic">No Assessment Found</div>
                ) : (
                    <div className="space-y-12 mb-10">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="bg-slate-50 border-2 border-slate-100 p-8 rounded-[35px]">
                                <p className="font-black text-lg mb-6 uppercase text-slate-900">
                                    <span className="text-blue-600 opacity-50 mr-2">{idx + 1}.</span> {q.text}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map(opt => (
                                        <button 
                                            key={opt.id}
                                            onClick={() => setUserAnswers({...userAnswers, [q.id]: opt.id})}
                                            className={`p-5 rounded-[20px] text-left font-black text-xs uppercase tracking-tight border-[3px] transition-all ${userAnswers[q.id] === opt.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:border-blue-300 text-slate-500'}`}
                                        >
                                            {opt.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-4">
                    <button onClick={onComplete} className="flex-1 py-5 bg-white border-[3px] border-slate-200 text-slate-400 rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] hover:border-red-500 hover:text-red-500 transition-all">Cancel</button>
                    <button onClick={handleSubmit} disabled={questions.length===0} className="flex-[2] py-5 bg-slate-900 disabled:opacity-50 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-blue-600 transition-all shadow-none">Submit Assessment 🚀</button>
                </div>
            </div>
        </div>
    );
}