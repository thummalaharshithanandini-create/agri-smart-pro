import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ImageUpload = ({ onNewScan }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  
  // State to track which treatment card is currently expanded
  const [expandedCard, setExpandedCard] = useState(null);

  // E-commerce Checkout State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderStatus, setOrderStatus] = useState(null);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setExpandedCard(null); // Reset expanded state on new file
    }
  };

  const handleImageChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleScan = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    
    // Simulate AI Diagnosis
    setTimeout(() => {
      setIsScanning(false);
      const scanResult = {
        cropType: 'Wheat',
        diseaseName: 'Leaf Rust',
        confidence: 96,
        // Restructured treatments to hold rich data for our interactive cards
        treatments: [
          {
            id: 'primary',
            title: 'Primary Solution: Propiconazole 25EC',
            dosage: '200ml per acre mixed in 200 liters of water.',
            safety: 'Wear a mask and protective gloves. Avoid spraying on windy days.',
            price: '₹1,250.00',
            stockStatus: 'In Stock',
            deliveryEstimate: 'FREE delivery by Tomorrow',
            fulfillment: 'Ships from: AgriSmart Fulfillment'
          },
          {
            id: 'alternative',
            title: 'Alternative Solution: Tebuconazole',
            dosage: '250ml per acre. Apply immediately upon spotting rust pustules.',
            safety: 'Highly toxic to aquatic life. Keep away from water sources.',
            price: '₹1,400.00',
            stockStatus: 'Only 3 left in stock - order soon.',
            deliveryEstimate: 'FREE delivery in 2 days',
            fulfillment: 'Ships from: AgriSmart Fulfillment'
          },
          {
            id: 'organic',
            title: 'Organic Option: Neem Oil Extract',
            dosage: '5ml per liter of water. Spray every 7-10 days as a preventative measure.',
            safety: 'Safe for beneficial insects. Can be handled without heavy protective gear.',
            price: '₹450.00',
            stockStatus: 'In Stock',
            deliveryEstimate: 'FREE delivery by Tomorrow',
            fulfillment: 'Ships from: Organic Farms Direct'
          }
        ],
        preventive: 'Implement crop rotation next season. Ensure proper field drainage to reduce humidity, which fuels fungal growth.'
      };

      setResult(scanResult);
      if (onNewScan) onNewScan(scanResult);
    }, 2500);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setExpandedCard(null);
  };

  // Helper function to toggle accordion cards
  const toggleCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleBuyNow = (product, e) => {
    e.stopPropagation(); // Prevent accordion from toggling
    setCheckoutProduct(product);
    setShowCheckoutModal(true);
    setOrderStatus(null);
  };

  const submitOrder = async () => {
    setOrderStatus('processing');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productName: checkoutProduct.title,
          price: checkoutProduct.price,
          quantity: quantity,
          deliveryAddress: deliveryAddress
        })
      });

      if (!response.ok) throw new Error('Order failed');
      
      // Send Email Notification to Admin via Backend API
      try {
        await fetch('http://localhost:5000/api/email/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productName: checkoutProduct.title,
            price: checkoutProduct.price,
            quantity: quantity,
            deliveryAddress: deliveryAddress
          })
        });
      } catch (emailErr) {
        console.error("Email notification failed:", emailErr);
      }

      setOrderStatus('success');
      setTimeout(() => {
        setShowCheckoutModal(false);
        setOrderStatus(null);
        setDeliveryAddress('');
        setQuantity(1);
      }, 2500);
    } catch (err) {
      console.error(err);
      setOrderStatus('error');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100 mt-8">
      <div className="mb-6">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Crop Disease Diagnosis</h3>
        <p className="text-gray-500 font-medium mt-1">Upload a high-quality image of the affected leaf for AI analysis.</p>
      </div>

      {!previewUrl ? (
        <div 
          className={`relative w-full rounded-3xl border-4 border-dashed transition-all duration-300 ease-in-out py-20 flex flex-col items-center justify-center cursor-pointer group overflow-hidden ${
            isDragActive 
              ? 'border-emerald-500 bg-emerald-50' 
              : 'border-gray-200 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Decorative background blob */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-200 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>
          
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer z-10 w-full h-full absolute inset-0 justify-center">
            <div className={`p-5 rounded-full mb-4 transition-all duration-300 shadow-sm ${
              isDragActive ? 'bg-emerald-100 scale-110' : 'bg-white group-hover:bg-emerald-100 group-hover:scale-110'
            }`}>
              <svg className={`h-12 w-12 transition-colors ${isDragActive ? 'text-emerald-600' : 'text-emerald-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className={`text-xl font-bold transition-colors ${isDragActive ? 'text-emerald-700' : 'text-gray-700 group-hover:text-emerald-600'}`}>
              {isDragActive ? 'Drop image here to scan' : 'Click or drag image here'}
            </span>
            <span className="mt-2 text-sm font-medium text-gray-500">Supports JPG, PNG up to 10MB</span>
          </label>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3 max-w-xs relative rounded-xl overflow-hidden border-4 border-gray-100 shadow-md group mx-auto md:mx-0 bg-black">
            <img src={previewUrl} alt="Crop Preview" className={`w-full h-auto object-cover rounded-lg aspect-square transition-all duration-700 ${isScanning ? 'opacity-50 blur-[2px]' : 'bg-gray-50'}`} />
            
            {/* The X-Ray Scanning Laser Effect */}
            {isScanning && (
              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                <div className="w-full h-1 bg-emerald-400 shadow-[0_0_15px_5px_rgba(52,211,153,0.7)] animate-scan"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 to-transparent opacity-50 animate-scan"></div>
              </div>
            )}

            {!isScanning && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-30">
                <button 
                  onClick={handleReset}
                  className="bg-white/95 text-gray-900 hover:text-red-500 hover:bg-white px-4 py-2 rounded-xl font-bold shadow-xl flex items-center transition-all transform hover:scale-105 text-sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Replace
                </button>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-2/3 flex flex-col justify-center">
            {result ? (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Section A: Diagnosis & Confidence */}
                <div className="bg-white border-2 border-emerald-100 p-6 rounded-3xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-gray-900 flex items-center">
                      <svg className="w-6 h-6 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Diagnosis Result
                    </h4>
                    <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-sm font-black shadow-md animate-pulse">
                      {result.confidence}% Match
                    </span>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Detected Crop</p>
                      <p className="text-xl font-black text-gray-900">{result.cropType}</p>
                    </div>
                    <div className="flex-1 bg-orange-50 p-4 rounded-2xl border border-orange-200">
                      <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Disease Issue</p>
                      <p className="text-xl font-black text-orange-600">{result.diseaseName}</p>
                    </div>
                  </div>
                </div>

                {/* Section B: Interactive Treatment Plan */}
                <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-3xl shadow-sm">
                  <h5 className="text-lg font-bold text-yellow-800 uppercase tracking-wider mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    Recommended Solutions
                  </h5>
                  
                  {/* The interactive expandable cards */}
                  <div className="space-y-3">
                    {result.treatments.map((treatment) => (
                      <div 
                        key={treatment.id}
                        // Click logic: Toggles the expanded state of this specific card
                        onClick={() => toggleCard(treatment.id)}
                        className={`border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                          expandedCard === treatment.id 
                            ? 'bg-white border-yellow-400 shadow-md' 
                            : 'bg-white/50 border-yellow-100 hover:border-yellow-300 hover:bg-white'
                        }`}
                      >
                        <div className="p-4 flex justify-between items-center">
                          <span className="font-bold text-gray-800">{treatment.title}</span>
                          {/* Animated chevron based on expanded state */}
                          <svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${expandedCard === treatment.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                        
                        {/* Expanded Content Area (Controlled by state) */}
                        {expandedCard === treatment.id && (
                          <div className="px-4 pb-4 pt-1 border-t border-gray-100 animate-fade-in-up">
                            <div className="mb-3 mt-2">
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Dosage & Application</span>
                              <p className="text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded-lg">{treatment.dosage}</p>
                            </div>
                            <div className="mb-4">
                              <span className="text-xs font-bold text-red-400 uppercase tracking-wider block mb-1">Safety Warning</span>
                              <p className="text-sm font-medium text-red-700 bg-red-50 p-2 rounded-lg">{treatment.safety}</p>
                            </div>
                            
                            {/* Amazon-Style Delivery Section */}
                            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <p className="text-2xl font-black text-gray-900">{treatment.price}</p>
                                <p className={`text-sm font-bold mt-1 ${treatment.stockStatus.includes('left') ? 'text-orange-600' : 'text-emerald-600'}`}>{treatment.stockStatus}</p>
                                <div className="flex items-center text-gray-600 text-sm mt-1">
                                  <svg className="w-4 h-4 mr-1 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                                  <span className="font-medium">{treatment.deliveryEstimate}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{treatment.fulfillment}</p>
                              </div>
                              
                              <button 
                                onClick={(e) => handleBuyNow(treatment, e)}
                                className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-gray-900 font-black py-3 px-6 rounded-xl shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
                              >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                Buy Now
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section C: Preventive Care */}
                <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-md">
                  <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                    Preventive Care & Next Steps
                  </p>
                  <p className="font-medium leading-relaxed">{result.preventive}</p>
                </div>

                {/* Section D: Customer Support */}
                <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-3xl shadow-sm text-center">
                  <h5 className="text-lg font-bold text-blue-900 mb-2">Need Help Understanding This?</h5>
                  <p className="text-blue-700 font-medium mb-4">Our AgriSmart farming experts are ready to explain these solutions over the phone.</p>
                  <a href="tel:+919490925963" className="inline-flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-md">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    Call Customer Care
                  </a>
                  <p className="text-sm font-bold text-blue-500 mt-3">+91 94909 25963</p>
                </div>
                
              </div>
            ) : (
              <div className="bg-gray-50 rounded-3xl border border-gray-100 p-8 h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Ready for Analysis</h4>
                <p className="text-gray-500 font-medium mb-8">Our AI model will analyze this image against thousands of known crop diseases.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prominent Upload & Diagnose Button */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <button
          onClick={handleScan}
          disabled={!previewUrl || isScanning || result}
          className={`text-lg font-black px-12 py-5 rounded-2xl shadow-xl transition-all transform w-full md:w-auto inline-flex items-center justify-center ${
            !previewUrl || result
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isScanning
                ? 'bg-emerald-400 text-white cursor-wait'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 hover:-translate-y-1 hover:shadow-2xl'
          }`}
        >
          {isScanning ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Image...
            </>
          ) : result ? (
            <>
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Diagnosis Complete
            </>
          ) : (
            'Upload and Diagnose 🌱'
          )}
        </button>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up relative">
            <button onClick={() => setShowCheckoutModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            {orderStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Order Confirmed!</h3>
                <p className="text-gray-500 font-medium">Your pesticide is on the way. You can track it in your Dashboard.</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black text-gray-900 mb-6">Complete Purchase</h3>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{checkoutProduct?.title.split(': ')[1] || checkoutProduct?.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{checkoutProduct?.deliveryEstimate}</p>
                  </div>
                  <p className="font-black text-lg text-emerald-600">{checkoutProduct?.price}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address</label>
                    <textarea 
                      rows="3"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your farm's address..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Quantity (Acres to cover)</label>
                    <select 
                      value={quantity} 
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-gray-800"
                    >
                      {[1, 2, 3, 4, 5, 10].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Acre' : 'Acres'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={submitOrder}
                  disabled={orderStatus === 'processing' || !deliveryAddress.trim()}
                  className={`w-full font-black py-4 rounded-xl shadow-xl transition-all flex items-center justify-center ${
                    orderStatus === 'processing' || !deliveryAddress.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-amber-400 hover:bg-amber-500 text-gray-900 hover:-translate-y-1'
                  }`}
                >
                  {orderStatus === 'processing' ? 'Processing...' : `Pay ${checkoutProduct?.price}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
