import React, { useState, useEffect } from 'react';
import { apiCall } from '../lib/api';
import { LogOut, Filter, MessageSquare, Check } from 'lucide-react';

export default function AdminDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  // State for updating a ticket
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editComment, setEditComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiCall({ action: 'getTickets', email: user.email, role: 'admin' });
      if (res.success) {
        setTickets(res.tickets || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleUpdate = async (ticketId) => {
    // Optimistic Update: Update UI instantly
    const originalTickets = [...tickets];
    
    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: editStatus, comment: editComment };
      }
      return t;
    }));
    
    setEditingId(null); // Close the edit box instantly
    
    // Run in background without freezing UI
    try {
      const res = await apiCall({ 
        action: 'updateTicket', 
        ticketId: ticketId,
        status: editStatus,
        comment: editComment
      });
      if (!res.success) {
        alert(res.error || 'Failed to update');
        setTickets(originalTickets); // Revert on failure
      }
    } catch (err) {
      alert('Network error');
      setTickets(originalTickets); // Revert on failure
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Pending') return 'text-yellow-600 bg-yellow-100';
    if (status === 'Work in Progress') return 'text-brand bg-sky-100';
    if (status === 'Completed') return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  const filteredTickets = filter === 'All' ? tickets : tickets.filter(t => t.status === filter);

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'Pending').length,
    wip: tickets.filter(t => t.status === 'Work in Progress').length,
    completed: tickets.filter(t => t.status === 'Completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b-4 border-brand">
        <h1 className="text-xl font-bold text-gray-800">Admin Control Panel</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-brand px-3 py-1 bg-sky-50 rounded-full">Admin</span>
          <span className="text-sm text-gray-600">{user.email}</span>
          <button onClick={onLogout} className="bg-red-50 text-red-500 px-3 py-1.5 rounded hover:bg-red-100 flex items-center gap-1 text-sm font-medium transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-brand">{stats.wip}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">In Progress</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-green-500">{stats.completed}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Completed</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6">
          <Filter size={18} className="text-gray-500" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="All">All Requests</option>
            <option value="Pending">Pending</option>
            <option value="Work in Progress">Work in Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading tickets...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b">
                  <th className="p-4 font-semibold">Ticket</th>
                  <th className="p-4 font-semibold">Teacher</th>
                  <th className="p-4 font-semibold">Task</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTickets.map(t => (
                  <React.Fragment key={t.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 align-top">
                        <div className="font-medium text-gray-800">{t.id}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(t.date).toString() === 'Invalid Date' ? t.date : new Date(t.date).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4 align-top text-sm text-gray-600">{t.email}</td>
                      <td className="p-4 align-top text-sm text-gray-800 max-w-md">
                        {t.task}
                        {t.comment && editingId !== t.id && (
                          <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded flex gap-2">
                            <MessageSquare size={12} className="mt-0.5" /> {t.comment}
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-top">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 align-top text-right">
                        {editingId === t.id ? (
                          <button 
                            onClick={() => setEditingId(null)}
                            className="text-gray-500 text-sm hover:underline"
                          >
                            Cancel
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingId(t.id);
                              setEditStatus(t.status);
                              setEditComment(t.comment || '');
                            }}
                            className="text-brand text-sm font-medium hover:underline"
                          >
                            Update
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* Inline Edit Form */}
                    {editingId === t.id && (
                      <tr className="bg-sky-50 border-b">
                        <td colSpan="5" className="p-4">
                          <div className="flex gap-4 items-start">
                            <div className="w-48">
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Update Status</label>
                              <select 
                                value={editStatus} 
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="w-full p-2 border rounded text-sm focus:outline-none focus:border-brand"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Work in Progress">Work in Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Add Comment (Teacher will see this)</label>
                              <input 
                                type="text"
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                className="w-full p-2 border rounded text-sm focus:outline-none focus:border-brand"
                                placeholder="E.g., I'll be there after 3 PM today."
                              />
                            </div>
                            <div className="pt-5">
                              <button 
                                onClick={() => handleUpdate(t.id)}
                                disabled={saving}
                                className="bg-brand text-white px-4 py-2 rounded text-sm font-medium hover:bg-brand-dark flex items-center gap-1 disabled:opacity-50"
                              >
                                {saving ? 'Saving...' : <><Check size={16} /> Save Changes</>}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                
                {filteredTickets.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      No tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
