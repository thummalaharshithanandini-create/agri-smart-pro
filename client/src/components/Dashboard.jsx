import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ImageUpload from './ImageUpload';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

import emailjs from 'emailjs-com';

const Dashboard = ({ user }) => {
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [orders, setOrders] = useState([]);
  
  // Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);

  useEffect(() => {
    if (location.state && location.state.welcomeMessage) {
      setToastMessage(location.state.welcomeMessage);
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/orders/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Set up polling to catch new orders (for demo purposes)
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    // Show feedback modal before exporting
    setShowFeedbackModal(true);
    setFeedbackError('');
    setFeedbackSuccess(false);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackText('');
    setFeedbackSuccess(false);
    setFeedbackError('');
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      setFeedbackError('Please fill the feedback properly');
      return;
    }
    
    setFeedbackError('');
    setIsExporting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/email/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feedbackText: feedbackText,
          farmerName: user?.name || 'Farmer',
          scanData: lastScanResult
        })
      });

      if (!response.ok) throw new Error('Failed to send email');
      
      setFeedbackSuccess(true);
      setToastMessage('Report & Feedback successfully sent to the Admin team!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Email Export Error:', err);
      setFeedbackError('Failed to send feedback. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Dynamic stats state
  const [stats, setStats] = useState({
    totalScans: 142,
    healthyCrops: 98,
    diseasedCrops: 44,
  });

  const handleNewScan = (result) => {
    setLastScanResult(result);
    const isHealthy = result.diseaseName === 'Healthy'; // Assuming this logic or similar
    setStats(prev => ({
      totalScans: prev.totalScans + 1,
      healthyCrops: prev.healthyCrops + (isHealthy ? 1 : 0),
      diseasedCrops: prev.diseasedCrops + (isHealthy ? 0 : 1)
    }));
  };

  // Chart Data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Daily Crop Scans',
        data: [12, 19, 15, 25, 22, 30, 19],
        borderColor: '#10B981', // Growth Green
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1F2937',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
        }
      },
    },
  };

  return (
    <div className="space-y-10 relative">
      
      {/* Welcome Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-8 bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-lg shadow-xl flex items-center space-x-3 z-50 animate-fade-in-up">
          <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p className="font-bold text-sm">{toastMessage}</p>
        </div>
      )}

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Farmer Dashboard</h2>
          <p className="mt-2 text-gray-500 font-medium">Welcome back. Here's your agricultural overview for today.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className={`mt-4 md:mt-0 bg-white border-2 border-gray-200 text-gray-700 font-bold py-2 px-6 rounded-xl transition-all shadow-sm flex items-center ${
            isExporting ? 'opacity-75 cursor-wait' : 'hover:border-emerald-500 hover:text-emerald-600'
          }`}
        >
          {isExporting ? (
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          )}
          {isExporting ? 'Sending Report...' : 'Export Report'}
        </button>
      </div>

      {/* Vibrant Stats Overview Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Scans Card - Bright Blue */}
        <div className="bg-[#3B82F6] rounded-3xl p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-blue-100 font-semibold text-sm uppercase tracking-wider mb-1">Total Scans</p>
              <h3 className="text-5xl font-black">{stats.totalScans}</h3>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-6 flex items-center text-sm font-medium text-blue-100">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            <span>+12% from last month</span>
          </div>
        </div>

        {/* Healthy Crops Card - Vibrant Green */}
        <div className="bg-[#10B981] rounded-3xl p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 -mb-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-emerald-100 font-semibold text-sm uppercase tracking-wider mb-1">Healthy Crops</p>
              <h3 className="text-5xl font-black">{stats.healthyCrops}</h3>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <div className="mt-6 flex items-center text-sm font-medium text-emerald-100">
            <div className="w-full bg-emerald-700/50 rounded-full h-1.5 mr-2">
              <div className="bg-white h-1.5 rounded-full" style={{ width: '69%' }}></div>
            </div>
            <span>69% Healthy</span>
          </div>
        </div>

        {/* Diseased Crops Card - Urgent Orange */}
        <div className="bg-[#F97316] rounded-3xl p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-orange-100 font-semibold text-sm uppercase tracking-wider mb-1">Diseased Crops</p>
              <h3 className="text-5xl font-black">{stats.diseasedCrops}</h3>
            </div>
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-6 flex items-center text-sm font-medium text-orange-100 bg-orange-600/50 inline-block px-3 py-1 rounded-lg backdrop-blur-sm">
            Action Needed
          </div>
        </div>

      </section>

      {/* Chart Section */}
      <section className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100 mt-8">
        <div className="mb-6">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Scan Activity</h3>
          <p className="text-gray-500 font-medium mt-1">Weekly overview of crop scans processed.</p>
        </div>
        <div className="w-full h-72">
          <Line data={chartData} options={chartOptions} />
        </div>
      </section>

      {/* Upload Zone */}
      <section>
        <ImageUpload onNewScan={handleNewScan} />
      </section>

      {/* Recent Orders Section */}
      {orders.length > 0 && (
        <section className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100 mt-8 animate-fade-in-up">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                <svg className="w-7 h-7 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                My Recent Orders
              </h3>
              <p className="text-gray-500 font-medium mt-1">Track your pesticide deliveries.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="border-2 border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-amber-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{order.productName.split(': ')[1] || order.productName}</h4>
                    <p className="text-sm font-medium text-gray-500">Qty: {order.quantity} | Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end w-full md:w-auto">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${
                      order.status === 'Processing' ? 'bg-blue-500 animate-pulse' :
                      order.status === 'Delivered' ? 'bg-emerald-500' :
                      'bg-amber-500'
                    }`}></span>
                    {order.status}
                  </span>
                  <p className="font-black text-gray-900 mt-2 text-right">{order.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up relative">
            <button onClick={closeFeedbackModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            {feedbackSuccess ? (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Sent Successfully!</h3>
                <p className="text-emerald-700 font-medium bg-emerald-50 p-4 rounded-xl mb-6">
                  Your feedback is sent successfully and the owner will review it shortly.
                </p>
                <button 
                  onClick={closeFeedbackModal}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black text-gray-900 mb-2">How did we do?</h3>
                <p className="text-gray-500 font-medium mb-4">Before we email your report, please let us know if the AI diagnosis was helpful.</p>
                
                <textarea 
                  rows="4"
                  value={feedbackText}
                  onChange={(e) => {
                    setFeedbackText(e.target.value);
                    if (feedbackError) setFeedbackError('');
                  }}
                  placeholder="Your feedback helps us improve the AI..."
                  className={`w-full px-4 py-3 mb-2 rounded-xl bg-gray-50 border ${feedbackError ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-500'} focus:bg-white focus:ring-4 outline-none transition-all font-medium`}
                ></textarea>
                
                {feedbackError && (
                  <p className="text-red-500 text-sm font-bold mb-4 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    {feedbackError}
                  </p>
                )}

                <button 
                  onClick={submitFeedback}
                  disabled={isExporting}
                  className={`w-full text-white font-black py-4 rounded-xl shadow-xl transition-all flex items-center justify-center mt-2 ${isExporting ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 transform hover:-translate-y-1'}`}
                >
                  {isExporting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                      Send Report & Feedback
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
