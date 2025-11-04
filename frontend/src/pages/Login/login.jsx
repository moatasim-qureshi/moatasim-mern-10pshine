import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const toggleForm = () => setIsLogin((prev) => !prev);

  const handleResize = () => setIsMobile(window.innerWidth < 768);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:5000/api/users/login", {
          email,
          password,
        });

        localStorage.setItem("user_id", res.data.user.id);
        localStorage.setItem("token", res.data.token);
        Swal.fire("Success!", res.data.message, "success");
        navigate("/Home");
      } else {
        const res = await axios.post("http://localhost:5000/api/users/register", {
          name: username,
          email,
          password,
        });

        Swal.fire("Success!", res.data.message, "success");
        toggleForm();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
      setError(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="relative w-full max-w-[850px] h-[560px] flex border border-gray-800 rounded-3xl overflow-hidden shadow-2xl bg-black/90 backdrop-blur-md">
        <div
          className={`absolute w-1/2 h-full bg-white text-black flex flex-col justify-center items-center px-10 transition-all duration-700 ease-in-out ${
            isLogin ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <h2 className="text-3xl font-semibold mb-6 tracking-wide">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <form className="w-full" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="mb-5">
                <label className="block text-gray-600 text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}
            <div className="mb-5">
              <label className="block text-gray-600 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-8">
              <label className="block text-gray-600 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-all"
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
            {error && (
              <p className="text-red-500 text-center mt-3 text-sm">{error}</p>
            )}
          </form>
        </div>

        
        <div
          className={`absolute w-1/2 h-full flex flex-col justify-center items-center text-center px-10 transition-all duration-700 ease-in-out bg-black text-white ${
            isLogin ? "right-0" : "left-0"
          }`}
        >
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-wide">
              {isLogin ? "HELLO THERE!" : "WELCOME BACK!"}
            </h2>
            <p className="text-gray-300">
              {isLogin
                ? "Don’t have an account yet?"
                : "Already have an account?"}
            </p>
            <button
              onClick={toggleForm}
              className="mt-2 border-2 border-white px-8 py-2 rounded-xl font-semibold hover:bg-white hover:text-black transition-all"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
