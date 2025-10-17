import React, { useState } from 'react'
import Signup from '../components/signup'
import Login from '../components/login'

export const Auth = () => {
  const [user, setUser] = useState(null);

  if (user) {
    return <div>Bienvenue {user.firstName} {user.lastName} !</div>
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <Login onLoginSuccess={setUser} />
      <Signup />
    </div>
  )
}