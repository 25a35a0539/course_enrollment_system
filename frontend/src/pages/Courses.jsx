import { useEffect, useState } from "react";
import axios from "axios";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/api/courses")
      .then(res => setCourses(res.data));
  }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-10 bg-white min-h-screen">

      <h1 className="text-2xl font-bold mb-6">All Courses</h1>

      <input
        className="input mb-6"
        placeholder="Search courses..."
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid md:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.id} className="border p-4 rounded shadow">
            <h3>{c.title}</h3>
            <p>{c.category}</p>

            <button className="btn mt-2">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}