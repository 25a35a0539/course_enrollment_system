import React, { useState, useEffect } from "react";
import API from "../../api/axiosInstance";
import { Award, CheckCircle } from "lucide-react";

export default function CertificateQueue() {
  const [eligible, setEligible] = useState([]);

  const fetchEligible = async () => {
    // Logic: Fetch enrollments where progress == 100 but no certificate exists
    const res = await API.get("/api/admin/pending-certificates");
    setEligible(res.data);
  };

  const handleIssue = async (enrollId) => {
    await API.post(`/api/admin/issue-certificate/${enrollId}`);
    alert("Certificate Generated & Dispatched! 🎓");
    fetchEligible();
  };

  return (
    <div className="bg-white border-2 border-slate-900 rounded-[32px] overflow-hidden">
      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
        <h2 className="font-black uppercase italic tracking-tighter">Certification Queue</h2>
        <Award size={20} className="text-blue-500" />
      </div>
      <table className="w-full">
        <tbody className="divide-y-2 divide-slate-100">
          {eligible.map((item) => (
            <tr key={item.id} className="hover:bg-blue-50/50">
              <td className="p-4 font-bold text-sm uppercase">{item.student_name}</td>
              <td className="p-4 text-xs font-black text-slate-400 uppercase">{item.course_title}</td>
              <td className="p-4 text-right">
                <button 
                  onClick={() => handleIssue(item.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-slate-900 transition-all"
                >
                  Issue PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}