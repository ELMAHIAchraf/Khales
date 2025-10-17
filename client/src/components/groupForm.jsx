import React, { useState } from "react";
import axios from "axios";

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
};

const GroupForm = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  let creatorId = null;
  try {
    const userCookie = getCookie("user");
    console.log("userCookie:", userCookie);

    if (userCookie) {
    const user = JSON.parse(userCookie);
    console.log(user);

    creatorId = user.id;
    }
  } catch (e) {console.log("error");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || !password) {
      setError("Group name and password are required.");
      return;
    }
    if (!creatorId) {
      setError("User not authenticated.");
      return;
    }
    try {
      const res = await axios.post("http://localhost:3000/createGroup", {
        name,
        password,
        creatorId
      });
      setSuccess(res.data.message);
      setName("");
      setPassword("");
      if (onSuccess) onSuccess(res.data.group);
    } catch (err) {
      setError(err.response?.data?.error || "Group creation failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-8">
      <h3 className="text-lg font-bold mb-2">Create a Group</h3>
      <input
        type="text"
        placeholder="Group Name"
        value={name}
        onChange={e => setName(e.target.value)}
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
        Create Group
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}
    </form>
  );
};

export default GroupForm;