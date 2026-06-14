import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = ({ currentUser }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.is_admin) {
      navigate('/');
      return;
    }
    fetchCart();
  }, [currentUser, navigate]);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/cart/${currentUser.id}`);
      setCartItems(res.data);
    } catch (error) {
      console.error('Error fetching cart', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:8000/api/cart/${itemId}`);
      fetchCart();
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    try {
      await axios.post(`http://localhost:8000/api/checkout/${currentUser.id}`);
      alert("Pickup slot booked successfully!");
      navigate('/');
    } catch (error) {
      alert('Checkout failed');
    }
  };

  if (loading) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Loading cart...</div>;

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.plant.price * item.quantity), 0);

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px', maxWidth: '800px' }}>
      <Link to="/buy" className="btn btn-secondary glass-btn" style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={18} /> Continue Shopping
      </Link>

      <div className="opaque-panel animate-slide-up">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary-color)', marginBottom: '30px' }}>
          <ShoppingCart size={28} /> Pickup Basket
        </h2>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dark)' }}>
            <p>Your pickup basket is empty.</p>
            <Link to="/buy" className="btn btn-primary glass-btn" style={{ marginTop: '20px' }}>Browse Plants</Link>
          </div>
        ) : (
          <div>
            <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '15px', background: 'transparent', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                  <img src={item.plant.image_url} alt={item.plant.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#111827', fontWeight: 'bold' }}>{item.plant.name}</h3>
                    <div style={{ color: '#374151', fontSize: '0.9rem', fontWeight: '500' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: '#065f46', fontSize: '1.2rem', marginBottom: '10px' }}>
                      ${(item.plant.price * item.quantity).toFixed(2)}
                    </div>
                    <button onClick={() => removeItem(item.id)} className="btn glass-btn" style={{ padding: '5px 10px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ color: 'var(--text-light)', marginBottom: '5px' }}>Total Amount</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  ${totalAmount.toFixed(2)}
                </div>
              </div>
              <button onClick={handleCheckout} className="btn btn-primary glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 30px', fontSize: '1.1rem' }}>
                <CreditCard size={20} /> Book Pickup Slots
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
