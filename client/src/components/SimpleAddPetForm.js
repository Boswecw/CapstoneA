
// client/src/components/SimpleAddPetForm.js
import React, { useState } from 'react';

const SimpleAddPetForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    age: '',
    description: '',
    image: '',
    adopted: false
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('📝 SimpleAddPetForm: Submitting form data:', formData);
      
      const petData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null
      };
      
      await onSubmit(petData);
      console.log('✅ SimpleAddPetForm: Pet submitted successfully');
    } catch (error) {
      console.error('❌ SimpleAddPetForm: Error submitting pet:', error);
      alert('Error adding pet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  console.log('🔧 SimpleAddPetForm: Rendering form');

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '600px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🐾 Add New Pet</h2>
        <button 
          onClick={() => {
            console.log('🖱️ SimpleAddPetForm: Close button clicked');
            onCancel();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          type="button"
        >
          ×
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
        {/* Pet Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 600,
            color: '#333',
            fontSize: '14px'
          }}>
            Pet Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter pet's name"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        {/* Pet Type */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 600,
            color: '#333',
            fontSize: '14px'
          }}>
            Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box',
              backgroundColor: 'white'
            }}
          >
            <option value="">Select type</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Bird">Bird</option>
            <option value="Rabbit">Rabbit</option>
            <option value="Hamster">Hamster</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Row: Breed and Age */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px', 
          marginBottom: '20px' 
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 600,
              color: '#333',
              fontSize: '14px'
            }}>
              Breed
            </label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              placeholder="Enter breed (optional)"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 600,
              color: '#333',
              fontSize: '14px'
            }}>
              Age (years)
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter age"
              min="0"
              max="30"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Image URL */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 600,
            color: '#333',
            fontSize: '14px'
          }}>
            Image URL
          </label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/pet-image.jpg"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
            💡 Try Unsplash: https://unsplash.com/s/photos/pets
          </small>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 600,
            color: '#333',
            fontSize: '14px'
          }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Tell us about this pet's personality, needs, etc."
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
              minHeight: '100px',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Adoption Status */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }}>
            <input
              type="checkbox"
              name="adopted"
              checked={formData.adopted}
              onChange={handleChange}
              style={{ width: '18px', height: '18px' }}
            />
            <span>Mark as adopted</span>
          </label>
        </div>

        {/* Form Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          justifyContent: 'flex-end',
          paddingTop: '20px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <button 
            type="button" 
            onClick={() => {
              console.log('🖱️ SimpleAddPetForm: Cancel button clicked');
              onCancel();
            }}
            style={{
              padding: '12px 24px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'background-color 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              minWidth: '120px',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Adding Pet...' : 'Add Pet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleAddPetForm;