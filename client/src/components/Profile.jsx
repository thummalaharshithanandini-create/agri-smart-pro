import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile details');
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-10 w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
        Error loading profile: {error}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        
        <div className="px-8 pb-8 relative flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="absolute -top-12 border-4 border-white w-24 h-24 rounded-full bg-gradient-to-tr from-[#FBBF24] to-amber-500 text-white font-black flex items-center justify-center text-4xl shadow-xl">
            {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'F'}
          </div>
          
          <div className="mt-16 w-full">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{user?.fullName || 'Farmer'}</h2>
            <p className="text-lg font-medium text-emerald-600 mt-1">Head Farmer</p>
          </div>

          <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
              <p className="text-lg font-semibold text-gray-800">{user?.email}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Member Since</p>
              <p className="text-lg font-semibold text-gray-800">
                {user?.date ? new Date(user.date).toLocaleDateString() : 'Today'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
