import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Star, Clock, Home, ArrowLeft } from 'lucide-react';
import { API_URL } from '../config';

const NurseryView = () => {
  const { id } = useParams();
  const [nursery, setNursery] = useState(null);
  const [plants, setPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNurseryData = async () => {
      try {
        const [nurseriesRes, plantsRes] = await Promise.all([
          axios.get(`${API_URL}/api/nurseries`),
          axios.get(`${API_URL}/api/plants`)
        ]);
        
        const currentNursery = nurseriesRes.data.find(n => n.id === parseInt(id));
        setNursery(currentNursery);
        
        const nurseryPlants = plantsRes.data.filter(p => p.nursery_id === parseInt(id));
        setPlants(nurseryPlants);
      } catch (error) {
        console.error('Failed to fetch nursery data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNurseryData();
  }, [id]);

  const filteredPlants = plants.filter(plant => {
    const term = searchTerm.toLowerCase();
    return plant.name.toLowerCase().includes(term) || 
           plant.scientific_name.toLowerCase().includes(term);
  });

  return (
    <div className="buy-page container animate-fade-in page-wrapper">
      <Link to="/buy" className="glass-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '20px', textDecoration: 'none', color: 'var(--text-dark)' }}>
        <ArrowLeft size={16} /> Back to Nurseries
      </Link>
      
      {loading ? (
        <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-dark)', fontWeight: '500'}}>Loading nursery...</div>
      ) : !nursery ? (
        <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-dark)', fontWeight: '500'}} className="glass-panel">
          Nursery not found.
        </div>
      ) : (
        <>
          <div className="glass-panel animate-slide-up" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: 'var(--primary-color)', borderRadius: '50%', padding: '20px', color: 'white', boxShadow: '0 4px 12px rgba(116, 198, 157, 0.4)' }}>
              <Home size={30} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'var(--text-dark)' }}>{nursery.nursery_name}</h2>
              <p style={{ margin: '5px 0 0 0', color: 'var(--text-light)' }}>{plants.length} Plants Available • {nursery.phone_number || nursery.email}</p>
            </div>
          </div>

          <div className="search-bar animate-slide-up glass" style={{ border: 'none', animationDelay: '0.05s' }}>
            <input 
              type="text" 
              className="search-input" 
              placeholder={`Search plants in ${nursery.nursery_name}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent' }}
            />
            <button className="search-btn glass-btn">
              <Search size={20} />
            </button>
          </div>

          <div className="plant-matrix animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {filteredPlants.length > 0 ? (
              filteredPlants.map(plant => (
                <Link to={plant.quantity > 0 ? `/plant/${plant.id}` : '#'} key={plant.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="plant-card glass-card" style={{ height: '100%', cursor: plant.quantity > 0 ? 'pointer' : 'not-allowed', filter: plant.quantity === 0 ? 'grayscale(100%)' : 'none', opacity: plant.quantity === 0 ? 0.6 : 1, pointerEvents: plant.quantity > 0 ? 'auto' : 'none' }}>
                    <img src={plant.image_url} alt={plant.name} className="plant-img" />
                    <div className="plant-info">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 className="plant-name">{plant.name}</h3>
                        {plant.quantity === 0 && (
                          <span style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            Stocked Out
                          </span>
                        )}
                      </div>
                      <div className="plant-scientific">{plant.scientific_name}</div>
                      <div className="plant-meta">
                        <span style={{display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-light)'}}>
                          <Clock size={16} /> {plant.age || 'Unknown age'}
                        </span>
                        <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                          <Star size={16} color="#FFD700" fill="#FFD700" /> {plant.rating || 'New'}
                        </span>
                      </div>
                      <div className="plant-price">${plant.price.toFixed(2)}</div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{width: '100%', textAlign: 'center', padding: '40px', color: 'var(--text-dark)', fontWeight: '500', gridColumn: '1 / -1'}} className="glass-panel">
                No plants found in this nursery matching your search.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NurseryView;
