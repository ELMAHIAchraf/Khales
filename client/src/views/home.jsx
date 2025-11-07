import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import GroupForm from '../components/groupForm.jsx'
import { JoinGroupForm } from '../components/joinGroupForm.jsx'
import ListOfJoinedGroups from '../components/ListOfJoinedGroups.jsx'
import SimpleModal from '../components/SimpleModal.jsx'
import OutingForm from '../components/outingForm.jsx'

export const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState(null);
  const [groups, setGroups] = useState([]);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [signupInfo, setSignupInfo] = useState({ username: "", password: "" });
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Fetch groups for the user
  const fetchGroups = () => {
    let userId = null;
    try {
      const userCookie = document.cookie.match(new RegExp('(^| )user=([^;]+)'));
      if (userCookie) {
        const user = JSON.parse(decodeURIComponent(userCookie[2]));
        userId = user.id;
      }
    } catch (e) {}
    if (!userId) return;
    fetch(`http://localhost:3000/userGroups/${userId}`)
      .then(res => res.json())
      .then(data => setGroups(data.groups || []));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Show signup popup if redirected from signup with credentials
  useEffect(() => {
    if (location.state && location.state.username && location.state.password) {
      setSignupInfo({
        username: location.state.username,
        password: location.state.password,
      });
      setShowSignupPopup(true);
      window.history.replaceState({}, document.title); // Remove state after showing
    }
  }, [location.state]);

  const handleOpenPopup = (type) => {
    setShowPopup(true);
    setPopupContent(type);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupContent(null);
  };

  const handleCloseSignupPopup = () => {
    setShowSignupPopup(false);
    setSignupInfo({ username: "", password: "" });
  };

  // Callback for when a group is created or joined
  const handleGroupChange = () => {
    fetchGroups();
    handleClosePopup();
  };

  const handleLogout = async () => {
    await fetch("http://localhost:3000/logout", { method: "POST", credentials: "include" });
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/");
  };

  return (
    <div>
      <div className="flex gap-4 justify-center my-6">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          onClick={() => handleOpenPopup('create')}
        >
          Create Group
        </button>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          onClick={() => handleOpenPopup('join')}
        >
          Join Group
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => {
            if (groups.length === 0) {
              alert("Vous devez d'abord créer ou rejoindre un groupe.");
              return;
            }
            const selectedGroup = groups[0]; // par exemple
            
            setSelectedGroupId(selectedGroup.name);
            handleOpenPopup('outing');
          }}
        >
          Ajouter sortie
        </button>
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <SimpleModal open={showPopup} onClose={handleClosePopup}>
        {popupContent === 'create' && <GroupForm onSuccess={handleGroupChange} />}
        {popupContent === 'join' && <JoinGroupForm onSuccess={handleGroupChange} />}
        {popupContent === 'outing' && <OutingForm groups={groups} onSuccess={handleGroupChange}/>}
      </SimpleModal>

      <SimpleModal open={showSignupPopup} onClose={handleCloseSignupPopup}>
        <div className="text-center">
          <h2 className="text-lg font-bold mb-2">Account Created!</h2>
          <div className="mb-2">
            <span className="font-semibold">Username:</span> {signupInfo.username}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Password:</span> {signupInfo.password}
          </div>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
            onClick={handleCloseSignupPopup}
          >
            Close
          </button>
        </div>
      </SimpleModal>

      <ListOfJoinedGroups groups={groups} />
    </div>
  )
}