import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaStar } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="scroll-smooth">

      {/* 🔥 NAVBAR */}
      <nav className="fixed w-full bg-white shadow z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          <h1 className="font-bold text-xl text-blue-600">EduEnroll</h1>

          <div className="space-x-6 hidden md:block">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#courses">Courses</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="space-x-3">
            <button onClick={() => navigate("/login")} className="text-blue-600">
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-blue-500 text-white px-4 py-1 rounded"
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* 🔵 HERO */}
      <section id="home" className="h-screen flex items-center bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

          <div>
            <h1 className="text-5xl font-bold">
              Learn Online <br /> Build Your Career 🚀
            </h1>

            <p className="mt-4 text-lg">
              Smart course enrollment system to explore and grow skills.
            </p>

            <button
              onClick={() => navigate("/register")}
              className="mt-6 bg-white text-blue-600 px-6 py-2 rounded-full"
            >
              Get Started
            </button>
          </div>

          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
            className="w-80 mx-auto"
          />
        </div>
      </section>

      {/* 🟢 ABOUT */}
      <section id="about" className="py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">
          How We Help Students
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">

          <div className="bg-white p-6 rounded shadow text-center">
            <FaUserGraduate className="text-4xl mx-auto text-blue-500 mb-3" />
            <h3 className="font-semibold">Learn Anytime</h3>
            <p className="text-gray-600">Flexible learning system</p>
          </div>

          <div className="bg-white p-6 rounded shadow text-center">
            <FaChalkboardTeacher className="text-4xl mx-auto text-blue-500 mb-3" />
            <h3 className="font-semibold">Expert Teachers</h3>
            <p className="text-gray-600">Top industry mentors</p>
          </div>

          <div className="bg-white p-6 rounded shadow text-center">
            <FaStar className="text-4xl mx-auto text-blue-500 mb-3" />
            <h3 className="font-semibold">Best Courses</h3>
            <p className="text-gray-600">Real-world skills</p>
          </div>

        </div>
      </section>

      {/* 🔵 COURSES */}
      <section id="courses" className="py-20 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">Our Courses</h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
          {[1,2,3].map((c) => (
            <div key={c} className="bg-gray-100 p-4 rounded shadow">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4149/4149640.png"
                className="h-40 mx-auto"
              />
              <h3 className="mt-4 font-semibold">Course {c}</h3>
              <p className="text-gray-600 text-sm">Learn with projects</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🟣 INSTRUCTORS */}
      <section className="py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">Our Instructors</h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white p-6 rounded shadow text-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                className="w-24 mx-auto mb-3"
              />
              <h3 className="font-semibold">Instructor {i}</h3>
              <p className="text-gray-600 text-sm">Expert in domain</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🟡 TESTIMONIALS */}
      <section className="py-20 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">Testimonials</h2>

        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="text-gray-600 italic">
            "This platform helped me learn skills and land a job!"
          </p>
          <h4 className="mt-4 font-semibold">— Student</h4>
        </div>
      </section>

      {/* 🔴 CONTACT */}
      <section id="contact" className="py-20 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-10">Contact Us</h2>

        <form className="max-w-xl mx-auto bg-white p-6 rounded shadow space-y-4">
          <input className="w-full p-2 border rounded" placeholder="Name" />
          <input className="w-full p-2 border rounded" placeholder="Email" />
          <textarea className="w-full p-2 border rounded" placeholder="Message"></textarea>

          <button className="w-full bg-blue-500 text-white py-2 rounded">
            Send Message
          </button>
        </form>
      </section>

    </div>
  );
}