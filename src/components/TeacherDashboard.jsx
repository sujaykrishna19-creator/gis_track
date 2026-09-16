import React, { useState, useEffect } from 'react';
import { apiCall } from '../lib/api';
import { formatDate } from '../lib/utils';
import { LogOut, Plus, Clock, CheckCircle } from 'lucide-react';

export default function TeacherDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskDesc, setTaskDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiCall({ action: 'getTickets', email: user.email, role: 'user' });
      if (res.success) {
        setTickets(res.tickets || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!taskDesc.trim()) return;

    // Optimistic Update: Instantly show in UI
    const tempTicket = {
      id: "SENDING...",
      date: new Date().toISOString(),
      email: user.email,
      task: taskDesc,
      status: "Pending"
    };
    
    setTickets([tempTicket, ...tickets]);
    const originalTask = taskDesc;
    setTaskDesc(''); // Clear form immediately
    
    // Run in background without freezing UI
    try {
      const res = await apiCall({ action: 'createTicket', email: user.email, task: originalTask });
      if (res.success) {
        fetchTickets(); // Refresh to get the real Ticket ID
      } else {
        alert(res.error || 'Failed to create ticket');
        fetchTickets(); // Revert on failure
      }
    } catch (err) {
      alert('Network error');
      fetchTickets(); // Revert on failure
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Pending') return 'text-yellow-600 bg-yellow-100';
    if (status === 'Work in Progress') return 'text-brand bg-blue-50';
    if (status === 'Completed') return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">My Tasks</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email}</span>
          <button onClick={onLogout} className="bg-red-50 text-red-500 px-3 py-1.5 rounded hover:bg-red-100 flex items-center gap-1 text-sm font-medium transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        {/* Create Ticket Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus size={20} className="text-brand" /> New Request
          </h2>
          <form onSubmit={handleCreateTicket}>
            <textarea 
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="E.g., Please move the extra chairs from Room 101 to the storage closet."
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand min-h-[100px] mb-4"
              required
            ></textarea>
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-brand text-white font-medium py-2 px-6 rounded-md hover:bg-brand-dark disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>

        {/* Tickets List */}
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-gray-500" /> Previous Requests
        </h2>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading your tasks...</div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500 border border-gray-100">
            You haven't submitted any requests yet.
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map(t => (
              <div key={t.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">{t.id}</span>
                    <span className="text-xs text-gray-400 ml-3">{formatDate(t.date)}</span>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(t.status)}`}>
                    {t.status}
                  </span>
                </div>
                <p className="text-gray-800 mt-2">{t.task}</p>
                {t.comment && (
                  <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700 border-l-4 border-brand">
                    <strong>Admin Note:</strong> {t.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
