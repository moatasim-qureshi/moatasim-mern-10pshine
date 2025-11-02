import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebookSquare, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";



const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
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
    <div
      className="min-h-screen flex items-center justify-center bg-white-100"
      style={{
        backgroundSize: "cover",
      }}
    >
      <div className="bg-black bg-opacity-60">
        {isMobile ? (
          // Mobile Version
          <div className="relative w-full max-w-md mx-auto">
            <div className="bg-black my-4 text-white flex items-center justify-center w-full">
              <h2 className="text-4xl font-bold">
                {isLogin ? "WELCOME BACK!" : "HELLO THERE!"}
              </h2>
            </div>

            <div className="bg-white border-2 border-black rounded-lg shadow-lg overflow-hidden">
              <form className="w-full p-4" onSubmit={handleSubmit}>
                {isLogin ? (
                  <>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <h2 className="text-3xl font-bold mb-4">Login</h2>

                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-black text-white font-bold py-2 rounded hover:bg-primary"
                    >
                      Login
                    </button>

                    <div className="flex justify-center mt-4">
                      <FaFacebookSquare className="w-8 h-8 mx-2 cursor-pointer" />
                      <FcGoogle className="w-8 h-8 mx-2 cursor-pointer" />
                      <FaApple className="w-8 h-8 mx-2 cursor-pointer" />
                    </div>

                    <p className="text-center text-sm mt-4">
                      Don't have an account?{" "}
                      <span
                        onClick={toggleForm}
                        className="text-blue-500 cursor-pointer hover:underline"
                      >
                        Sign Up
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <h2 className="text-3xl font-bold mb-4">Sign Up</h2>

                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-black text-white font-bold py-2 rounded hover:bg-primary"
                    >
                      Sign Up
                    </button>

                    <p className="text-center text-sm mt-4">
                      Already have an account?{" "}
                      <span
                        onClick={toggleForm}
                        className="text-blue-500 cursor-pointer hover:underline"
                      >
                        Login
                      </span>
                    </p>
                  </>
                )}
              </form>
            </div>
          </div>
        ) : (
          // ✅ Desktop Version (kept same structure as yours)
          <div className="relative w-full max-w-[900px] h-[600px] bg-black border-2 border-black rounded-lg shadow-lg overflow-hidden flex">
            <div
              className={`w-1/2 h-full bg-white flex flex-col justify-center items-center px-8 transition-transform duration-700 ease-in-out z-20 ${
                isLogin ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <h2 className="text-3xl font-bold mb-4">
                {isLogin ? "Login" : "Sign Up"}
              </h2>
              <form className="w-full" onSubmit={handleSubmit}>
                {isLogin ? (
                  <>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-black text-white font-bold py-2 rounded hover:bg-primary"
                    >
                      Login
                    </button>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                  
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-black text-white font-bold py-2 rounded hover:bg-primary"
                    >
                      Sign Up
                    </button>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                  </>
                )}
              </form>
            </div>

            <div
              className={`w-1/2 h-full flex items-center justify-center text-center px-8 transition-transform duration-700 ease-in-out bg-black text-white z-10 ${
                isLogin ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="relative">
                <h2 className="text-4xl font-bold mb-2">
                  {isLogin ? "WELCOME BACK!" : "HELLO THERE!"}
                </h2>
                <p className="text-lg mb-4">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </p>
                <button
                  className="bg-transparent border-2 border-white text-white font-bold py-2 px-6 rounded"
                  onClick={toggleForm}
                >
                  {isLogin ? "Sign Up" : "Login"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
