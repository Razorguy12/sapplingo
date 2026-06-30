import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { API_URL } from './config';
import Home from './pages/Home';
import Buy from './pages/Buy';
import Sell from './pages/Sell';
import PlantDetail from './pages/PlantDetail';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminInventory from './pages/AdminInventory';
import AdminUsers from './pages/AdminUsers';
import NurseryDashboard from './pages/NurseryDashboard';
import Cart from './pages/Cart';
import AccountDashboard from './pages/AccountDashboard';
import MyPlants from './pages/MyPlants';
import NurseryView from './pages/NurseryView';
import NurseryInventory from './pages/NurseryInventory';
import SellerView from './pages/SellerView';
import OrderPage from './pages/OrderPage';
import NurseryPickups from './pages/NurseryPickups';
import MyOrders from './pages/MyOrders';
import Chatbot from './components/Chatbot';
import { Leaf, LogOut, Shield, ShoppingCart, User, Package, Search, Plus, LayoutDashboard, ShoppingBag, Archive, Users, Box, Calendar, Menu, X } from 'lucide-react';
import './styles/dashboard.css';
import logo from './assets/sapplingo_logo.jpeg';

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

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
      <div className={`sidebar ${mobileNavOpen ? 'open' : ''}`}>
        <div className="sidebar-logo-row">
          <Link to="/" className="sidebar-logo">
            <img src={logo} alt="Saplinggo" style={{ height: '32px', width: '32px', borderRadius: '50%', objectFit: 'cover', marginRight: '10px' }} />
            <span className="sidebar-logo-text">Saplinggo</span>
          </Link>
          <button className="sidebar-close" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Main</span>
          <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>

          {!currentUser.is_admin && currentUser.role !== 'nursery' && (
            <>
              <NavLink to="/buy" icon={ShoppingBag}>Browse Plants</NavLink>
              <NavLink to="/sell" icon={Plus}>Sell a Plant</NavLink>
            </>
          )}

          {currentUser.role === 'nursery' && (
            <>
              <span className="nav-section-label">Nursery Hub</span>
              <NavLink to="/nursery-inventory" icon={Archive}>My Plants</NavLink>
              <NavLink to="/nursery-list" icon={Plus}>List a New Plant</NavLink>
              <NavLink to="/nursery-pickups" icon={Calendar}>Pick up slots</NavLink>
            </>
          )}

          {!currentUser.is_admin && currentUser.role !== 'nursery' && (
            <>
              <span className="nav-section-label">My Plants</span>
              <NavLink to="/my-plants" icon={Archive}>My Collection</NavLink>
              <NavLink to="/cart" icon={ShoppingCart} badge={cartCount > 0 ? cartCount : null}>Pickup Basket</NavLink>
              <NavLink to="/my-orders" icon={Package}>My Orders</NavLink>
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

      {/* Mobile overlay, shown behind the sidebar when open */}
      {mobileNavOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* Main Content */}
      <div className="main">
        <div className="topbar">
          <button className="hamburger-btn" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
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
              currentUser.role === 'nursery' ? <NurseryDashboard currentUser={currentUser} /> :
              <Home currentUser={currentUser} />
            } />
            <Route path="/admin/inventory" element={<AdminInventory currentUser={currentUser} />} />
            <Route path="/admin/users" element={<AdminUsers currentUser={currentUser} />} />
            <Route path="/cart" element={<Cart currentUser={currentUser} />} />
            <Route path="/account" element={<AccountDashboard currentUser={currentUser} onUpdateUser={setCurrentUser} />} />
            <Route path="/my-plants" element={<MyPlants currentUser={currentUser} />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/nursery/:id" element={<NurseryView />} />
            <Route path="/seller/:id" element={<SellerView />} />
            <Route path="/plant/:id" element={<PlantDetail currentUser={currentUser} />} />
            <Route path="/sell" element={<Sell currentUser={currentUser} />} />
            <Route path="/nursery-inventory" element={<NurseryInventory currentUser={currentUser} />} />
            <Route path="/nursery-list" element={<Sell currentUser={currentUser} />} />
            <Route path="/order" element={<OrderPage currentUser={currentUser} />} />
            <Route path="/nursery-pickups" element={<NurseryPickups currentUser={currentUser} />} />
            <Route path="/my-orders" element={<MyOrders currentUser={currentUser} />} />
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
