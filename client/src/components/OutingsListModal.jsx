import React, { useEffect, useState } from "react";
import axios from "axios";

const OutingsListModal = ({ open, onClose, group }) => {
    const [outings, setOutings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!open || !group) return;
        setLoading(true);
        axios
            .get(`http://localhost:3000/getOutings/${group.groupId}`)
            .then((res) => {
                setOutings(res.data.outings || []);
                setLoading(false);
            })
            .catch(() => {
                setOutings([]);
                setLoading(false);
            });
    }, [open, group]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    ×
                </button>
                <h2 className="text-xl font-bold mb-4">Liste des sorties</h2>
                {loading ? (
                    <div>Chargement...</div>
                ) : outings.length === 0 ? (
                    <div className="text-gray-500">Aucune sortie trouvée.</div>
                ) : (
                    outings.map((outing, idx) => (
                        <div key={idx} className="mb-6 border-b pb-4">
                            <div className="font-semibold text-lg">{outing.outingName}</div>
                            <div className="text-gray-700 mb-2">Total : {outing.total} €</div>
                            <div>
                                <span className="font-semibold">Dépenses par membre :</span>
                                <ul className="ml-4 mt-1">
                                    {outing.members && outing.members.length > 0 ? (
                                        outing.members.map((member, mIdx) => (
                                            <li key={mIdx}>
                                                Utilisateur {member.userId} : {member.amountSpent} €
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-500 italic">Aucune dépense renseignée.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OutingsListModal;