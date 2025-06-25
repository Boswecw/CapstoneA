// server/routes/products.js - ES6 Module Version
import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Sample products data (since we don't have a Product model yet)
const sampleProducts = [
  {
    _id: 'prod1',
    name: 'Premium Dog Food',
    brand: 'NutriPup',
    category: 'food',
    price: 29.99,
    image: '/images/Dogfood.png',
    description: 'High-quality, nutritious dry dog food made with real chicken and wholesome grains. Perfect for adult dogs of all sizes.',
    inStock: true,
    featured: true,
    petType: ['dog'],
    rating: { average: 4.8, count: 124 }
  },
  {
    _id: 'prod2',
    name: 'Interactive Cat Toy',
    brand: 'PlayTime Plus',
    category: 'toys',
    price: 14.99,
    image: '/images/interactivecattoy.png',
    description: 'Engaging interactive toys to keep your cat entertained and mentally stimulated. Includes feather wand, puzzle balls, and catnip mice.',
    inStock: true,
    featured: true,
    petType: ['cat'],
    rating: { average: 4.5, count: 89 }
  },
  {
    _id: 'prod3',
    name: 'Comfortable Pet Bed',
    brand: 'CozyPaws',
    category: 'accessories',
    price: 45.99,
    image: '/images/PetBedLPicon.png',
    description: 'Soft and comfortable sleeping solution for pets of all sizes. Machine washable with non-slip bottom.',
    inStock: true,
    featured: true,
    petType: ['dog', 'cat'],
    rating: { average: 4.9, count: 156 }
  },
  {
    _id: 'prod4',
    name: 'Aquarium Starter Kit',
    brand: 'AquaLife',
    category: 'housing',
    price: 89.99,
    image: '/images/Aquarium.png',
    description: 'Complete aquarium setup kit with tank, filter, heater, LED lighting, and essential accessories for beginner fish keepers.',
    inStock: true,
    featured: false,
    petType: ['fish'],
    rating: { average: 4.3, count: 67 }
  },
  {
    _id: 'prod5',
    name: 'Premium Bird Seed Mix',
    brand: 'FeatherFresh',
    category: 'food',
    price: 19.99,
    image: '/images/birdseed.jpg',
    description: 'Nutritious blend of seeds and grains for all types of birds. Promotes healthy feathers and energy.',
    inStock: true,
    featured: false,
    petType: ['bird'],
    rating: { average: 4.6, count: 45 }
  },
  {
    _id: 'prod6',
    name: 'Dog Leash & Collar Set',
    brand: 'SafeWalk',
    category: 'accessories',
    price: 24.99,
    image: '/images/leash-collar.jpg',
    description: 'Durable leash and collar set available in multiple colors. Comfortable padding and secure clasps.',
    inStock: true,
    featured: false,
    petType: ['dog'],
    rating: { average: 4.4, count: 78 }
  }
];

// GET /api/products/featured - Get featured products
router.get('/featured', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    console.log(`🔍 Fetching ${limit} featured products...`);
    
    const featuredProducts = sampleProducts
      .filter(product => product.featured)
      .slice(0, limit);
    
    console.log(`✅ Returning ${featuredProducts.length} featured products`);
    
    res.json({
      success: true,
      data: featuredProducts
    });
    
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch featured products',
      error: error.message 
    });
  }
});

// GET /api/products - Get all products with filtering
router.get('/', (req, res) => {
  try {
    const { 
      category, 
      brand, 
      minPrice, 
      maxPrice,
      petType,
      search,
      page = 1,
      limit = 12
    } = req.query;

    console.log('🔍 Products query:', req.query);

    let filteredProducts = sampleProducts;

    // Apply filters
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (brand) {
      filteredProducts = filteredProducts.filter(p => 
        p.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }

    if (petType && petType !== 'all') {
      filteredProducts = filteredProducts.filter(p => 
        p.petType && p.petType.includes(petType)
      );
    }

    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    console.log(`📊 Found ${paginatedProducts.length} products (${filteredProducts.length} total)`);
    
    res.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredProducts.length,
        pages: Math.ceil(filteredProducts.length / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch products',
      error: error.message 
    });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', (req, res) => {
  try {
    const product = sampleProducts.find(p => p._id === req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch product',
      error: error.message 
    });
  }
});

// GET /api/products/category/:category - Get products by category
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const products = sampleProducts.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('❌ Error fetching products by category:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch products by category',
      error: error.message 
    });
  }
});

// POST /api/products - Create new product (protected route)
router.post('/', auth, (req, res) => {
  try {
    const newProduct = {
      _id: `prod${Date.now()}`,
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date()
    };
    
    sampleProducts.push(newProduct);
    
    console.log(`✅ Created new product: ${newProduct.name}`);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
    
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(400).json({ 
      success: false,
      message: 'Failed to create product',
      error: error.message 
    });
  }
});

export default router;