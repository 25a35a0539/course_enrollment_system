import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Eye, EyeOff, Camera, X, ShieldCheck, Home, LogIn, ChevronRight, CheckCircle2, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 🔴 FLASK BACKEND URL
const API_AUTH_URL = "http://127.0.0.1:5000/auth"; 

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Info, 2: OTP, 3: Profile
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [preview, setPreview] = useState(null);
  
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    password: "", confirmPassword: "",
    role: "STUDENT", bio: "", expertise: "", profile_image: null
  });

  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
  let errs = {};
  
  // Name validation
  if (!form.name.trim()) errs.name = "Name is required";

  // Email validation (Strict Format)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(form.email)) errs.email = "Invalid email format (e.g. name@mail.com)";

  // Phone Validation (Indian Standard + Repeated check)
  const phoneRegex = /^[6-9]\d{9}$/; // Starts with 6,7,8,9 and total 10 digits
  const isRepeated = /^(.)\1{9}$/.test(form.phone); // Checks if all 10 digits are same

  if (!phoneRegex.test(form.phone)) {
    errs.phone = "Must start with 6-9 and be 10 digits";
  } else if (isRepeated) {
    errs.phone = "Invalid phone number (repeated digits)";
  }

  // Password Complexity (1 Upper, 1 Lower, 1 Num, 1 Special Char)
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passRegex.test(form.password)) {
    errs.password = "Need: 8+ chars, Upper, Lower, Number & Special Char (@$!%...)";
  }

  if (form.password !== form.confirmPassword) {
    errs.confirmPassword = "Passwords do not match";
  }
  
  setErrors(errs);
  return Object.keys(errs).length === 0;
};

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
    setApiError(null);
  };

  // 🟦 2. SEND OTP (Step 1 -> 2)
  const handleSendOTP = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    try {
      await axios.post(`${API_AUTH_URL}/send-otp`, { email: form.email });
      setStep(2); // Success aithe OTP screen ki vellu
    } catch (err) {
      setApiError(err.response?.data?.error || "Registration Error");
    } finally {
      setLoading(false);
    }
  };

  // 🟦 3. FINAL REGISTER (Step 3 -> Success)
  const handleFinalRegister = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) return setApiError("Please enter full OTP");

    setLoading(true);
    const formData = new FormData();
    formData.append("email", form.email);
    formData.append("otp", otpCode);
    formData.append("name", form.name);
    formData.append("phone", form.phone);
    formData.append("password", form.password);
    formData.append("role", form.role);
    if (form.profile_image) formData.append("profile_image", form.profile_image);
    
    if (form.role === "STUDENT") {
      formData.append("skills", JSON.stringify(skills));
    } else {
      formData.append("bio", form.bio);
      formData.append("expertise", form.expertise);
    }

    try {
      await axios.post(`${API_AUTH_URL}/verify-register`, formData);
      setShowSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setApiError(err.response?.data?.error || "Invalid OTP or details");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAdd = (e) => {
  if (e.key === 'Enter' && skillInput.trim()) {
    e.preventDefault(); // Form submit avvakunda
    if (!skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
    }
    setSkillInput(""); // 🔥 IDI KADHA NEEKU KAVALSINDI! Field clear ayipothundi.
  }
};

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans text-slate-900 overflow-x-hidden">
      
      {/* 🟦 LEFT SIDE (Top in Mobile) */}
      <div className="w-full lg:w-[40%] bg-[#f8faff] flex flex-col items-center justify-center p-10 border-b lg:border-r border-slate-100">
         <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2">
               <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold italic shadow-lg shadow-blue-50">E</div>
               <span className="text-2xl font-bold tracking-tight">EduEnroll</span>
            </div>
            <img src="https://illustrations.popsy.co/blue/work-from-home.svg" alt="Work" className="w-56 lg:w-72 mx-auto" />
            
          <p className="text-slate-500 font-medium italic text-sm">"Brutally honest guidance for your career."</p>
         <div className="flex flex-row lg:flex-col gap-3 justify-center w-full max-w-[200px] mx-auto">
      <button 
        onClick={() => navigate("/")} 
        className="flex items-center justify-center gap-2 bg-white text-slate-700 px-5 py-3 rounded-xl text-[10px] border border-slate-200 hover:bg-slate-50 transition font-black uppercase tracking-widest shadow-sm w-full"
      >
        <Home size={14}/> Home
      </button>
      <button 
        onClick={() => navigate("/login")} 
        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl text-[10px] hover:bg-blue-700 transition shadow-lg shadow-blue-100 font-black uppercase tracking-widest w-full"
      >
        <LogIn size={14}/> Login
      </button>
    </div>
         </div>
      </div>

      {/* ⬜ RIGHT SIDE (FORM) */}
      <div className="w-full lg:w-[60%] flex flex-col items-center justify-center p-6 lg:p-20 relative">
        <div className="w-full max-w-md">
          
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <AlertCircle size={16} /> {apiError}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* --- STEP 1: GENERAL INFO --- */}
            {step === 1 && (
              <motion.div key="st1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h1 className="text-3xl font-bold">Register</h1>
                <div className="space-y-5">
                  <UnderlineField label="Full Name" name="name" placeholder="James Mathew" onChange={handleChange} value={form.name} error={errors.name} />
                  <UnderlineField label="Email Address" name="email" placeholder="example@gmail.com" onChange={handleChange} value={form.email} error={errors.email} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UnderlineField 
                      label="Password" 
                      name="password" 
                      type={showPass ? "text" : "password"} 
                      placeholder="Abc@1234" 
                      onChange={handleChange} 
                      error={errors.password} 
                      toggle={<button type="button" onClick={()=>setShowPass(!showPass)}>{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>} 
                    />
                    <UnderlineField label="Confirm" name="confirmPassword" type={showPass ? "text" : "password"} placeholder="••••" onChange={handleChange} error={errors.confirmPassword} />
                  </div>
                  <UnderlineField label="Phone" name="phone" placeholder="9876543210" onChange={handleChange} error={errors.phone} />
                </div>

                <div className="flex gap-8 border-b border-slate-100 pb-2">
                    {['STUDENT', 'INSTRUCTOR'].map(r => (
                      <button key={r} onClick={()=>setForm({...form, role: r})} className={`text-[10px] font-black uppercase tracking-widest transition-all pb-2 relative ${form.role === r ? 'text-blue-600' : 'text-slate-400'}`}>
                        {r} {form.role === r && <motion.div layoutId="line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                      </button>
                    ))}
                </div>

                <button onClick={handleSendOTP} disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-50">
                  {loading ? "PROCESSING..." : "GET OTP"}
                </button>
              </motion.div>
            )}

            {/* --- STEP 2: OTP SCREEN --- */}
            {step === 2 && (
              <motion.div key="st2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 text-center">
                 <ShieldCheck size={50} className="mx-auto text-blue-600" />
                 <h2 className="text-2xl font-bold tracking-tight">Verify Email</h2>
                 <div className="flex justify-center gap-2">
                    {otp.map((d, i) => (
                      <input key={i} maxLength="1" className="w-10 h-12 border-b-2 border-black text-center text-xl font-bold focus:border-blue-600 outline-none" 
                        onChange={(e) => {
                          const newOtp = [...otp]; newOtp[i] = e.target.value; setOtp(newOtp);
                          if(e.target.nextSibling && e.target.value) e.target.nextSibling.focus();
                        }} />
                    ))}
                 </div>
                 <button onClick={() => setStep(3)} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xs tracking-widest">
                    CONTINUE TO PROFILE
                 </button>
              </motion.div>
            )}

            {/* --- STEP 3: PROFILE DETAILS --- */}
            {step === 3 && (
              <motion.div key="st3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                 <h2 className="text-2xl font-bold">Complete Profile</h2>
                 <div className="flex items-center gap-5 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <label className="cursor-pointer group">
                      <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center overflow-hidden bg-white transition-all group-hover:border-blue-600">
                        {preview ? <img src={preview} className="w-full h-full object-cover" /> : <Camera size={18} className="text-slate-300"/>}
                      </div>
                      <input type="file" hidden onChange={(e) => {setPreview(URL.createObjectURL(e.target.files[0])); setForm({...form, profile_image: e.target.files[0]})}} />
                    </label>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Upload Picture</span>
                 </div>

                 {form.role === "STUDENT" ? (
                    <div className="space-y-4">
                      {/* <UnderlineField label="Add Skills" placeholder="React, Python..." onChange={(e)=>setSkillInput(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter' && skillInput){setSkills([...skills, skillInput]); setSkillInput("")}}} /> */}
                      <UnderlineField 
                          label="Add Skills (Press Enter)" 
                          placeholder="e.g. React, Python" 
                          value={skillInput} 
                          onChange={(e) => setSkillInput(e.target.value)} 
                          onKeyDown={handleSkillAdd} // Trigger clear logic
                        />
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s, i) => (
                          <span key={i} className="bg-slate-900 text-white px-3 py-1.5 rounded text-[9px] font-bold flex items-center gap-2">{s} <X size={12} className="text-blue-400 cursor-pointer" onClick={()=>setSkills(skills.filter((_, idx)=>idx!==i))}/></span>
                        ))}
                      </div>
                    </div>
                 ) : (
                    <div className="space-y-5">
                      <UnderlineField label="Expertise" name="expertise" placeholder="Web Development" onChange={handleChange} />
                      <UnderlineField label="Bio" name="bio" placeholder="Professional summary" onChange={handleChange} />
                    </div>
                 )}

                 <button onClick={handleFinalRegister} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl">
                    {loading ? "REGISTERING..." : "COMPLETE REGISTRATION"}
                 </button>
                 <button onClick={() => setStep(2)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Back to OTP</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 🎉 SUCCESS MODAL */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-10 rounded-3xl text-center max-w-sm w-full shadow-2xl">
              <CheckCircle2 size={60} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold italic">Success! 🎉</h2>
              <p className="text-slate-500 text-sm mt-2 italic font-medium">Redirecting to login...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function UnderlineField({ label, error, toggle, ...props }) {
  return (
    <div className="w-full flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest px-1">{label}</label>
      <div className={`flex items-center border-b-2 py-2 transition-all ${error ? 'border-red-500' : 'border-black focus-within:border-blue-600'}`}>
        <input {...props} className="w-full bg-transparent outline-none text-sm font-medium" />
        {toggle}
      </div>
      {error && <span className="text-[9px] text-red-500 font-bold uppercase mt-1 italic">{error}</span>}
    </div>
  );
}