import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Buy from './pages/Buy';
import Sell from './pages/Sell';
import PlantDetail from './pages/PlantDetail';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminInventory from './pages/AdminInventory';
import AdminUsers from './pages/AdminUsers';
import Cart from './pages/Cart';
import AccountDashboard from './pages/AccountDashboard';
import Chatbot from './components/Chatbot';
import { Leaf, LogOut, Shield, ShoppingCart, User } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!currentUser || currentUser.is_admin) return;

    const fetchCartCount = async () => {
      try {
        const res = await axios.get(`https://sapplingo.onrender.com/api/cart/${currentUser.id}`);
        const count = res.data.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      } catch (err) {
        console.error('Error fetching cart count', err);
      }
    };

    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [currentUser]);

  if (!currentUser) {
    return <Login onLogin={(user) => {
      window.history.replaceState(null, '', '/');
      setCurrentUser(user);
    }} />;
  }

  return (
    <Router>
      <div className="app-container">
        <header className="header glass">
          <div className="container header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Link to="/" className="logo text-shadow" style={{ textDecoration: 'none' }}>
                <Leaf size={28} color="var(--primary-color)" />
                Saplinggo
              </Link>
            </div>
            
            <div className="header-actions">
              <span style={{ color: 'var(--text-dark)' }}>Hi, <strong>{currentUser.name}</strong></span>
              
              {!currentUser.is_admin && (
                <>
                  <Link to="/account" className="btn btn-secondary glass-btn" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px', background: 'rgba(255, 255, 255, 0.4)', textDecoration: 'none', color: 'var(--text-dark)' }}>
                    <User size={18} /> Account
                  </Link>
                  <Link to="/cart" className="btn btn-secondary glass-btn" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px', background: 'rgba(255, 255, 255, 0.4)', textDecoration: 'none', color: 'var(--text-dark)' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <ShoppingCart size={18} />
                      {cartCount > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-10px',
                          background: '#ef4444',
                          color: 'white',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          {cartCount}
                        </span>
                      )}
                    </div>
                    Pickup Basket
                  </Link>
                </>
              )}
              
              <button 
                onClick={() => setCurrentUser(null)} 
                className="btn btn-secondary glass-btn" 
                style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px', background: 'rgba(255, 255, 255, 0.4)' }}
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={currentUser.is_admin ? <AdminDashboard currentUser={currentUser} /> : <Home />} />
            <Route path="/admin/inventory" element={<AdminInventory currentUser={currentUser} />} />
            <Route path="/admin/users" element={<AdminUsers currentUser={currentUser} />} />
            <Route path="/cart" element={<Cart currentUser={currentUser} />} />
            <Route path="/account" element={<AccountDashboard currentUser={currentUser} onUpdateUser={setCurrentUser} />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/plant/:id" element={<PlantDetail currentUser={currentUser} />} />
            <Route path="/sell" element={<Sell />} />
          </Routes>
        </main>

        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
