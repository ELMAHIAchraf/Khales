import React, { useState } from "react";
import axios from "axios";

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
};

export const JoinGroupForm = ({ onSuccess }) => {
  const [groupName, setGroupName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  let userId = null;
  try {
    const userCookie = getCookie("user");
    if (userCookie) {
      const user = JSON.parse(userCookie);
      userId = user.id;
    }
  } catch (e) {}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!groupName || !password) {
      setError("Group name and password are required.");
      return;
    }
    if (!userId) {
      setError("User not authenticated.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:3000/joinGroup", {
        groupName,
        password,
        userId
      });
      setMessage(res.data.message);
      setGroupName("");
      setPassword("");
      if (onSuccess) onSuccess(); // <-- Add this line
    } catch (err) {
      const msg = err.response?.data?.error;
      if (msg === "Invalid credentials") {
        setError("Invalid group name or password.");
      } else if (msg === "Group full") {
        setError("This group has reached the maximum number of members.");
      } else if (msg === "You are already a member of this group.") {
        setError("You are already a member of this group.");
      } else {
        setError("Failed to join group.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-8">
      <h3 className="text-lg font-bold mb-2">Join a Group</h3>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={e => setGroupName(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded"
        required
      />
      <input
        type="password"
        placeholder="Group Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded"
        required
      />
      <button
        type="submit"
        className="w-full bg-purple-600 text-white font-semibold py-2 rounded hover:bg-purple-700 transition"
      >
        Join Group
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {message && <div className="text-green-600 mt-2">{message}</div>}
    </form>
  );
};