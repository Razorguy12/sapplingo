import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, ArrowLeft, MapPin, CheckCircle, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const OrderPage = ({ currentUser }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [nurseries, setNurseries] = useState([]);
  const [sellers, setSellers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.is_admin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [currentUser, navigate]);

  const fetchData = async () => {
    try {
      const [cartRes, nurseriesRes, sellersRes] = await Promise.all([
        axios.get(`${API_URL}/api/cart/${currentUser.id}`),
        axios.get(`${API_URL}/api/nurseries`),
        axios.get(`${API_URL}/api/individual-sellers`)
      ]);
      setCartItems(cartRes.data);
      setNurseries(nurseriesRes.data);
      setSellers(sellersRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!date) {
      alert("Please select a pickup date.");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/checkout/${currentUser.id}`, {
        delivery_type: 'pickup',
        pickup_date: date,
        pickup_time: time
      });
      window.dispatchEvent(new Event('cartUpdated'));
      alert("Pickup slot confirmed! Your order is pending nursery approval.");
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Checkout failed');
    }
  };

  if (loading) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  if (cartItems.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '40px 20px', maxWidth: '800px', textAlign: 'center' }}>
        <h2>Your cart is empty</h2>
        <Link to="/buy" className="btn btn-primary glass-btn" style={{ marginTop: '20px' }}>Browse Plants</Link>
      </div>
    );
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.plant.price * item.quantity), 0);

  // Get unique sellers/nurseries involved
  const involvedNurseryIds = [...new Set(cartItems.filter(item => item.plant.nursery_id).map(item => item.plant.nursery_id))];
  const involvedSellerIds = [...new Set(cartItems.filter(item => item.plant.user_id).map(item => item.plant.user_id))];

  const involvedNurseries = nurseries.filter(n => involvedNurseryIds.includes(n.id));
  const involvedSellers = sellers.filter(s => involvedSellerIds.includes(s.id));

  return (
    <div className="container animate-fade-in page-wrapper" style={{ paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/cart" className="glass-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '30px', textDecoration: 'none', color: 'var(--text-dark)' }}>
        <ArrowLeft size={18} /> Back to Cart
      </Link>

      <h2 style={{ color: 'var(--primary-color)', marginBottom: '30px' }}>Schedule Pickup</h2>

      <div className="glass-panel animate-slide-up" style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={20} /> Select Date & Time
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <label className="form-label">Pickup Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="form-label">Pickup Time</label>
            <input 
              type="time" 
              className="form-input" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              required
            />
          </div>
        </div>
      </div>

      <div className="glass-panel animate-slide-up" style={{ animationDelay: '0.1s', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Package size={20} /> Order Summary
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '20px' }}>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: '600' }}>{item.plant.name}</span> <span style={{ color: 'var(--text-light)' }}>x{item.quantity}</span>
              </div>
              <div>${(item.plant.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary-color)' }}>${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <h4 style={{ marginBottom: '15px', color: 'var(--text-dark)' }}>Pickup Locations:</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {involvedNurseries.map(nursery => (
            <div key={`nursery-${nursery.id}`} style={{ background: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{nursery.nursery_name}</div>
              <div style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                <MapPin size={14} /> Contact to get full address • {nursery.phone_number || nursery.email}
              </div>
            </div>
          ))}
          {involvedSellers.map(seller => (
            <div key={`seller-${seller.id}`} style={{ background: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{seller.name} (Individual Seller)</div>
              <div style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                <MapPin size={14} /> Contact to coordinate pickup • {seller.phone_number || seller.email}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={() => navigate('/cart')} className="btn glass-btn" style={{ flex: 1 }}>
          Edit slot details
        </button>
        <button onClick={handleConfirm} className="btn btn-primary glass-btn" style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <CheckCircle size={20} /> Confirm pickup slot
        </button>
      </div>

    </div>
  );
};

export default OrderPage;
