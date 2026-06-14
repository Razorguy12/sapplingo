import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';

const AdminInventory = ({ currentUser }) => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.is_admin) {
      navigate('/');
      return;
    }
    const fetchPlants = async () => {
      try {
        const res = await axios.get('https://sapplingo.onrender.com/api/plants');
        setPlants(res.data);
      } catch (error) {
        console.error('Error fetching inventory', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlants();
  }, [currentUser, navigate]);

  if (!currentUser?.is_admin) return null;

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <Link to="/" className="btn btn-secondary glass-btn" style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={18} /> Back to Control Center
      </Link>

      <div className="glass-panel animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>Current Inventory</h2>
          <Link to="/sell" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add New Plant
          </Link>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading data...</div>
        ) : (
          <div className="plant-matrix">
            {plants.map(plant => (
              <Link to={`/plant/${plant.id}`} key={plant.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="plant-card glass-card" style={{ height: '100%', cursor: 'pointer' }}>
                  <img src={plant.image_url} alt={plant.name} className="plant-img" />
                  <div className="plant-info">
                    <h3 className="plant-name">{plant.name}</h3>
                    <div className="plant-scientific">{plant.scientific_name}</div>
                    <div className="plant-price" style={{ marginTop: '10px' }}>${plant.price.toFixed(2)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
