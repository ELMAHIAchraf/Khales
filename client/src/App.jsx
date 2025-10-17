import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './views/home.jsx'
import { Auth } from './views/auth.jsx'
import Signup from './components/signup.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
