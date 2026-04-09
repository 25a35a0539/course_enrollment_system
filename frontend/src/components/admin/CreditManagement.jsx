import React, { useState, useEffect } from "react";
import { Send, CheckSquare, Square, Users } from "lucide-react";
import API from "../../api/axiosInstance";

export default function CreditManagement() {
  const [instructors, setInstructors] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    API.get("/api/admin/all-users?role=INSTRUCTOR").then(res => setInstructors(res.data));
  }, []);

  // 🚩 SELECT ALL LOGIC
  const handleSelectAll = () => {
    if (selectedIds.length === instructors.length) setSelectedIds([]);
    else setSelectedIds(instructors.map(i => i.user_id));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) return alert("SELECT AT LEAST ONE INSTRUCTOR!");
    await API.post("/api/admin/manage-credits", { user_ids: selectedIds, amount });
    alert(`SUCCESS: ${amount} Credits updated for ${selectedIds.length} members`);
    setAmount(0); setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-[40px] p-10 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">Credit Terminal</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Bulk Action: {selectedIds.length} Selected</p>
        </div>
        
        <div className="flex gap-4 mt-6 md:mt-0">
          <button onClick={handleSelectAll} className="bg-slate-800 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-700 hover:bg-slate-700">
            {selectedIds.length === instructors.length ? "Deselect All" : "Select All"}
          </button>
          <input 
            type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value))}
            className="bg-slate-800 p-4 rounded-2xl w-24 text-center font-black text-xl outline-none border-2 border-transparent focus:border-blue-500"
          />
          <button onClick={handleBulkUpdate} className="bg-blue-600 px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-700">Apply Credits</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {instructors.map(inst => (
          <div 
            key={inst.user_id} 
            onClick={() => toggleSelect(inst.user_id)}
            className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer ${selectedIds.includes(inst.user_id) ? "border-blue-600 bg-blue-50" : "border-slate-100 bg-white hover:border-slate-300"}`}
          >
            <div className="flex justify-between items-center mb-3">
              {selectedIds.includes(inst.user_id) ? <CheckSquare className="text-blue-600" /> : <Square className="text-slate-300" />}
              <span className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded">ID: {inst.user_id}</span>
            </div>
            <p className="font-black uppercase text-sm truncate">{inst.name}</p>
            <p className="text-[10px] font-bold text-slate-400 truncate">{inst.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}