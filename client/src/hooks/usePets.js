// client/src/hooks/usePets.js - Enhanced Version
import { useState, useEffect, useCallback } from "react";

// API configuration
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const usePets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Helper function for making API requests
  const makeRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            `HTTP error! status: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  };

  // Fetch all pets with optional filters and pagination
  const fetchPets = useCallback(
    async (filters = {}, page = 1) => {
      try {
        setLoading(true);
        setError(null);
        console.log("🐾 Fetching pets from API...", { filters, page });

        // Build query string
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          ...filters,
        });

        const response = await makeRequest(`/pets?${queryParams}`);
        console.log("✅ Pets fetched successfully:", response);

        // Handle API response format
        let petsArray = [];
        let paginationData = {};

        if (response.success && response.data) {
          petsArray = Array.isArray(response.data) ? response.data : [];
          paginationData = {
            page: response.currentPage || page,
            limit: pagination.limit,
            total: response.total || 0,
            totalPages: response.pages || 0,
          };
        } else if (Array.isArray(response)) {
          petsArray = response;
        }

        console.log("📋 Processed pets array:", petsArray);
        setPets(petsArray);
        setPagination(paginationData);

        return { pets: petsArray, pagination: paginationData };
      } catch (err) {
        console.error("❌ Error fetching pets:", err);
        setError(err.message);
        setPets([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  // Fetch featured pets
  const fetchFeaturedPets = useCallback(async (limit = 6) => {
    try {
      setLoading(true);
      setError(null);
      console.log("⭐ Fetching featured pets...");

      const response = await makeRequest(`/pets/featured?limit=${limit}`);
      console.log("✅ Featured pets fetched:", response);

      const featuredPets = response.success ? response.data : response;
      return Array.isArray(featuredPets) ? featuredPets : [];
    } catch (err) {
      console.error("❌ Error fetching featured pets:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get pets by type
  const fetchPetsByType = useCallback(
    async (type, page = 1) => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔍 Fetching pets by type:", type);

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
        });

        const response = await makeRequest(`/pets/type/${type}?${queryParams}`);
        console.log("✅ Pets by type fetched:", response);

        const petsData = response.success ? response.data : response;
        const petsArray = Array.isArray(petsData) ? petsData : [];

        setPets(petsArray);
        setPagination((prev) => ({
          ...prev,
          page: response.currentPage || page,
          total: response.total || 0,
          totalPages: response.pages || 0,
        }));

        return petsArray;
      } catch (err) {
        console.error("❌ Error fetching pets by type:", err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  // Add new pet
  const addPet = useCallback(async (petData) => {
    try {
      console.log("➕ Adding new pet:", petData);

      const response = await makeRequest("/pets", {
        method: "POST",
        body: JSON.stringify(petData),
      });

      console.log("✅ Pet added successfully:", response);

      // Extract the pet data from response
      const newPet = response.success ? response.data : response;

      // Add to beginning of pets array
      setPets((prevPets) => [newPet, ...prevPets]);

      return newPet;
    } catch (err) {
      console.error("❌ Error adding pet:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Update existing pet
  const updatePet = useCallback(async (id, petData) => {
    try {
      console.log("✏️ Updating pet:", id, petData);

      const response = await makeRequest(`/pets/${id}`, {
        method: "PUT",
        body: JSON.stringify(petData),
      });

      console.log("✅ Pet updated successfully:", response);

      const updatedPet = response.success ? response.data : response;

      // Update pets array
      setPets((prevPets) =>
        prevPets.map((pet) => (pet._id === id ? updatedPet : pet)),
      );

      return updatedPet;
    } catch (err) {
      console.error("❌ Error updating pet:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete pet
  const deletePet = useCallback(async (id) => {
    try {
      console.log("🗑️ Deleting pet:", id);

      await makeRequest(`/pets/${id}`, {
        method: "DELETE",
      });

      console.log("✅ Pet deleted successfully");

      // Remove from pets array
      setPets((prevPets) => prevPets.filter((pet) => pet._id !== id));

      return true;
    } catch (err) {
      console.error("❌ Error deleting pet:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Vote for pet - FIXED: Use POST method to match your controller
  const votePet = useCallback(async (id, voteType = "up") => {
    try {
      console.log("👍 Voting for pet:", id, voteType);

      const response = await makeRequest(`/pets/${id}/vote`, {
        method: "POST", // Changed from PATCH to POST
        body: JSON.stringify({ voteType }),
      });

      console.log("✅ Vote submitted successfully:", response);

      const voteData = response.success ? response.data : response;

      // Update the specific pet's vote data
      setPets((prevPets) =>
        prevPets.map((pet) =>
          pet._id === id ? { ...pet, votes: voteData.votes || pet.votes } : pet,
        ),
      );

      return voteData;
    } catch (err) {
      console.error("❌ Error voting for pet:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Rate pet
  const ratePet = useCallback(async (id, rating, comment = "") => {
    try {
      console.log("⭐ Rating pet:", id, rating, comment);

      const response = await makeRequest(`/pets/${id}/rate`, {
        method: "POST",
        body: JSON.stringify({ rating, comment }),
      });

      console.log("✅ Rating submitted successfully:", response);

      const ratingData = response.success ? response.data : response;

      // Update the pet's rating data
      setPets((prevPets) =>
        prevPets.map((pet) =>
          pet._id === id
            ? {
                ...pet,
                averageRating: ratingData.averageRating,
                ratings: ratingData.ratings || pet.ratings,
              }
            : pet,
        ),
      );

      return ratingData;
    } catch (err) {
      console.error("❌ Error rating pet:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Get single pet by ID
  const getPetById = useCallback(async (id) => {
    try {
      console.log("🔍 Fetching pet by ID:", id);

      const response = await makeRequest(`/pets/${id}`);
      console.log("✅ Pet fetched by ID:", response);

      return response.success ? response.data : response;
    } catch (err) {
      console.error("❌ Error fetching pet by ID:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Client-side filter functions
  const filterPetsByType = useCallback(
    (type) => {
      if (!type || type === "all") return pets;
      return pets.filter(
        (pet) => pet.type && pet.type.toLowerCase() === type.toLowerCase(),
      );
    },
    [pets],
  );

  const filterPetsByStatus = useCallback(
    (available = true) => {
      return pets.filter((pet) => pet.available === available);
    },
    [pets],
  );

  const filterPetsBySize = useCallback(
    (size) => {
      if (!size || size === "all") return pets;
      return pets.filter(
        (pet) => pet.size && pet.size.toLowerCase() === size.toLowerCase(),
      );
    },
    [pets],
  );

  const filterPetsByPriceRange = useCallback(
    (minPrice, maxPrice) => {
      return pets.filter((pet) => {
        const price = pet.price || 0;
        return price >= (minPrice || 0) && price <= (maxPrice || Infinity);
      });
    },
    [pets],
  );

  // Search pets by name, breed, or description
  const searchPets = useCallback(
    (searchTerm) => {
      if (!searchTerm) return pets;

      const term = searchTerm.toLowerCase();
      return pets.filter(
        (pet) =>
          (pet.name && pet.name.toLowerCase().includes(term)) ||
          (pet.breed && pet.breed.toLowerCase().includes(term)) ||
          (pet.description && pet.description.toLowerCase().includes(term)),
      );
    },
    [pets],
  );

  // Get pet statistics
  const getPetStats = useCallback(() => {
    const total = pets.length;
    const available = pets.filter((pet) => pet.available).length;
    const adopted = pets.filter((pet) => !pet.available).length;
    const byType = pets.reduce((acc, pet) => {
      const type = pet.type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const avgPrice =
      pets.length > 0
        ? pets.reduce((sum, pet) => sum + (pet.price || 0), 0) / pets.length
        : 0;

    return {
      total,
      available,
      adopted,
      byType,
      averagePrice: Math.round(avgPrice * 100) / 100,
    };
  }, [pets]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh/refetch pets
  const refresh = useCallback(() => {
    return fetchPets({}, pagination.page);
  }, [fetchPets, pagination.page]);

  // Load pets on component mount
  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  // Debug logging
  useEffect(() => {
    console.log("📊 usePets state updated:", {
      petsCount: pets.length,
      loading,
      error,
      pagination,
    });
  }, [pets, loading, error, pagination]);

  return {
    // Data
    pets,
    loading,
    error,
    pagination,

    // Main API actions
    fetchPets,
    fetchFeaturedPets,
    fetchPetsByType,
    addPet,
    updatePet,
    deletePet,
    getPetById,

    // Interactive actions
    votePet,
    ratePet,

    // Client-side utilities
    filterPetsByType,
    filterPetsByStatus,
    filterPetsBySize,
    filterPetsByPriceRange,
    searchPets,
    getPetStats,

    // Utility functions
    refresh,
    refetch: refresh, // Alias for backward compatibility
    clearError,
  };
};

// Optional: Export a companion hook for products
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const makeRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            `HTTP error! status: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  };

  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams(filters);
      const response = await makeRequest(`/products?${queryParams}`);

      const productsArray = response.success ? response.data : response;
      setProducts(Array.isArray(productsArray) ? productsArray : []);

      return productsArray;
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      setError(err.message);
      setProducts([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedProducts = useCallback(async (limit = 6) => {
    try {
      const response = await makeRequest(`/products/featured?limit=${limit}`);
      return response.success ? response.data : response;
    } catch (err) {
      console.error("❌ Error fetching featured products:", err);
      setError(err.message);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    fetchFeaturedProducts,
    clearError: () => setError(null),
  };
};
