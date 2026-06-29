import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, RefreshCw, ArrowLeft } from 'lucide-react';
import { API_URL } from '../config';

const NurseryInventory = ({ currentUser }) => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [showStockOutOnly, setShowStockOutOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!currentUser || currentUser.role !== 'nursery') {
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      const plantsRes = await axios.get(`${API_URL}/api/plants`);
      const myPlants = plantsRes.data.filter(p => p.nursery_id === currentUser.id);
      setPlants(myPlants);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser, navigate]);

  const handleRestock = async (plantId) => {
    const qty = prompt("Enter the new stock quantity:");
    if (qty && !isNaN(qty) && parseInt(qty) > 0) {
      try {
        await axios.put(`${API_URL}/api/plants/${plantId}/restock`, { quantity: parseInt(qty) });
        fetchData();
      } catch (error) {
        console.error("Failed to restock", error);
        alert("Failed to update stock.");
      }
    }
  };

  const filteredPlants = plants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock = showStockOutOnly ? p.quantity === 0 : true;
    return matchesSearch && matchesStock;
  });

  return (
    <div className="container animate-fade-in page-wrapper" style={{ paddingBottom: '80px' }}>
      <Link to="/" className="glass-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '20px', textDecoration: 'none', color: 'var(--text-dark)' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      
      <h2 style={{ marginBottom: '30px' }}>My Plants Inventory</h2>
      
      <div className="animate-slide-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <div className="search-bar glass" style={{ border: 'none', width: '300px', margin: 0 }}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search inventory..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent' }}
            />
            <button className="search-btn glass-btn" style={{ padding: '8px' }}>
              <Search size={18} />
            </button>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: showStockOutOnly ? '#fee2e2' : 'var(--bg-light)', padding: '10px 15px', borderRadius: '8px', color: showStockOutOnly ? '#ef4444' : 'var(--text-dark)' }}>
            <input 
              type="checkbox" 
              checked={showStockOutOnly}
              onChange={(e) => setShowStockOutOnly(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Show Stocked Out Only
          </label>
        </div>

        {loading ? (
          <div style={{textAlign: 'center', padding: '40px'}}>Loading inventory...</div>
        ) : (
          <div className="plant-matrix">
            {filteredPlants.length > 0 ? (
              filteredPlants.map(plant => (
                <div key={plant.id} className="plant-card glass-card" style={{ display: 'flex', flexDirection: 'column', filter: plant.quantity === 0 ? 'grayscale(100%)' : 'none', opacity: plant.quantity === 0 ? 0.8 : 1 }}>
                  <img src={plant.image_url} alt={plant.name} className="plant-img" style={{ height: '180px' }} />
                  <div className="plant-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 className="plant-name" style={{ margin: 0 }}>{plant.name}</h3>
                      <span style={{ background: 'var(--bg-light)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500' }}>
                        Qty: {plant.quantity}
                      </span>
                    </div>
                    <div className="plant-price" style={{ margin: '10px 0' }}>${plant.price.toFixed(2)}</div>
                    
                    <div style={{ marginTop: 'auto' }}>
                      {plant.quantity === 0 ? (
                        <button onClick={() => handleRestock(plant.id)} className="btn" style={{ width: '100%', background: '#ef4444', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                          <RefreshCw size={16} /> Restock
                        </button>
                      ) : (
                        <button onClick={() => handleRestock(plant.id)} className="btn glass-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                          Update Stock
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: 'var(--bg-light)', borderRadius: '12px' }}>
                No plants found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseryInventory;
