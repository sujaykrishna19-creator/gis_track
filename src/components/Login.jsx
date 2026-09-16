import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../lib/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiCall({ action: 'requestOTP', email: email.toLowerCase().trim() });
      if (res.success) {
        setStep(2);
      } else {
        setError(res.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiCall({ action: 'verifyOTP', email: email.toLowerCase().trim(), otp: otp.trim() });
      if (res.success) {
        onLogin(email, res.role.toLowerCase());
        if (res.role.toLowerCase() === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-brand">Task tracker from facilities</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        
        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">School Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:border-brand"
                placeholder="teacher@school.edu"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand text-white font-bold py-2 px-4 rounded hover:bg-brand-dark disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Get Login Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Enter 6-Digit Code</label>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:border-brand text-center text-lg tracking-widest"
                placeholder="123456"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-2 text-center">We sent a code to {email}</p>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand text-white font-bold py-2 px-4 rounded hover:bg-brand-dark disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Log In'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="w-full text-brand text-sm font-bold mt-4 hover:underline"
            >
              Back to Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
