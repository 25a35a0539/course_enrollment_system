import { useState } from "react";
import axios from "axios";
import { FaUser, FaLock } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/login", {
        email,
        password,
      });

      alert(res.data.message);
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-2xl w-80">
        <h2 className="text-white text-2xl mb-6 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2"
          onChange={(e) => setEmail(e.target.value)}
        />
        <FaUser/>

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2"
          onChange={(e) => setPassword(e.target.value)}
        />
        <FaLock/>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;