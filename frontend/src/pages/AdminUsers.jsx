import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Shield, ShieldAlert, ArrowLeft, UserPlus, X } from 'lucide-react';

const AdminUsers = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', email: '', phone_number: '', dob: '', password: '' });
  const [addError, setAddError] = useState('');
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
      const res = await axios.get('https://sapplingo.onrender.com/api/users');
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
        await axios.delete(`https://sapplingo.onrender.com/api/users/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.detail || 'Failed to delete user');
      }
    }
  };

  const makeAdmin = async (id, username) => {
    if (window.confirm(`Grant admin privileges to ${username}?`)) {
      try {
        await axios.put(`https://sapplingo.onrender.com/api/users/${id}/admin`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.detail || 'Failed to grant admin rights');
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError('');
    try {
      await axios.post('https://sapplingo.onrender.com/api/register', {
        ...newUser,
        dob: newUser.dob || null
      });
      setShowAddForm(false);
      setNewUser({ name: '', username: '', email: '', phone_number: '', dob: '', password: '' });
      fetchData();
    } catch (error) {
      setAddError(error.response?.data?.detail || 'Failed to add user');
    }
  };

  if (!currentUser?.is_admin) return null;

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <Link to="/" className="btn btn-secondary glass-btn" style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={18} /> Back to Control Center
      </Link>

      <div className="glass-panel animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>Registered Users</h2>
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="btn btn-primary glass-btn" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
          >
            {showAddForm ? <><X size={18} /> Cancel</> : <><UserPlus size={18} /> Add User</>}
          </button>
        </div>

        {showAddForm && (
          <div className="glass-card animate-slide-up" style={{ padding: '20px', marginBottom: '20px', borderRadius: 'var(--border-radius-md)' }}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>Add New User</h3>
            <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <input 
                type="text" placeholder="Full Name" required className="login-input glass" 
                style={{ padding: '10px 15px' }}
                value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} 
              />
              <input 
                type="text" placeholder="Username" required className="login-input glass" 
                style={{ padding: '10px 15px' }}
                value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} 
              />
              <input 
                type="email" placeholder="Email Address" required className="login-input glass" 
                style={{ padding: '10px 15px' }}
                value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} 
              />
              <input 
                type="text" placeholder="Phone Number" required className="login-input glass" 
                style={{ padding: '10px 15px' }}
                value={newUser.phone_number} onChange={e => setNewUser({...newUser, phone_number: e.target.value})} 
              />
              <input 
                type={newUser.dob ? "date" : "text"} 
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                placeholder="Date of Birth (Optional)" 
                className="login-input glass" 
                style={{ padding: '10px 15px' }}
                value={newUser.dob} onChange={e => setNewUser({...newUser, dob: e.target.value})} 
              />
              <input 
                type="password" placeholder="Password" required className="login-input glass" 
                style={{ padding: '10px 15px' }}
                value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} 
              />
              {addError && <div style={{ gridColumn: 'span 2', color: '#ef4444' }}>{addError}</div>}
              <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                <button type="submit" className="btn btn-primary glass-btn">Create User</button>
              </div>
            </form>
          </div>
        )}
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
