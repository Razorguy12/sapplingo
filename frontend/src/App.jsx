import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Buy from './pages/Buy';
import Sell from './pages/Sell';
import PlantDetail from './pages/PlantDetail';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminInventory from './pages/AdminInventory';
import AdminUsers from './pages/AdminUsers';
import Cart from './pages/Cart';
import AccountDashboard from './pages/AccountDashboard';
import MyPlants from './pages/MyPlants';
import Chatbot from './components/Chatbot';
import { Leaf, LogOut, Shield, ShoppingCart, User, Package, Search, Plus, LayoutDashboard, ShoppingBag, Archive, Users, Box } from 'lucide-react';
import './styles/dashboard.css';

const API_URL = 'http://127.0.0.1:8001';

// Helper component to handle active link state
const NavLink = ({ to, icon: Icon, children, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
      <Icon size={18} />
      <span>{children}</span>
      {badge && <span className="nav-badge">{badge}</span>}
    </Link>
  );
};

// Inner App component to use useLocation hook
function AppContent({ currentUser, setCurrentUser, cartCount, setShowLogin }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <Link to="/" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Leaf size={18} color="#74c69d" />
          </div>
          <span className="sidebar-logo-text">Saplinggo</span>
        </Link>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Main</span>
          <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>

          {!currentUser.is_admin && (
            <>
              <NavLink to="/buy" icon={ShoppingBag}>Browse Plants</NavLink>
              {currentUser.role !== 'nursery' && (
                <NavLink to="/sell" icon={Plus}>Sell a Plant</NavLink>
              )}
            </>
          )}

          {!currentUser.is_admin && currentUser.role !== 'nursery' && (
            <>
              <span className="nav-section-label">My Plants</span>
              <NavLink to="/my-plants" icon={Archive}>My Collection</NavLink>
              <NavLink to="/cart" icon={ShoppingCart} badge={cartCount > 0 ? cartCount : null}>Pickup Basket</NavLink>
            </>
          )}

          {currentUser.is_admin && (
            <>
              <span className="nav-section-label">Admin</span>
              <NavLink to="/admin/inventory" icon={Box}>Inventory</NavLink>
              <NavLink to="/admin/users" icon={Users}>Users</NavLink>
            </>
          )}

          <span className="nav-section-label">Account</span>
          <NavLink to="/account" icon={User}>Account</NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {getInitials(currentUser.nursery_name || currentUser.name)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{currentUser.nursery_name || currentUser.name}</div>
            <div className="sidebar-user-role">{currentUser.role || (currentUser.is_admin ? 'Admin' : 'Plant Lover')}</div>
          </div>
          <button className="sidebar-logout" title="Logout" onClick={handleLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-greeting">Hi, <span>{currentUser.nursery_name || currentUser.name}</span></div>
          <div className="topbar-actions">
            {!currentUser.is_admin && currentUser.role !== 'nursery' && (
              <>
                <Link to="/buy" className="topbar-btn">
                  <Search size={15} /> Search plants
                </Link>
                <Link to="/cart" className="topbar-btn">
                  <div className="cart-badge">
                    <ShoppingCart size={16} />
                    {cartCount > 0 && <span className="cart-badge-dot">{cartCount}</span>}
                  </div>
                  Basket
                </Link>
                <Link to="/sell" className="topbar-btn primary">
                  + Sell a Plant
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="content">
          <Routes>
            <Route path="/" element={
              currentUser.is_admin ? <AdminDashboard currentUser={currentUser} /> : 
              <Home currentUser={currentUser} />
            } />
            <Route path="/admin/inventory" element={<AdminInventory currentUser={currentUser} />} />
            <Route path="/admin/users" element={<AdminUsers currentUser={currentUser} />} />
            <Route path="/cart" element={<Cart currentUser={currentUser} />} />
            <Route path="/account" element={<AccountDashboard currentUser={currentUser} onUpdateUser={setCurrentUser} />} />
            <Route path="/my-plants" element={<MyPlants currentUser={currentUser} />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/plant/:id" element={<PlantDetail currentUser={currentUser} />} />
            <Route path="/sell" element={<Sell />} />
          </Routes>
        </div>
      </div>

      <Chatbot />
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.is_admin || currentUser.role === 'nursery') return;

    const fetchCartCount = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/cart/${currentUser.id}`);
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
    if (showLogin) {
      return <Login onLogin={(user) => {
        window.history.replaceState(null, '', '/');
        setCurrentUser(user);
        setShowLogin(false);
      }} onBack={() => setShowLogin(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowLogin(true)} />;
  }

  return (
    <Router>
      <AppContent 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser} 
        cartCount={cartCount} 
        setShowLogin={setShowLogin} 
      />
    </Router>
  );
}

export default App;
