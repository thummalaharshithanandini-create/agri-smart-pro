import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [otpInputs, setOtpInputs] = useState({});
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      const res = await fetch('/api/orders/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch all orders', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handlePickup = async (orderId) => {
    setLoadingOrderId(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/pickup`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setToastMessage(`Order Picked Up! (Demo Mode) The OTP is: ${data.otp}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 8000); // Show for 8 seconds so they can read it
        fetchOrders(); // Refresh list
      } else {
        const errData = await res.json();
        setToastMessage(`Error: ${errData.error}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
    } catch (err) {
      console.error('Pickup error:', err);
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handleVerifyOTP = async (orderId) => {
    const otp = otpInputs[orderId];
    if (!otp || otp.length !== 6) {
      setToastMessage('Please enter a 6-digit OTP');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setLoadingOrderId(orderId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/verify`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp })
      });

      if (res.ok) {
        setToastMessage('Success! Order marked as Delivered.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        fetchOrders();
      } else {
        const errData = await res.json();
        setToastMessage(`Error: ${errData.error}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setLoadingOrderId(null);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-8 bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-lg shadow-xl flex items-center space-x-3 z-50 animate-fade-in-up">
          <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p className="font-bold text-sm">{toastMessage}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
          <svg className="w-8 h-8 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
          Delivery Dashboard
        </h2>
        <p className="mt-2 text-gray-500 font-medium">Manage pending pesticide deliveries and send OTPs to farmers.</p>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-all">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === 'Processing' ? 'bg-amber-100 text-amber-700' :
                  order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {order.status}
                </span>
                <span className="text-sm font-black text-gray-900">{order.price}</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{order.productName.split(': ')[1] || order.productName}</h3>
              <p className="text-sm text-gray-500 font-medium mb-4">Quantity: {order.quantity} Acres</p>
              
              <div className="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Farmer Details</p>
                <p className="font-semibold text-gray-800">{order.user?.fullName || 'Unknown'}</p>
                <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress}</p>
              </div>
            </div>

            {order.status === 'Processing' && (
              <button 
                onClick={() => handlePickup(order._id)}
                disabled={loadingOrderId === order._id}
                className={`w-full text-white font-black py-3 rounded-xl shadow-md transition-all flex items-center justify-center ${
                  loadingOrderId === order._id ? 'bg-blue-400 cursor-wait' : 'bg-blue-500 hover:bg-blue-600 transform hover:-translate-y-1'
                }`}
              >
                {loadingOrderId === order._id ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Generating OTP...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                    Pick Up & Send OTP
                  </>
                )}
              </button>
            )}

            {order.status === 'Out for Delivery' && (
              <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 mt-2">
                <p className="text-sm font-bold text-blue-800 mb-2">OTP sent to farmer! Enter to complete delivery:</p>
                <p className="text-xs text-blue-600 mb-3 italic">(Demo Mode Hint: The OTP is <span className="font-black bg-blue-100 px-1 py-0.5 rounded">{order.otp}</span>)</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    maxLength="6"
                    placeholder="6-digit OTP"
                    value={otpInputs[order._id] || ''}
                    onChange={(e) => setOtpInputs({...otpInputs, [order._id]: e.target.value.replace(/\D/g, '')})}
                    className="w-full px-4 py-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-center tracking-widest text-lg"
                  />
                  <button 
                    onClick={() => handleVerifyOTP(order._id)}
                    disabled={loadingOrderId === order._id}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex-shrink-0"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}
            
            {order.status === 'Delivered' && (
              <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold py-3 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Delivered Successfully
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 font-medium bg-white rounded-3xl border border-dashed border-gray-300">
            No orders available for delivery.
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
