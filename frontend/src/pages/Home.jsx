import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Droplets, Sun } from 'lucide-react';
import { API_URL } from '../config';

const Home = ({ currentUser }) => {
  const [samplePlants, setSamplePlants] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [plantCount, setPlantCount] = useState(0);
  const [uniquePlants, setUniquePlants] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/${currentUser.id}`);
        const orders = res.data;
        setOrderCount(orders.length);
        let totalPlants = 0;
        const plantNames = new Set();
        orders.forEach(order => {
          order.items.forEach(item => {
            totalPlants += item.quantity;
            plantNames.add(item.plant.name);
          });
        });
        setPlantCount(totalPlants);
        setUniquePlants(Array.from(plantNames));
      } catch (error) {
        console.error('Failed to fetch user stats', error);
      }
    };
    fetchStats();
  }, [currentUser]);

  useEffect(() => {
    const fetchSamplePlants = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/plants?limit=6`);
        setSamplePlants(response.data);
      } catch (error) {
        console.error('Failed to fetch sample plants', error);
      }
    };
    fetchSamplePlants();
  }, []);

  useEffect(() => {
    if (samplePlants.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [samplePlants]);

  const firstName = currentUser?.name?.split(' ')[0] || 'User';

  return (
    <div className="animate-fade-in page-wrapper" style={{ margin: '0 auto', paddingBottom: '40px' }}>

      {/* ── Dashboard section: soft sage background ── */}
      <div style={{
        background: '#e8f0e9',          /* was #f2f1ee — now soft sage */
        padding: '40px 20px',
        borderRadius: '0 0 24px 24px',
        marginBottom: '40px'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <h1 className="page-title" style={{ marginBottom: '24px', color: '#1a3a2a' }}>
            Good morning, {firstName}
          </h1>

          {/* Stat Row */}
          <div className="stat-row" style={{ marginBottom: '16px' }}>

            {/* Orders — white card */}
            <Link to="/account" className="stat-card" style={{
              background: '#ffffff',
              border: '0.5px solid #c8dac9',
              boxShadow: 'none',
              textDecoration: 'none'
            }}>
              <div className="stat-card-title" style={{ color: '#6b8f70', fontSize: '13px', fontWeight: '500' }}>Orders</div>
              <div className="stat-card-value" style={{ color: '#1a3a2a' }}>{orderCount}</div>
            </Link>

            {/* Plants — amber tint card */}
            <Link to="/account" className="stat-card" style={{
              background: '#fef9ec',
              border: '0.5px solid #e8d88a',
              boxShadow: 'none',
              textDecoration: 'none'
            }}>
              <div className="stat-card-title" style={{ color: '#8a6820', fontSize: '13px', fontWeight: '500' }}>Plants</div>
              <div className="stat-card-value" style={{ color: '#5c3d00' }}>{plantCount}</div>
            </Link>

            {/* Alerts — red tint card */}
            <Link to="/" className="stat-card" style={{
              background: '#fce8e8',
              border: '0.5px solid #f0b0b0',
              boxShadow: 'none',
              textDecoration: 'none'
            }}>
              <div className="stat-card-title" style={{ color: '#b03030', fontSize: '13px', fontWeight: '500' }}>Alerts</div>
              <div className="stat-card-value" style={{ color: '#7a1e1e' }}>2</div>
            </Link>

          </div>

          {/* Bottom panels */}
          <div className="content-grid">

            {/* My Plants Panel */}
            <Link to="/my-plants" style={{ textDecoration: 'none', display: 'block' }}>
              <div className="panel" style={{
                background: '#ffffff',
                border: '0.5px solid #c8dac9',
                boxShadow: 'none',
                height: '100%'
              }}>
                <div className="panel-header">
                  <h2 className="panel-title" style={{ color: '#6b8f70', fontSize: '14px', fontWeight: '500' }}>My plants</h2>
                </div>
                <div className="panel-body" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '0 20px 20px 20px' }}>
                  {uniquePlants.length > 0 ? (
                    uniquePlants.map((plantName, index) => (
                      <span key={index} style={{
                        padding: '6px 14px',
                        background: '#e8f0e9',         /* sage pill — matches page bg */
                        border: '0.5px solid #c0d4c2',
                        borderRadius: '20px',
                        fontSize: '13px',
                        color: '#2d4a30',
                        fontWeight: '500'
                      }}>
                        {plantName}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '13px', color: '#6b8f70' }}>No plants yet</span>
                  )}
                </div>
              </div>
            </Link>

            {/* Care Reminders Panel */}
            <div className="panel" style={{
              background: '#ffffff',
              border: '0.5px solid #c8dac9',
              boxShadow: 'none'
            }}>
              <div className="panel-header">
                <h2 className="panel-title" style={{ color: '#6b8f70', fontSize: '14px', fontWeight: '500' }}>Care reminders</h2>
              </div>
              <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '0 20px 20px 20px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  fontSize: '14px', color: '#185fa5', fontWeight: '500',
                  padding: '10px 0',
                  borderBottom: '0.5px solid #e8f0e9'
                }}>
                  <Droplets size={16} color="#185fa5" /> Water Aloe today
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  fontSize: '14px', color: '#8a6820', fontWeight: '500',
                  padding: '10px 0'
                }}>
                  <Sun size={16} color="#c89020" /> Move Lily to sun
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Best Sellers section ── */}
      <section className="explore-section" style={{ width: '100%', padding: '0 10px' }}>
        <h2 className="section-title text-shadow" style={{ color: '#1a3a2a', fontSize: '20px', marginBottom: '20px' }}>Explore Best Sellers</h2>
        {samplePlants.length === 0 ? (
          <p style={{ color: '#6b8f70', fontSize: '14px' }}>Loading featured plants...</p>
        ) : (
          <div className="carousel-container" style={{ margin: 0, padding: 0 }}>
            <div className="dashboard-scroll" ref={scrollRef} style={{ display: 'flex', gap: '20px' }}>
              {samplePlants.map((plant) => (
                <div key={plant.id} className="plant-card glass-card" style={{ flex: '0 0 calc((100% - 40px) / 3)', border: '1px solid #e8f0e9', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <img src={plant.image_url} alt={plant.name} className="plant-img" />
                  <div className="plant-info" style={{ padding: '15px' }}>
                    <h3 className="plant-name" style={{ color: '#1a3a2a', fontSize: '16px', marginBottom: '8px' }}>{plant.name}</h3>
                    <div className="plant-meta" style={{ marginBottom: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b8f70', fontSize: '13px' }}>
                        <Star size={14} color="#FFD700" fill="#FFD700" />
                        {plant.rating || 'New'}
                      </span>
                    </div>
                    <div className="plant-price" style={{ color: '#2d6a4f', fontWeight: '600', fontSize: '16px' }}>${plant.price.toFixed(2)}</div>
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