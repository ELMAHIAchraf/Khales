import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Greet } from '../components/greet.jsx'
import Popup from '../components/Popup.jsx'
import GroupForm from '../components/GroupForm.jsx'

export const Home = () => {
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({});

  useEffect(() => {
    if (location.state && location.state.username && location.state.password) {
      setPopupData({
        username: location.state.username,
        password: location.state.password,
      });
      setShowPopup(true);
    }
  }, [location.state]);

  return (
    <div>
      
      <Popup
        open={showPopup}
        onClose={() => setShowPopup(false)}
        username={popupData.username}
        password={popupData.password}
      />

      <GroupForm/>
    </div>
  )
}