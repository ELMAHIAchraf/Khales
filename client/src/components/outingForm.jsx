import React, { useState } from "react";
import axios from "axios";

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
};

const OutingForm = ({ groups, onSuccess }) => {
  const [groupName, setGroupName] = useState("");
  const [outingName, setOutingName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!groupName || !outingName || !totalAmount) {
      setError("Tous les champs sont requis.");
      return;
    }

    // Récupération de l'utilisateur
    const userCookie = document.cookie.split('user=')[1];
    if (!userCookie) {
      setError("Utilisateur non authentifié.");
      return;
    }
    const user = JSON.parse(decodeURIComponent(userCookie));

    // Vérifie que le groupe existe et que l'utilisateur est admin
    const group = groups.find(
      g => g.name.trim() === groupName.trim() &&
           g.members.some(m => m.userId === user.id && m.role === "admin")
    );

    if (!group) {
      setError("Nom de groupe invalide ou vous n'êtes pas admin de ce groupe.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/createOuting",
        { groupId: group.id, outingName, totalAmount: parseFloat(totalAmount) },
        { withCredentials: true }
      );
      

      setSuccess(res.data.message);
      setGroupName("");
      setOutingName("");
      setTotalAmount("");
      if (onSuccess) onSuccess(res.data.outing);
    } catch (err) {
      setError(err.response?.data?.error || "Impossible de créer la sortie");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-4">
      <h3 className="text-lg font-bold">Créer une sortie</h3>

      <input
        type="text"
        placeholder="Nom du groupe"
        value={groupName}
        onChange={e => setGroupName(e.target.value)}
        className="w-full px-4 py-2 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Nom de la sortie"
        value={outingName}
        onChange={e => setOutingName(e.target.value)}
        className="w-full px-4 py-2 border rounded"
        required
      />

      <input
        type="number"
        placeholder="Montant total"
        value={totalAmount}
        onChange={e => setTotalAmount(e.target.value)}
        className="w-full px-4 py-2 border rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        Valider sortie
      </button>

      {error && <div className="text-red-600 mt-2">{error}</div>}
      {success && <div className="text-green-600 mt-2">{success}</div>}
    </form>
  );
};

export default OutingForm;
