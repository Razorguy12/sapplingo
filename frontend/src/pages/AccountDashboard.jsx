import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Edit, Save, Package, Calendar, Phone, Mail } from 'lucide-react';
import { API_URL } from '../config';

const AccountDashboard = ({ currentUser, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone_number || '');
  const [dob, setDob] = useState(currentUser.dob || '');
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fieldStyle = {
    padding: '10px 14px',
    background: '#f8faf7',
    borderRadius: '8px',
    border: '1px solid #d4e0d5',
    color: '#1a3a2a',
    fontSize: '13px',
    width: '100%',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    wordBreak: 'break-word',
    overflowWrap: 'anywhere'
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders/${currentUser.id}`);
      setOrders(res.data.reverse());
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/users/${currentUser.id}`, {
        name,
        email,
        phone_number: phoneNumber,
        dob: dob || null
      });
      onUpdateUser(res.data);
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update profile');
      console.error(error);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title">Account Details</h1>
      <p className="page-subtitle">Manage your personal information and view your past orders.</p>

      <div className="panel animate-slide-up">
        <div className="panel-header">
          <h2 className="panel-title">
            <User size={18} /> Profile Information
          </h2>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="topbar-btn" style={{ padding: '4px 10px' }}>
              <Edit size={14} /> Edit
            </button>
          ) : (
            <button onClick={handleSave} className="topbar-btn primary" style={{ padding: '4px 10px' }}>
              <Save size={14} /> Save
            </button>
          )}
        </div>
        <div className="panel-body">
          <div className="account-fields-grid">
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label" style={{ fontSize: '12px', color: '#6b8f70' }}>Full Name</label>
              {isEditing ? (
                <input type="text" style={fieldStyle} value={name} onChange={e => setName(e.target.value)} />
              ) : (
                <div style={fieldStyle}>{currentUser.name}</div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label" style={{ fontSize: '12px', color: '#6b8f70' }}>Email</label>
              {isEditing ? (
                <input type="email" style={fieldStyle} value={email} onChange={e => setEmail(e.target.value)} />
              ) : (
                <div style={fieldStyle}>{currentUser.email || 'Not provided'}</div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label" style={{ fontSize: '12px', color: '#6b8f70' }}>Phone Number</label>
              {isEditing ? (
                <input type="text" style={fieldStyle} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
              ) : (
                <div style={fieldStyle}>{currentUser.phone_number || 'Not provided'}</div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label" style={{ fontSize: '12px', color: '#6b8f70' }}>Date of Birth</label>
              {isEditing ? (
                <input type="date" style={fieldStyle} value={dob} onChange={e => setDob(e.target.value)} />
              ) : (
                <div style={fieldStyle}>
                  {currentUser.dob ? currentUser.dob : 'Not provided'} 
                  {currentUser.age && ` (Age: ${currentUser.age})`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="panel animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="panel-header">
          <h2 className="panel-title">
            <Package size={18} /> Order History
          </h2>
        </div>
        <div className="panel-body" style={{ padding: '0' }}>
          {loadingOrders ? (
            <div style={{ padding: '20px', fontSize: '13px', color: '#6b8f70' }}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '20px', fontSize: '13px', color: '#6b8f70', textAlign: 'center' }}>
              You have no past orders yet.
            </div>
          ) : (
            <div>
              {orders.map(order => (
                <div key={order.id} style={{ padding: '16px 20px', borderBottom: '0.5px solid #e8f0e9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1a3a2a' }}>Order #{order.id}</div>
                    <div style={{ color: '#6b8f70', fontSize: '12px' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    {order.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#2d4a30', marginBottom: '6px' }}>
                        <span>{item.quantity}x {item.plant.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ textAlign: 'right', fontWeight: '600', fontSize: '14px', color: '#2d6a4f' }}>
                    Total: ${order.total_amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;
