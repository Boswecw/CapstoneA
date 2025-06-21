// client/src/hooks/usePets.js
import { useState, useEffect } from 'react';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const usePets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function for making API requests
  const makeRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  };

  // Fetch all pets
  const fetchPets = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🐾 Fetching pets from API...');
      
      const response = await makeRequest('/pets');
      console.log('✅ Pets fetched successfully:', response);
      
      // Handle different API response formats
      let petsArray;
      if (response.data && Array.isArray(response.data)) {
        // API returns {success: true, count: 10, data: Array(10)}
        petsArray = response.data;
      } else if (Array.isArray(response)) {
        // API returns Array directly
        petsArray = response;
      } else {
        // Fallback
        petsArray = [];
      }
      
      console.log('📋 Processed pets array:', petsArray);
      setPets(petsArray);
    } catch (err) {
      console.error('❌ Error fetching pets:', err);
      setError(err.message);
      setPets([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Add new pet
  const addPet = async (petData) => {
    try {
      console.log('➕ Adding new pet:', petData);
      
      const newPet = await makeRequest('/pets', {
        method: 'POST',
        body: JSON.stringify(petData),
      });
      
      console.log('✅ Pet added successfully:', newPet);
      setPets(prevPets => [newPet, ...prevPets]);
      return newPet;
    } catch (err) {
      console.error('❌ Error adding pet:', err);
      setError(err.message);
      throw err;
    }
  };

  // Update existing pet
  const updatePet = async (id, petData) => {
    try {
      console.log('✏️ Updating pet:', id, petData);
      
      const updatedPet = await makeRequest(`/pets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(petData),
      });
      
      console.log('✅ Pet updated successfully:', updatedPet);
      setPets(prevPets => 
        prevPets.map(pet => pet._id === id ? updatedPet : pet)
      );
      return updatedPet;
    } catch (err) {
      console.error('❌ Error updating pet:', err);
      setError(err.message);
      throw err;
    }
  };

  // Delete pet
  const deletePet = async (id) => {
    try {
      console.log('🗑️ Deleting pet:', id);
      
      await makeRequest(`/pets/${id}`, {
        method: 'DELETE',
      });
      
      console.log('✅ Pet deleted successfully');
      setPets(prevPets => prevPets.filter(pet => pet._id !== id));
    } catch (err) {
      console.error('❌ Error deleting pet:', err);
      setError(err.message);
      throw err;
    }
  };

  // Vote for pet (if you have voting functionality)
  const votePet = async (id) => {
    try {
      console.log('👍 Voting for pet:', id);
      
      const updatedPet = await makeRequest(`/pets/${id}/vote`, {
        method: 'PATCH',
      });
      
      console.log('✅ Vote submitted successfully:', updatedPet);
      setPets(prevPets => 
        prevPets.map(pet => pet._id === id ? updatedPet : pet)
      );
      return updatedPet;
    } catch (err) {
      console.error('❌ Error voting for pet:', err);
      setError(err.message);
      throw err;
    }
  };

  // Get single pet by ID
  const getPetById = async (id) => {
    try {
      console.log('🔍 Fetching pet by ID:', id);
      
      const pet = await makeRequest(`/pets/${id}`);
      console.log('✅ Pet fetched by ID:', pet);
      
      return pet;
    } catch (err) {
      console.error('❌ Error fetching pet by ID:', err);
      setError(err.message);
      throw err;
    }
  };

  // Filter pets by type
  const filterPetsByType = (type) => {
    if (!type || type === 'all') return pets;
    return pets.filter(pet => 
      pet.type && pet.type.toLowerCase() === type.toLowerCase()
    );
  };

  // Filter pets by adoption status
  const filterPetsByStatus = (adopted = false) => {
    return pets.filter(pet => pet.adopted === adopted);
  };

  // Get pet statistics
  const getPetStats = () => {
    const total = pets.length;
    const available = pets.filter(pet => !pet.adopted).length;
    const adopted = pets.filter(pet => pet.adopted).length;
    const byType = pets.reduce((acc, pet) => {
      const type = pet.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      available,
      adopted,
      byType
    };
  };

  // Load pets on component mount
  useEffect(() => {
    fetchPets();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('📊 usePets state updated:', {
      petsCount: pets.length,
      loading,
      error
    });
  }, [pets, loading, error]);

  return {
    // Data
    pets,
    loading,
    error,
    
    // Actions
    fetchPets,
    addPet,
    updatePet,
    deletePet,
    votePet,
    getPetById,
    
    // Utilities
    filterPetsByType,
    filterPetsByStatus,
    getPetStats,
    refetch: fetchPets,
    
    // Clear error
    clearError: () => setError(null)
  };
};