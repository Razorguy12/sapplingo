import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Shield, ShieldAlert, ArrowLeft } from 'lucide-react';

const AdminUsers = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.is_admin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [currentUser, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id, username) => {
    if (window.confirm(`Are you sure you want to delete ${username}?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/users/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.detail || 'Failed to delete user');
      }
    }
  };

  const makeAdmin = async (id, username) => {
    if (window.confirm(`Grant admin privileges to ${username}?`)) {
      try {
        await axios.put(`http://localhost:8000/api/users/${id}/admin`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.detail || 'Failed to grant admin rights');
      }
    }
  };

  if (!currentUser?.is_admin) return null;

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <Link to="/" className="btn btn-secondary glass-btn" style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={18} /> Back to Control Center
      </Link>

      <div className="glass-panel animate-slide-up">
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>Registered Users</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading data...</div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {users.map(user => (
              <div key={user.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--text-dark)' }}>{user.name} {user.is_admin && <Shield size={16} color="var(--primary-color)" display="inline" />}</strong>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>@{user.username}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {!user.is_admin && (
                    <button onClick={() => makeAdmin(user.id, user.username)} className="btn glass-btn" style={{ padding: '8px 12px', display: 'flex', gap: '5px', alignItems: 'center', color: 'var(--primary-color)' }}>
                      <ShieldAlert size={16} /> Make Admin
                    </button>
                  )}
                  <button onClick={() => deleteUser(user.id, user.username)} className="btn glass-btn" style={{ padding: '8px 12px', display: 'flex', gap: '5px', alignItems: 'center', color: '#ef4444' }}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
