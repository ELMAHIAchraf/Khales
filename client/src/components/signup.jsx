import React, { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const firstNameRef = useRef(null);
    const lastNameRef = useRef(null);
    const dateOfBirthRef = useRef(null);
    const cityRef = useRef(null);
    const telRef = useRef(null);

    const [response, setResponse] = useState(null);
    const [error, setError] = useState("");
    const navigate= useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setResponse(null);

        const data = {
            firstName: firstNameRef.current.value,
            lastName: lastNameRef.current.value,
            dateOfBirth: dateOfBirthRef.current.value,
            city: cityRef.current.value,
            tel: telRef.current.value
        };

        try {
            const res = await axios.post("http://localhost:3000/signup", data);
            setResponse(res.data);
            navigate('/home')
        } catch (err) {
            setError(err.response?.data?.error || "Signup failed");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-purple-700">Sign Up</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        ref={firstNameRef}
                        name="firstName"
                        placeholder="First Name"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <input
                        ref={lastNameRef}
                        name="lastName"
                        placeholder="Last Name"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <input
                        ref={dateOfBirthRef}
                        name="dateOfBirth"
                        placeholder="Date of Birth (dd/mm/yyyy)"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <input
                        ref={cityRef}
                        name="city"
                        placeholder="City"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <input
                        ref={telRef}
                        name="tel"
                        placeholder="Phone"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button
                        type="submit"
                        className="w-full bg-purple-600 text-white font-semibold py-2 rounded hover:bg-purple-700 transition"
                    >
                        Sign Up
                    </button>
                </form>
                {response && (
                    <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded text-green-800">
                        <div className="font-bold">{response.message}</div>
                        <div>Username: <span className="font-mono">{response.username}</span></div>
                        <div>Password: <span className="font-mono">{response.password}</span></div>
                        <div>{response.groupInfo}</div>
                    </div>
                )}
                {error && (
                    <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded text-red-800">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Signup;