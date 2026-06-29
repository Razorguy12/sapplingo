import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Home, Phone, Mail, User } from 'lucide-react';
import { API_URL } from '../config';

const Buy = () => {
  const [nurseries, setNurseries] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nurseriesRes, sellersRes, plantsRes] = await Promise.all([
          axios.get(`${API_URL}/api/nurseries`),
          axios.get(`${API_URL}/api/individual-sellers`),
          axios.get(`${API_URL}/api/plants`)
        ]);
        setNurseries(nurseriesRes.data);
        setSellers(sellersRes.data);
        setPlants(plantsRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredNurseries = nurseries.filter(nursery => {
    const term = searchTerm.toLowerCase();
    const matchesNurseryName = nursery.nursery_name.toLowerCase().includes(term);
    
    // Check if any plant in this nursery matches the search term
    const nurseryPlants = plants.filter(p => p.nursery_id === nursery.id);
    const matchesPlantName = nurseryPlants.some(p => 
      p.name.toLowerCase().includes(term) || 
      p.scientific_name.toLowerCase().includes(term)
    );

    return matchesNurseryName || matchesPlantName;
  });

  const filteredSellers = sellers.filter(seller => {
    const term = searchTerm.toLowerCase();
    const matchesSellerName = seller.name.toLowerCase().includes(term);
    
    // Check if any plant by this seller matches the search term
    const sellerPlants = plants.filter(p => p.user_id === seller.id);
    const matchesPlantName = sellerPlants.some(p => 
      p.name.toLowerCase().includes(term) || 
      p.scientific_name.toLowerCase().includes(term)
    );

    return matchesSellerName || matchesPlantName;
  });

  return (
    <div className="buy-page container animate-fade-in page-wrapper">
      <div className="search-bar animate-slide-up glass" style={{ border: 'none' }}>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search for nurseries or plants..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent' }}
        />
        <button className="search-btn glass-btn">
          <Search size={20} />
        </button>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-dark)', fontWeight: '500'}}>Loading amazing sellers and nurseries...</div>
      ) : (
        <div className="plant-matrix animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {filteredNurseries.length > 0 || filteredSellers.length > 0 ? (
            <React.Fragment>
              {filteredNurseries.map(nursery => (
              <Link to={`/nursery/${nursery.id}`} key={nursery.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="plant-card glass-card" style={{ height: '100%', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 20px' }}>
                  <div style={{ background: 'var(--primary-color)', borderRadius: '50%', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(116, 198, 157, 0.4)' }}>
                     <Home size={40} color="white" />
                  </div>
                  <div className="plant-info" style={{ textAlign: 'center', padding: '0', width: '100%' }}>
                    <h3 className="plant-name" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{nursery.nursery_name}</h3>
                    <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      <Phone size={14} /> {nursery.phone_number || 'N/A'}
                    </div>
                    <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      <Mail size={14} /> {nursery.email || 'N/A'}
                    </div>
                    <div className="plant-price" style={{ fontSize: '0.95rem', color: 'var(--primary-color)', background: 'var(--bg-light)', padding: '5px 15px', borderRadius: '20px', display: 'inline-block', marginTop: '10px' }}>
                      {plants.filter(p => p.nursery_id === nursery.id).length} Plants Available
                    </div>
                  </div>
                </div>
              </Link>
            ))}

              {filteredSellers.map(seller => (
                <Link to={`/seller/${seller.id}`} key={`seller-${seller.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="plant-card glass-card" style={{ height: '100%', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 20px' }}>
                    <div style={{ background: '#3b82f6', borderRadius: '50%', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}>
                       <User size={40} color="white" />
                    </div>
                    <div className="plant-info" style={{ textAlign: 'center', padding: '0', width: '100%' }}>
                      <h3 className="plant-name" style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{seller.name} (Individual)</h3>
                      <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <Phone size={14} /> {seller.phone_number || 'N/A'}
                      </div>
                      <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <Mail size={14} /> {seller.email || 'N/A'}
                      </div>
                      <div className="plant-price" style={{ fontSize: '0.95rem', color: '#3b82f6', background: 'var(--bg-light)', padding: '5px 15px', borderRadius: '20px', display: 'inline-block', marginTop: '10px' }}>
                        {plants.filter(p => p.user_id === seller.id).length} Plants Available
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </React.Fragment>
          ) : (
            <div style={{width: '100%', textAlign: 'center', padding: '40px', color: 'var(--text-dark)', fontWeight: '500', gridColumn: '1 / -1'}} className="glass-panel">
              No nurseries or sellers found matching your search criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Buy;
