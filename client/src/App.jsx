import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import Profile from './components/Profile';
import DeliveryDashboard from './components/DeliveryDashboard';

function App() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if token exists on load and fetch dynamic profile
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.fullName) {
          setUser({ email: data.email, name: data.fullName });
        } else {
          // Token invalid or expired
          localStorage.removeItem('token');
        }
      })
      .catch(err => console.error('Failed to fetch user', err))
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setShowDropdown(false);
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-emerald-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-xl font-bold text-gray-700 animate-pulse">Authenticating Session...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col ${isAuthPage ? 'bg-white' : 'bg-[#F9FAFB]'}`}>
      {!isAuthPage && (
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            
            {/* Logo & Brand */}
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => navigate('/agrismart/home')}>
              <div className="bg-emerald-100 p-2 rounded-xl group-hover:bg-emerald-200 transition-colors">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-emerald-600">AgriSmart AI</h1>
            </div>

            {/* User Profile & Navigation */}
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 focus:outline-none group"
              >
                <div className="hidden md:block text-right">
                  <p className="text-sm font-bold text-gray-800">{user?.name || 'Farmer'}</p>
                  <p className="text-xs font-medium text-emerald-600">Head Farmer</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FBBF24] to-amber-500 text-white font-bold flex items-center justify-center text-lg shadow-md group-hover:shadow-lg transition-all transform group-hover:-translate-y-0.5 border-2 border-white">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'F'}
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 animate-fade-in-up">
                  <button 
                    onClick={() => { setShowDropdown(false); navigate('/profile'); }} 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors font-medium"
                  >
                    Profile Settings
                  </button>
                  <button 
                    onClick={() => { setShowDropdown(false); navigate('/delivery'); }} 
                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-bold flex items-center justify-between"
                  >
                    Delivery Dashboard
                    <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Staff</span>
                  </button>
                  <div className="h-px bg-gray-100 my-2"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}
      
      <main className={`flex-grow w-full mx-auto ${isAuthPage ? '' : 'max-w-7xl py-10 px-4 sm:px-6 lg:px-8'}`}>
        <Routes>
          <Route path="/login" element={<Auth setUser={setUser} initialIsLogin={true} />} />
          <Route path="/signup" element={<Auth setUser={setUser} initialIsLogin={false} />} />
          <Route path="/agrismart/home" element={
            localStorage.getItem('token') ? <Dashboard user={user} /> : <Navigate to="/login" replace />
          } />
          <Route path="/profile" element={
            localStorage.getItem('token') ? <Profile /> : <Navigate to="/login" replace />
          } />
          <Route path="/delivery" element={
            localStorage.getItem('token') ? <DeliveryDashboard /> : <Navigate to="/login" replace />
          } />
          <Route path="/" element={<Navigate to={localStorage.getItem('token') ? "/agrismart/home" : "/login"} replace />} />
        </Routes>
      </main>

      {!isAuthPage && (
        <footer className="bg-white border-t border-gray-200 mt-auto py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-500 font-medium text-sm">
              &copy; {new Date().getFullYear()} AgriSmart AI. Empowering Modern Farming.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
