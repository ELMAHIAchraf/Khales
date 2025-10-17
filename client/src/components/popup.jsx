import React from "react";

const Popup = ({ open, onClose, username, password }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
        <h2 className="text-xl font-bold mb-4 text-purple-700">Account Created!</h2>
        <div className="mb-2">Username: <span className="font-mono">{username}</span></div>
        <div className="mb-2">Password: <span className="font-mono">{password}</span></div>
        <button
          onClick={onClose}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;