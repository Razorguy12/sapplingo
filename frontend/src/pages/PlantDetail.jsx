import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Star, Droplets, Sun, Home, Trees, MapPin } from 'lucide-react';

const PlantDetail = ({ currentUser }) => {
  const { id } = useParams();
  const location = useLocation();
  const isFromCollection = location.state?.fromCollection;
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8001/api/plants/${id}`);
        setPlant(response.data);
        setActiveImage(response.data.image_url);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching plant details", error);
        setLoading(false);
      }
    };
    fetchPlant();
  }, [id]);

  if (loading) {
    return <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>Loading plant details...</div>;
  }

  if (!plant) {
    return <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>Plant not found!</div>;
  }

  // Parse extra images safely
  let images = [plant.image_url];
  if (plant.extra_images) {
    const extra = plant.extra_images.split(',').map(url => url.trim()).filter(url => url);
    images = [...images, ...extra];
  }

  const handleAddToCart = async () => {
    try {
      await axios.post('http://127.0.0.1:8001/api/cart', {
        user_id: currentUser.id,
        plant_id: plant.id,
        quantity: 1
      });
      window.dispatchEvent(new Event('cartUpdated'));
      alert('Successfully added to cart!');
    } catch (error) {
      console.error('Failed to add to cart', error);
      alert('Failed to add to cart');
    }
  };

  const handleCareInsights = () => {
    window.dispatchEvent(new CustomEvent('openCareInsights', { detail: { plantName: plant.name } }));
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <Link to={currentUser?.is_admin ? "/" : "/buy"} className="btn btn-secondary glass-btn" style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <ArrowLeft size={18} /> {currentUser?.is_admin ? "Back to Home" : "Back to Shop"}
      </Link>
      
      <div className="plant-detail-layout">
        {/* Image Gallery */}
        <div className="plant-gallery glass-panel">
          <div className="main-image-container">
            <img src={activeImage} alt={plant.name} className="main-image animate-fade-in" />
          </div>
          <div className="thumbnail-strip">
            {images.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`${plant.name} view ${idx + 1}`} 
                className={`thumbnail glass ${activeImage === img ? 'active' : ''}`}
                onClick={() => setActiveImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="plant-info glass-panel">
          <h1 className="plant-name" style={{ color: 'var(--primary-color)', fontSize: '2.5rem', marginBottom: '5px' }}>{plant.name}</h1>
          <p className="scientific-name" style={{ color: 'var(--text-dark)', marginBottom: '20px', fontSize: '1.2rem', fontStyle: 'italic' }}>{plant.scientific_name}</p>
          
          <div className="price-rating" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <span className="price" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>${plant.price.toFixed(2)}</span>
            {plant.rating && (
              <span className="rating" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '1.2rem', color: 'var(--text-dark)' }}>
                <Star size={24} fill="#f59e0b" color="#f59e0b" /> {plant.rating}
              </span>
            )}
          </div>
          
          <p className="description" style={{ color: 'var(--text-dark)', lineHeight: '1.6', marginBottom: '30px', fontSize: '1.1rem' }}>{plant.description}</p>
          
          <div className="characteristics-grid">
            <div className="char-item glass">
              <MapPin size={24} color="var(--primary-color)" />
              <div>
                <strong style={{ color: 'var(--primary-color)' }}>Climate</strong>
                <p style={{ color: 'var(--text-dark)', margin: 0 }}>{plant.climate || "Adaptable"}</p>
              </div>
            </div>
            
            <div className="char-item glass">
              {plant.is_indoor ? <Home size={24} color="var(--primary-color)" /> : <Trees size={24} color="var(--primary-color)" />}
              <div>
                <strong style={{ color: 'var(--primary-color)' }}>Placement</strong>
                <p style={{ color: 'var(--text-dark)', margin: 0 }}>{plant.is_indoor ? "Indoor" : "Outdoor"}</p>
              </div>
            </div>
            
            <div className="char-item glass">
              <Sun size={24} color="var(--primary-color)" />
              <div>
                <strong style={{ color: 'var(--primary-color)' }}>Age</strong>
                <p style={{ color: 'var(--text-dark)', margin: 0 }}>{plant.age || "Unknown"}</p>
              </div>
            </div>
            
            <div className="char-item glass">
              <Droplets size={24} color="var(--primary-color)" />
              <div>
                <strong style={{ color: 'var(--primary-color)' }}>Soil Type</strong>
                <p style={{ color: 'var(--text-dark)', margin: 0 }}>{plant.soil_type || "Standard Mix"}</p>
              </div>
            </div>
          </div>
          
          {!currentUser?.is_admin && (
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button onClick={handleAddToCart} className="btn btn-primary glass-btn" style={{ flex: 1, padding: '15px', fontSize: '1.1rem' }}>
                {isFromCollection ? 'Order again' : 'Add to Pickup Basket'}
              </button>
              {isFromCollection && (
                <button onClick={handleCareInsights} className="btn glass-btn" style={{ flex: 1, padding: '15px', fontSize: '1.1rem', background: 'transparent', border: '2px solid var(--primary-color)', color: 'var(--primary-color)', fontWeight: '500' }}>
                  Get Care Insights
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantDetail;
