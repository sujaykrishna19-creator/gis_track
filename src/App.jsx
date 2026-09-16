import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);

  // Simple persist login state
  useEffect(() => {
    const savedUser = localStorage.getItem('trackerUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (email, role) => {
    const userData = { email, role };
    setUser(userData);
    localStorage.setItem('trackerUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('trackerUser');
  };

  // Protected Route Wrapper
  const RequireAuth = ({ children, allowedRole }) => {
    if (!user) return <Navigate to="/" />;
    if (allowedRole && user.role !== allowedRole) {
      return <Navigate to={user.role === 'admin' ? "/admin" : "/dashboard"} />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? "/admin" : "/dashboard"} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <RequireAuth allowedRole="user">
              <TeacherDashboard user={user} onLogout={handleLogout} />
            </RequireAuth>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <RequireAuth allowedRole="admin">
              <AdminDashboard user={user} onLogout={handleLogout} />
            </RequireAuth>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
