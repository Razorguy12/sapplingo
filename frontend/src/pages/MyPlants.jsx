import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Star, Leaf, Calendar, ArrowLeft } from 'lucide-react';

const MyPlants = ({ currentUser }) => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchMyPlants = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8001/api/orders/${currentUser.id}`);
        const orders = res.data;
        
        // Extract unique plants from all orders
        const plantMap = new Map();
        orders.forEach(order => {
          order.items.forEach(item => {
            if (!plantMap.has(item.plant.id)) {
              plantMap.set(item.plant.id, {
                ...item.plant,
                purchased_at: order.created_at
              });
            }
          });
        });
        
        setPlants(Array.from(plantMap.values()));
      } catch (error) {
        console.error('Failed to fetch plants', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPlants();
  }, [currentUser]);

  return (
    <div className="container animate-fade-in page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px' }}>
        <Link to="/" style={{ color: 'var(--text-light)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>My Collection</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>A detailed list of all the beautiful plants you've brought home.</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-light)' }}>Loading your collection...</p>
      ) : plants.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
          <Leaf size={48} color="var(--sage-muted)" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: 'var(--green-700)', marginBottom: '10px' }}>Your collection is empty</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>You haven't ordered any plants yet.</p>
          <Link to="/buy" className="btn btn-primary glass-btn">Explore Plants</Link>
        </div>
      ) : (
        <div className="plant-matrix animate-slide-up">
          {plants.map(plant => (
            <Link to={`/plant/${plant.id}`} state={{ fromCollection: true }} key={plant.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="plant-card glass-card" style={{ height: '100%', cursor: 'pointer' }}>
                <img src={plant.image_url} alt={plant.name} className="plant-img" />
                <div className="plant-info">
                  <h3 className="plant-name">{plant.name}</h3>
                  <div className="plant-scientific" style={{ color: 'var(--sage-muted)' }}>{plant.scientific_name}</div>
                  <div className="plant-meta" style={{ marginBottom: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--sage-muted)' }}>
                      <Calendar size={14} /> {new Date(plant.purchased_at).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--sage-muted)' }}>
                      <Star size={14} color="#FFD700" fill="#FFD700" /> {plant.rating || 'New'}
                    </span>
                  </div>
                  <div className="plant-price" style={{ color: 'var(--green-700)' }}>${plant.price.toFixed(2)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPlants;
