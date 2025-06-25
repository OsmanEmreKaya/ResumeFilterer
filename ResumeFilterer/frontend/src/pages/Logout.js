import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the iduser from localStorage
    localStorage.setItem('iduser', 0);
    
    // Redirect to the start page after logging out
    navigate('/');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-lg font-semibold">Logging you out...</h2>
    </div>
  );
};

export default Logout;
