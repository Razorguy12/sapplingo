import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = ({ currentUser }) => {
  if (!currentUser?.is_admin) return null;

  return (
    <div className="animate-fade-in page-wrapper">
      <section className="hero-section glass-panel">
        <div className="container">
          <h1 className="hero-title animate-slide-up text-shadow" style={{ color: 'var(--primary-color)' }}>Admin Control Center</h1>
          <p className="hero-subtitle animate-slide-up text-shadow" style={{ animationDelay: '0.1s', color: 'var(--text-dark)', fontWeight: '500' }}>
            Manage the Saplinggo ecosystem. View current inventory, add new stock, or manage registered users.
          </p>
          <div className="hero-actions animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/admin/inventory" className="btn btn-primary btn-large glass-btn">
              View Inventory
            </Link>
            <Link to="/admin/users" className="btn btn-secondary btn-large glass-btn">
              Manage Users
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
