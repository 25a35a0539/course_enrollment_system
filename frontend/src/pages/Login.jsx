import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Eye, EyeOff, LogIn, Home, UserPlus, AlertCircle, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import workIllustration from "../assets/work-from-home.svg";
import API from "../api/axiosInstance";


export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

const handleLogin = async () => {
  if (!form.email || !form.password) {
    setError("Email and Password are required!");
    return;
  }
  setLoading(true);
  try {
    // const res = await axios.post("http://127.0.0.1:5000/auth/login", form);
    const res = await API.post("/auth/login", form);
    // const res = await axios.post("http://127.0.0.1:5000/auth/login", form, {
    //   headers: {
    //     'Content-Type': 'application/json' // 🚩 Add this
    //   },
    //   withCredentials: true // 🚩 Add this for CORS session support
    // });
    
    if (res.status === 200) {
      setSuccess(true);

      // 🚩 CRITICAL FIX: Consistent Key Names
      // Ikkada 'access_token' ane vadali, endukante axiosInstance lo adhe undi
      localStorage.setItem("access_token", res.data.access_token);
      
     
      localStorage.setItem("refresh_token", res.data.refresh_token);
      
      localStorage.setItem("role", res.data.role); 
      localStorage.setItem("user_id", res.data.user_id);

      // 🚩 Redirect Logic
      console.log("TOKEN SAVED:", localStorage.getItem("access_token"));
      console.log("NAVIGATING TO DASHBOARD...");

      if (res.data.role === 'ADMIN') {
        console.log("nav admin dash");
        navigate("/admin/dashboard");
      } else if (res.data.role === 'INSTRUCTOR') {
        navigate("/instructor/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    }
  } catch (err) {
    setError(err.response?.data?.error || "Login Failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans text-slate-900 overflow-hidden">
      
      {/* 🟦 LEFT SIDE: SAME AS REGISTER STYLE */}
      <div className="w-full lg:w-[40%] bg-[#f8faff] flex flex-col items-center justify-center p-10 border-b lg:border-r border-slate-100 min-h-[450px]">
         <div className="text-center space-y-10 w-full max-w-sm">
            
            {/* Logo */}
            <div className="flex items-center justify-center gap-2">
               <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold italic shadow-lg shadow-blue-50">E</div>
               <span className="text-2xl font-bold tracking-tighter">EduEnroll</span>
            </div>

            {/* 🔥 REGISTER LO VAADINA URL E IDHI */}
            <motion.img 
   initial={{ opacity: 0, scale: 0.9 }}
   animate={{ opacity: 1, scale: 1 }}
   src={workIllustration} // Variable ni curly braces lo pettali
   alt="Login Illustration" 
   className="w-64 lg:w-80 mx-auto drop-shadow-md" 
/>

            <div className="space-y-6">
               <div className="space-y-1">
                  <p className="text-slate-900 font-black text-sm tracking-tight uppercase">Welcome Back</p>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] italic">Start your session</p>
               </div>

               {/* 🔥 ACTION BUTTONS */}
               <div className="flex flex-col gap-3 w-full px-6">
                  <button 
                    onClick={() => navigate("/")} 
                    className="flex items-center justify-center gap-3 bg-white text-slate-700 py-3 rounded-xl text-[10px] border border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-all font-black uppercase tracking-widest shadow-sm group"
                  >
                    <Home size={14} className="group-hover:-translate-y-0.5 transition-transform" /> Home
                  </button>
                  <button 
                    onClick={() => navigate("/register")} 
                    className="flex items-center justify-center gap-3 bg-slate-900 text-white py-3 rounded-xl text-[10px] hover:bg-blue-600 transition-all shadow-xl font-black uppercase tracking-widest group"
                  >
                    <UserPlus size={14} className="group-hover:scale-110 transition-transform" /> Register
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* ⬜ RIGHT SIDE: LOGIN FORM */}
      <div className="w-full lg:w-[60%] flex flex-col items-center justify-center p-6 lg:p-20">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-sm space-y-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">LOGIN</h1>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1 italic">Enter your credentials</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-8">
            <UnderlineField label="Email Address" name="email" type="email" placeholder="example@mail.com" onChange={handleChange} value={form.email} />
            <UnderlineField label="Password" name="password" type={showPass ? "text" : "password"} placeholder="••••••••" onChange={handleChange} value={form.password}
              toggle={
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-300 hover:text-blue-600">
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              }
            />
          </div>

          <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 transition shadow-lg shadow-blue-50 flex items-center justify-center gap-3">
            {loading ? "AUTHENTICATING..." : "SIGN IN"} <LogIn size={16} />
          </button>
        </motion.div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
               <CheckCircle2 size={70} className="text-green-500 mx-auto mb-6" />
               <h2 className="text-2xl font-bold tracking-tight uppercase">Success!</h2>
               <p className="text-slate-500 text-sm mt-2 italic font-medium">Authentication successful.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UnderlineField({ label, toggle, ...props }) {
  return (
    <div className="w-full flex flex-col gap-1 group">
      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-1 group-focus-within:text-blue-600 transition-colors">
        {label}
      </label>
      <div className="flex items-center border-b-2 border-black focus-within:border-blue-600 transition-all py-2">
        <input {...props} className="w-full bg-transparent outline-none text-sm font-medium text-slate-800 placeholder:text-slate-100" />
        {toggle}
      </div>
    </div>
  );
}