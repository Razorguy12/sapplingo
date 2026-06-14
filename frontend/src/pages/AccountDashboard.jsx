import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Edit, Save, Package, Calendar, Phone, Mail } from 'lucide-react';

const AccountDashboard = ({ currentUser, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone_number || '');
  const [dob, setDob] = useState(currentUser.dob || '');
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fieldStyle = {
    padding: '12px 16px',
    background: '#ffffff',
    borderRadius: 'var(--border-radius-sm)',
    border: '2px solid var(--primary-color)',
    boxShadow: '0 4px 8px rgba(47, 105, 59, 0.15)',
    color: 'var(--text-dark)',
    fontSize: '1rem',
    width: '100%',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box'
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`https://sapplingo.onrender.com/api/orders/${currentUser.id}`);
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(`https://sapplingo.onrender.com/api/users/${currentUser.id}`, {
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
    <div className="container animate-fade-in" style={{ padding: '40px 20px', maxWidth: '900px' }}>
      <div className="opaque-panel animate-slide-up" style={{ padding: '30px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)' }}>
            <User size={28} /> Account Information
          </h2>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn btn-secondary glass-btn" style={{ padding: '8px 16px', display: 'flex', gap: '5px' }}>
              <Edit size={18} /> Edit
            </button>
          ) : (
            <button onClick={handleSave} className="btn btn-primary glass-btn" style={{ padding: '8px 16px', display: 'flex', gap: '5px' }}>
              <Save size={18} /> Save
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            {isEditing ? (
              <input type="text" style={fieldStyle} value={name} onChange={e => setName(e.target.value)} />
            ) : (
              <div style={fieldStyle}>{currentUser.name}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            {isEditing ? (
              <input type="email" style={fieldStyle} value={email} onChange={e => setEmail(e.target.value)} />
            ) : (
              <div style={fieldStyle}>{currentUser.email || 'Not provided'}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            {isEditing ? (
              <input type="text" style={fieldStyle} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
            ) : (
              <div style={fieldStyle}>{currentUser.phone_number || 'Not provided'}</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
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

      <div className="opaque-panel animate-slide-up" style={{ padding: '30px', animationDelay: '0.1s' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)', marginBottom: '20px' }}>
          <Package size={28} /> Past Orders
        </h2>

        {loadingOrders ? (
          <div>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)' }}>
            You have no past orders yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {orders.map(order => (
              <div key={order.id} style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', padding: '15px', background: 'rgba(255,255,255,0.6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>
                  <div style={{ fontWeight: 'bold' }}>Order #{order.id}</div>
                  <div style={{ color: 'var(--text-light)' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                      <span>{item.quantity}x {item.plant.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                  Total: ${order.total_amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDashboard;
