import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = ({ setUser, initialIsLogin = true }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  // Password Rules: >= 8 chars and contains 1 number
  const isPasswordValid = password.length >= 8 && /\d/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { fullName, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        // Trigger Shake Animation and Error Toast
        setShake(true);
        setTimeout(() => setShake(false), 500); // Remove class after animation
        
        // Use the custom messages from the backend or default fallbacks based on status code
        let errorMessage = data.message || 'Authentication failed';
        if (response.status === 400 && isLogin) {
            errorMessage = data.message || 'Missing Email or Password';
        } else if (response.status === 401 && isLogin) {
            errorMessage = data.message || 'Incorrect Email or Password';
        }
        
        throw new Error(errorMessage);
      }

      // Success
      localStorage.setItem('token', data.token);
      
      // Set global user state
      if (setUser) {
        setUser({ email: data.user.email, name: data.user.fullName });
      }
      
      // Navigate to dashboard with state for toast notification
      navigate('/agrismart/home', { state: { welcomeMessage: isLogin ? 'Welcome back!' : 'Account created successfully!' } });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Left Side: Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/80 to-emerald-900/90 mix-blend-multiply z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop" 
          alt="Lush green farm" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col justify-center px-16 w-full">
          <div className="flex items-center space-x-3 mb-10">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">AgriSmart AI</h1>
          </div>
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            Empowering the <br/><span className="text-emerald-300">Future of Farming.</span>
          </h2>
          <p className="text-xl text-emerald-100/80 font-medium max-w-lg">
            Join thousands of modern farmers using advanced AI to diagnose crop diseases instantly and secure their harvest.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 bg-white relative">
        <div className={`w-full max-w-md mx-auto ${shake ? 'animate-shake' : ''}`}>
          
          {/* Toast Notification */}
          {error && (
            <div className="absolute top-8 right-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50 animate-fade-in-up">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="font-bold text-sm">{error}</p>
            </div>
          )}

          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden flex items-center space-x-2 mb-10 justify-center">
            <div className="bg-emerald-100 p-2 rounded-xl">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-black text-emerald-600 tracking-tight">AgriSmart AI</h1>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-gray-500 font-medium mt-2">
              {isLogin ? 'Enter your details to access your dashboard.' : 'Sign up to start scanning crops.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-gray-800 font-medium placeholder-gray-400"
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-gray-800 font-medium placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">Password</label>
                {isLogin && (
                  <button 
                    type="button"
                    onClick={() => {
                      if (!email) {
                        setError('Please enter your email address first.');
                      } else {
                        setError('');
                        alert(`Password reset instructions have been sent to ${email}`);
                      }
                    }}
                    className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-gray-800 font-medium placeholder-gray-400"
                placeholder="••••••••"
              />
              {!isLogin && !isPasswordValid && password.length > 0 && (
                <p className="text-xs text-red-500 mt-2 font-bold flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Must be at least 8 characters and include 1 number.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isLogin && !isPasswordValid}
              className={`w-full font-bold py-4 px-6 rounded-2xl shadow-xl transition-all transform ${
                !isLogin && !isPasswordValid
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-emerald-500/30 hover:-translate-y-1'
              }`}
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600 font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setPassword('');
              }}
              className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
