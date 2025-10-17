import React, { useRef, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const data = {
      username: usernameRef.current.value,
      password: passwordRef.current.value,
    };

    try {
      const res = await axios.post("http://localhost:3000/login", data, { withCredentials: true });
      // Appel du callback pour mettre à jour l'utilisateur connecté
      if (onLoginSuccess) onLoginSuccess(res.data);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-700">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={usernameRef}
            name="username"
            placeholder="Username"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            ref={passwordRef}
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <p className="mt-4 text-center">
            Pas inscrit ?{' '}
            <Link to="/signup" className="text-blue-500 underline">
                S'inscrire
            </Link>
         </p>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-semibold py-2 rounded hover:bg-purple-700 transition"
          >
            Login
          </button>
        </form>
        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded text-red-800">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;