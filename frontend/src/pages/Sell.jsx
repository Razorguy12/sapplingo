import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, Trash2 } from 'lucide-react';

const Sell = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [extraImages, setExtraImages] = useState(['']);
  
  const [formData, setFormData] = useState({
    name: '',
    scientific_name: '',
    age: '',
    price: '',
    image_url: '',
    description: '',
    climate: '',
    is_indoor: true,
    soil_type: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'is_indoor') {
      setFormData(prev => ({ ...prev, is_indoor: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleExtraImageChange = (index, value) => {
    const newImages = [...extraImages];
    newImages[index] = value;
    setExtraImages(newImages);
  };

  const addExtraImage = () => {
    setExtraImages([...extraImages, '']);
  };

  const removeExtraImage = (index) => {
    const newImages = extraImages.filter((_, i) => i !== index);
    setExtraImages(newImages.length ? newImages : ['']);
  };

  const handleAutoFill = async () => {
    if (!formData.name) {
      alert("Please enter a Plant Name first.");
      return;
    }
    setAiLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/generate-details', {
        plant_name: formData.name
      });
      const data = response.data;
      setFormData(prev => ({
        ...prev,
        scientific_name: data.scientific_name || prev.scientific_name,
        climate: data.climate || prev.climate,
        is_indoor: data.is_indoor !== undefined ? data.is_indoor : prev.is_indoor,
        soil_type: data.soil_type || prev.soil_type,
        description: data.description || prev.description
      }));
    } catch (error) {
      console.error("AI Auto-fill failed", error);
      alert("Failed to auto-fill details. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validExtraImages = extraImages.filter(url => url.trim() !== '');
      
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        rating: 5.0, // Default rating for new seller
        extra_images: validExtraImages.join(',')
      };
      await axios.post('http://localhost:8000/api/plants', payload);
      alert('Plant listed successfully!');
      navigate('/buy');
    } catch (error) {
      console.error('Error adding plant:', error);
      alert('Failed to list plant. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sell-page container animate-fade-in">
      <form className="sell-form animate-slide-up" onSubmit={handleSubmit}>
        <h2 style={{marginBottom: '30px', color: 'var(--primary-color)'}}>List Your Plant for Sale</h2>
        
        <div className="form-group" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Plant Name</label>
            <input 
              type="text" 
              name="name" 
              className="form-input" 
              placeholder="e.g. Monstera" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          <button 
            type="button" 
            onClick={handleAutoFill} 
            className="btn glass-btn" 
            style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary-color)', color: 'white', border: 'none' }}
            disabled={aiLoading}
          >
            <Sparkles size={18} />
            {aiLoading ? 'Thinking...' : 'Auto-fill with AI'}
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Scientific Name</label>
          <input 
            type="text" 
            name="scientific_name" 
            className="form-input" 
            placeholder="e.g. Monstera deliciosa" 
            value={formData.scientific_name} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group" style={{display: 'flex', gap: '20px'}}>
          <div style={{flex: 1}}>
            <label className="form-label">Climate</label>
            <select name="climate" className="form-input" value={formData.climate} onChange={handleChange} required>
              <option value="">Select Climate</option>
              <option value="Tropical">Tropical</option>
              <option value="Temperate">Temperate</option>
              <option value="Arid">Arid</option>
            </select>
          </div>
          <div style={{flex: 1}}>
            <label className="form-label">Placement</label>
            <select name="is_indoor" className="form-input" value={formData.is_indoor} onChange={handleChange}>
              <option value="true">Indoor</option>
              <option value="false">Outdoor</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Soil Type</label>
          <input 
            type="text" 
            name="soil_type" 
            className="form-input" 
            placeholder="e.g. Peat-based potting mix" 
            value={formData.soil_type} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-group" style={{display: 'flex', gap: '20px'}}>
          <div style={{flex: 1}}>
            <label className="form-label">Age</label>
            <input 
              type="text" 
              name="age" 
              className="form-input" 
              placeholder="e.g. 6 months" 
              value={formData.age} 
              onChange={handleChange} 
            />
          </div>
          <div style={{flex: 1}}>
            <label className="form-label">Price ($)</label>
            <input 
              type="number" 
              name="price" 
              step="0.01" 
              className="form-input" 
              placeholder="25.00" 
              value={formData.price} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Primary Image URL</label>
          <input 
            type="url" 
            name="image_url" 
            className="form-input" 
            placeholder="https://example.com/image.jpg" 
            value={formData.image_url} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Additional Images</label>
          {extraImages.map((img, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://example.com/extra.jpg" 
                value={img} 
                onChange={(e) => handleExtraImageChange(index, e.target.value)} 
              />
              {extraImages.length > 1 && (
                <button type="button" onClick={() => removeExtraImage(index)} className="btn glass-btn" style={{ padding: '0 15px', color: '#ef4444' }}>
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addExtraImage} className="btn btn-secondary glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
            <Plus size={16} /> Add Image
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Description & Care Factors</label>
          <textarea 
            name="description" 
            className="form-textarea" 
            placeholder="Tell buyers about this plant and its care requirements..."
            value={formData.description}
            onChange={handleChange}
            style={{ minHeight: '100px' }}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
          {loading ? 'Listing Plant...' : 'List Plant'}
        </button>
      </form>
    </div>
  );
};

export default Sell;
