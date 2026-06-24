import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const LandingPage = ({ onGetStarted }) => {
  const [plants, setPlants] = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8001/api/plants?limit=9');
        setPlants(res.data);
      } catch (err) {
        console.error('Failed to fetch plants', err);
      } finally {
        setPlantsLoading(false);
      }
    };
    fetchPlants();
  }, []);

  useEffect(() => {
    if (plants.length === 0) return;
    const el = scrollRef.current;
    if (!el) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // scroll by one card width (1/3 of visible area)
        const cardWidth = scrollRef.current.clientWidth / 3;
        scrollRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [plants]);

  return (
    <div className="landing-page">
      {/* ── Header ── */}
      <header className="landing-header">
        <div className="landing-logo">🌱 Sapplingo</div>
        <nav className="landing-nav">
          <a href="#browse">Browse Plants</a>
          <a href="#sell">Sell Plants</a>
          <a href="#about">About</a>
          <button className="landing-nav-btn" onClick={onGetStarted}>Get Started</button>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="landing-hero" id="about">
        <div className="landing-hero-blob" aria-hidden="true" />
        <div className="landing-hero-content">
          <h1>Grow Your Indoor Jungle</h1>
          <p>
            Buy rare plants from local growers, sell your plants to plant lovers, and get
            AI-powered care tips—all in one place.
          </p>
          <div className="landing-hero-buttons">
            <button className="landing-btn landing-btn-primary" onClick={onGetStarted}>
              🛍️ Browse Plants
            </button>
            <button className="landing-btn landing-btn-secondary" onClick={onGetStarted}>
              📢 Sell a Plant
            </button>
          </div>
        </div>
      </section>

      {/* ── Why Sapplingo ── */}
      <section className="landing-section">
        <h2 className="landing-section-title">Why Sapplingo?</h2>
        <p className="landing-section-subtitle">Everything you need to build and share your plant collection</p>
        <div className="landing-features-grid">
          {[
            { icon: '🌿', title: 'Curated Selection', desc: 'Browse thousands of plants from verified local growers. Find rare varieties, easy-care plants, or trending specimens.' },
            { icon: '🌸', title: 'Direct Messaging', desc: 'Chat with sellers about plant health, care requirements, and shipping. Build relationships in the plant community.' },
            { icon: '🪴', title: 'AI Care Assistant', desc: 'Get personalized watering schedules, light recommendations, and troubleshooting tips for your specific plants.' },
            { icon: '🌻', title: 'Verified Reviews', desc: 'Read honest feedback from buyers. Know exactly what to expect before you purchase or list.' },
            { icon: '🌱', title: 'Safe Shipping', desc: 'Plants are delicate. We guide sellers on proper packaging and track every delivery.' },
            { icon: '🍃', title: 'Local Community', desc: 'Connect with plant lovers near you. Swap cuttings, attend meetups, and grow together.' },
          ].map((f) => (
            <div className="landing-feature-card" key={f.title}>
              <div className="landing-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="landing-section landing-how-it-works">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">How It Works</h2>
          <p className="landing-section-subtitle">Get your plants in 4 simple steps</p>
          <div className="landing-steps-grid">
            {[
              { n: '1', title: 'Browse & Search', desc: 'Filter by plant type, care level, price, or seller location. Use our AI to find plants that match your space.' },
              { n: '2', title: 'Connect', desc: "Message the seller, ask about care history, and negotiate shipping. Get to know who's growing your plants." },
              { n: '3', title: 'Receive & Care', desc: 'Your plant arrives safely. Our AI assistant guides you through its first weeks in your home.' },
              { n: '4', title: 'Grow & Share', desc: "Watch your plant thrive. Share photos, get tips, and when you're ready, list your cuttings for others." },
            ].map((s) => (
              <div className="landing-step" key={s.n}>
                <div className="landing-step-number">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explore Plants (Real Data) ── */}
      <section className="landing-plants-outer" id="browse">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Explore Plants</h2>
          <p className="landing-section-subtitle">Fresh picks straight from our marketplace</p>

          {plantsLoading ? (
            <div className="landing-plants-loading">
              {[...Array(3)].map((_, i) => (
                <div className="landing-plant-skeleton" key={i} />
              ))}
            </div>
          ) : plants.length === 0 ? (
            <p style={{ color: '#4a7c59', textAlign: 'center', padding: '2rem 0' }}>
              Could not load plants right now.{' '}
              <button className="landing-btn landing-btn-primary" style={{ marginLeft: '1rem' }} onClick={onGetStarted}>
                Sign in to browse
              </button>
            </p>
          ) : (
            <div className="landing-carousel-wrapper">
              <div className="landing-carousel-track" ref={scrollRef}>
                {plants.map((plant) => (
                  <div
                    className="landing-carousel-card"
                    key={plant.id}
                    onClick={onGetStarted}
                  >
                    <div className="landing-plant-image">
                      <img
                        src={plant.image_url}
                        alt={plant.name}
                        className="landing-plant-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '🌿';
                        }}
                      />
                    </div>
                    <div className="landing-plant-info">
                      <div className="landing-plant-name">{plant.name}</div>
                      {plant.scientific_name && (
                        <div className="landing-plant-meta">{plant.scientific_name}</div>
                      )}
                      {plant.rating != null && (
                        <div className="landing-plant-rating">
                          <span className="landing-star">⭐</span>
                          <span>{plant.rating}</span>
                        </div>
                      )}
                      <div className="landing-plant-price">${plant.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="landing-btn landing-btn-primary" onClick={onGetStarted}>
              View All Plants →
            </button>
          </div>
        </div>
      </section>


      {/* ── AI Section ── */}
      <section className="landing-ai-section">
        <div className="landing-ai-content">
          <h2>Meet Your AI Plant Expert</h2>
          <p>
            Ask anything about plant care. Get instant, personalized advice tailored to your home's
            light, humidity, and your schedule.
          </p>
          <div className="landing-ai-features">
            {[
              { icon: '💧', text: 'Smart Watering Schedules' },
              { icon: '☀️', text: 'Light Requirements' },
              { icon: '🐛', text: 'Pest Prevention' },
              { icon: '🌱', text: 'Growth Tips' },
            ].map((f) => (
              <div className="landing-ai-feature" key={f.text}>
                <div className="landing-ai-icon">{f.icon}</div>
                <div className="landing-ai-text">{f.text}</div>
              </div>
            ))}
          </div>
          <button className="landing-btn landing-btn-primary" onClick={onGetStarted}>
            Chat with Our AI
          </button>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta-section">
        <div className="landing-cta-content">
          <h2>Ready to Start Your Collection?</h2>
          <p>Join thousands of plant lovers buying and selling on Sapplingo. It's free to list, free to browse.</p>
          <button className="landing-btn landing-btn-primary landing-btn-large" onClick={onGetStarted}>
            Get Started Today
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-links">
          <a href="#terms">Terms of Service</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#contact">Contact Us</a>
          <a href="#blog">Blog</a>
        </div>
        <div>© 2026 Sapplingo. Helping plants and people grow together. 🌿</div>
      </footer>
    </div>
  );
};

export default LandingPage;
