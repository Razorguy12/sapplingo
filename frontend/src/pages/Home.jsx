import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star } from 'lucide-react';

const Home = () => {
  const [samplePlants, setSamplePlants] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/plants?limit=6');
        setSamplePlants(response.data);
      } catch (error) {
        console.error('Failed to fetch sample plants', error);
      }
    };
    fetchPlants();
  }, []);

  useEffect(() => {
    if (samplePlants.length === 0) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If we reached the end, scroll back to beginning
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by one full view (which is about 3 cards)
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [samplePlants]);

  return (
    <div className="animate-fade-in page-wrapper">
      <section className="hero-section glass-panel">
        <div className="container">
          <h1 className="hero-title animate-slide-up text-shadow" style={{ color: 'var(--primary-color)' }}>Bring Nature Indoors</h1>
          <p className="hero-subtitle animate-slide-up text-shadow" style={{ animationDelay: '0.1s', color: 'var(--text-dark)', fontWeight: '500' }}>
            Discover the perfect plants for your home, get expert AI maintenance advice, and join our thriving plant-lover community.
          </p>
          <div className="hero-actions animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/buy" className="btn btn-primary btn-large glass-btn">Buy Plants</Link>
            <Link to="/sell" className="btn btn-secondary btn-large glass-btn">Sell a Plant</Link>
          </div>
        </div>
      </section>

      <section className="explore-section container">
        <h2 className="section-title text-shadow" style={{ color: 'var(--primary-color)' }}>Explore Best Sellers</h2>
        {samplePlants.length === 0 ? (
          <p style={{textAlign: 'center', color: 'var(--text-dark)'}}>Loading featured plants...</p>
        ) : (
          <div className="carousel-container">
            <div className="dashboard-scroll" ref={scrollRef}>
              {samplePlants.map((plant) => (
                <div key={plant.id} className="plant-card glass-card">
                  <img src={plant.image_url} alt={plant.name} className="plant-img" />
                  <div className="plant-info">
                    <h3 className="plant-name">{plant.name}</h3>
                    <div className="plant-meta">
                      <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                        <Star size={16} color="#FFD700" fill="#FFD700" /> 
                        {plant.rating || 'New'}
                      </span>
                    </div>
                    <div className="plant-price">${plant.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
