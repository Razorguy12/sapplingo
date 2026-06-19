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

  const convertDriveUrl = (url) => {
    if (!url || url.trim() === '') return '';

    // Remove any trailing parameters or fragments
    url = url.split('&export')[0].split('#')[0];

    // Pattern 1: /file/d/{id}/view or /file/d/{id}
    let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      console.log('Converted (Pattern 1):', match[1]);
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }

    // Pattern 2: ?id={id} format
    match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && url.includes('drive.google.com')) {
      console.log('Converted (Pattern 2):', match[1]);
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }

    // Pattern 3: folders/{id}
    match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (match) {
      console.log('Converted (Pattern 3 - folder):', match[1]);
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }

    // If it's already a proper URL, return as is
    if (url.startsWith('http') || url.startsWith('https')) {
      console.log('URL already valid:', url);
      return url;
    }

    return url;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'is_indoor') {
      setFormData(prev => ({ ...prev, is_indoor: value === 'true' }));
    } else if (name === 'image_url') {
      const converted = convertDriveUrl(value);
      console.log('Original:', value);
      console.log('Converted:', converted);
      setFormData(prev => ({ ...prev, image_url: converted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleExtraImageChange = (index, value) => {
    const newImages = [...extraImages];
    const converted = convertDriveUrl(value);
    console.log('Extra image', index, '- Original:', value, 'Converted:', converted);
    newImages[index] = converted;
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
      const response = await axios.post('https://sapplingo.onrender.com/api/generate-details', {
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

    // Validate main image
    if (!formData.image_url) {
      alert('Please provide a primary image URL');
      return;
    }

    setLoading(true);
    try {
      const validExtraImages = extraImages
        .filter(url => url && url.trim() !== '')
        .map(url => url.trim());

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        rating: 5.0,
        image_url: formData.image_url.trim(),
        extra_images: validExtraImages.length > 0 ? validExtraImages.join('|') : ''
      };

      console.log('Submitting payload:', payload);

      await axios.post('https://sapplingo.onrender.com/api/plants', payload);
      alert('Plant listed successfully!');
      navigate('/buy');
    } catch (error) {
      console.error('Error adding plant:', error);
      alert('Failed to list plant. Please check:\n1. All fields are filled\n2. Image URLs are accessible\n3. Google Drive files are shared publicly');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sell-page container animate-fade-in">
      <form className="sell-form animate-slide-up" onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: '30px', color: 'var(--primary-color)' }}>List Your Plant for Sale</h2>

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

        <div className="form-group" style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Climate</label>
            <select name="climate" className="form-input" value={formData.climate} onChange={handleChange} required>
              <option value="">Select Climate</option>
              <option value="Tropical">Tropical</option>
              <option value="Temperate">Temperate</option>
              <option value="Arid">Arid</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
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

        <div className="form-group" style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
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
          <div style={{ flex: 1 }}>
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
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
            💡 Tip: Make sure your Google Drive file is shared with "Anyone with the link can view"
          </div>
          <input
            type="text"
            name="image_url"
            className="form-input"
            placeholder="Paste Google Drive share link or image URL"
            value={formData.image_url}
            onChange={handleChange}
            required
          />
          {formData.image_url && (
            <div style={{ marginTop: '10px' }}>
              <img
                src={formData.image_url}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--primary-color)' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const errorMsg = e.target.nextSibling;
                  if (errorMsg) errorMsg.style.display = 'block';
                  console.error('Image failed to load:', formData.image_url);
                }}
                onLoad={() => console.log('Image loaded successfully:', formData.image_url)}
              />
              <p style={{ display: 'none', color: '#ef4444', fontSize: '0.85rem', marginTop: '8px', padding: '10px', background: '#ffebee', borderRadius: '6px' }}>
                ⚠️ Image could not be loaded. Check that:
                <br />1. The Google Drive file is shared publicly ("Anyone with the link")
                <br />2. The link is accessible in a private browser window
                <br />3. Try using a direct image URL instead
              </p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Additional Images</label>
          {extraImages.map((img, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="https://example.com/extra.jpg or Google Drive link"
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

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Listing Plant...' : 'List Plant'}
        </button>
      </form>
    </div>
  );
};

export default Sell;