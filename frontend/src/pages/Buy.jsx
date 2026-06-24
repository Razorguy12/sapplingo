import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Star, Clock, Droplets, Sun, Home, Trees } from 'lucide-react';
import { API_URL } from '../config';

const Buy = () => {
  const [plants, setPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [climateFilter, setClimateFilter] = useState('');
  const [placementFilter, setPlacementFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState(150);
  const [minRating, setMinRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/plants`);
        setPlants(response.data);
      } catch (error) {
        console.error('Failed to fetch plants', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlants();
  }, []);

  const filteredPlants = plants.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          plant.scientific_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClimate = climateFilter ? plant.climate === climateFilter : true;
    
    let matchesPlacement = true;
    if (placementFilter === 'indoor') matchesPlacement = plant.is_indoor === true;
    if (placementFilter === 'outdoor') matchesPlacement = plant.is_indoor === false;

    const matchesPrice = plant.price <= maxPrice;
    const matchesRating = plant.rating ? plant.rating >= minRating : minRating === 0;

    return matchesSearch && matchesClimate && matchesPlacement && matchesPrice && matchesRating;
  });

  return (
    <div className="buy-page container animate-fade-in page-wrapper">
      <div className="search-bar animate-slide-up glass" style={{ border: 'none' }}>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search for plants..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent' }}
        />
        <button className="search-btn glass-btn">
          <Search size={20} />
        </button>
      </div>

      <div className="filters-container glass-panel animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <strong style={{ color: 'var(--primary-color)' }}>Filters: </strong>
        <select 
          className="filter-select" 
          value={climateFilter} 
          onChange={(e) => setClimateFilter(e.target.value)}
        >
          <option value="">All Climates</option>
          <option value="Tropical">Tropical</option>
          <option value="Temperate">Temperate</option>
          <option value="Arid">Arid</option>
        </select>

        <select 
          className="filter-select" 
          value={placementFilter} 
          onChange={(e) => setPlacementFilter(e.target.value)}
        >
          <option value="">Any Placement</option>
          <option value="indoor">Indoor Only</option>
          <option value="outdoor">Outdoor Only</option>
        </select>

        <div className="slider-group max-price-slider" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: 'var(--text-dark)', fontSize: '0.9rem', width: '110px' }}>Max Price: ${maxPrice}</label>
          <input type="range" min="0" max="150" step="5" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="range-slider" />
        </div>
        
        <div className="slider-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ color: 'var(--text-dark)', fontSize: '0.9rem', width: '110px' }}>Min Rating: {minRating} <Star size={12} display="inline" fill="var(--primary-color)" color="var(--primary-color)"/></label>
          <input type="range" min="0" max="5" step="0.5" value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="range-slider" />
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-dark)', fontWeight: '500'}}>Loading amazing plants...</div>
      ) : (
        <div className="plant-matrix animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {filteredPlants.length > 0 ? (
            filteredPlants.map(plant => (
              <Link to={`/plant/${plant.id}`} key={plant.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="plant-card glass-card" style={{ height: '100%', cursor: 'pointer' }}>
                  <img src={plant.image_url} alt={plant.name} className="plant-img" />
                  <div className="plant-info">
                    <h3 className="plant-name">{plant.name}</h3>
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
            <div style={{width: '100%', textAlign: 'center', padding: '40px', color: 'var(--text-dark)', fontWeight: '500'}} className="glass-panel">
              No plants found matching your search criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Buy;
