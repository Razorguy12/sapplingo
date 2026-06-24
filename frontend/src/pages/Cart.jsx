import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

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
      const res = await axios.get(`${API_URL}/api/cart/${currentUser.id}`);
      setCartItems(res.data);
    } catch (error) {
      console.error('Error fetching cart', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/api/cart/${itemId}`);
      window.dispatchEvent(new Event('cartUpdated'));
      fetchCart();
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    try {
      await axios.post(`${API_URL}/api/checkout/${currentUser.id}`);
      window.dispatchEvent(new Event('cartUpdated'));
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
                <div key={item.id} className="cart-item-row">
                  <img src={item.plant.image_url} alt={item.plant.name} className="cart-item-image" />
                  <div className="cart-item-info">
                    <h3>{item.plant.name}</h3>
                    <div className="cart-item-qty">Qty: {item.quantity}</div>
                  </div>
                  <div className="cart-item-actions">
                    <div className="cart-item-price">
                      ${(item.plant.price * item.quantity).toFixed(2)}
                    </div>
                    <button onClick={() => removeItem(item.id)} className="btn glass-btn cart-remove-btn">
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary-row">
              <div className="cart-summary-total">
                <div className="cart-summary-label">Total Amount</div>
                <div className="cart-summary-value">
                  ${totalAmount.toFixed(2)}
                </div>
              </div>
              <button onClick={handleCheckout} className="btn btn-primary glass-btn cart-checkout-btn">
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
