const Pet = require('../models/Pet');
const User = require('../models/User');

// Get all pets
const getAllPets = async (req, res) => {
  try {
    const { type, size, minPrice, maxPrice, sort, search } = req.query;
    const filter = { available: true };

    if (type && type !== 'all') filter.type = type;
    if (size) filter.size = size;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOption = {};
    if (sort === 'price-low') sortOption.price = 1;
    else if (sort === 'price-high') sortOption.price = -1;
    else sortOption.createdAt = -1;

    const pets = await Pet.find(filter)
      .sort(sortOption)
      .populate('createdBy', 'username')
      .populate('ratings.user', 'username');

    res.json({ success: true, count: pets.length, data: pets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pets', error: error.message });
  }
};

// Featured pets
const getFeaturedPets = async (req, res) => {
  try {
    const featured = await Pet.find({ available: true })
      .sort({ 'votes.up': -1, createdAt: -1 })
      .limit(6)
      .populate('ratings.user', 'username');

    res.json({ success: true, data: featured });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching featured pets', error: error.message });
  }
};

// Pets by type
const getPetsByType = async (req, res) => {
  try {
    const pets = await Pet.find({ type: req.params.type, available: true })
      .sort({ createdAt: -1 })
      .populate('ratings.user', 'username');

    res.json({ success: true, count: pets.length, data: pets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pets by type', error: error.message });
  }
};

// Pet by ID
const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('ratings.user', 'username');

    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

    res.json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching pet', error: error.message });
  }
};

// Create pet
const createPet = async (req, res) => {
  try {
    const pet = new Pet({ ...req.body, createdBy: req.user.id });
    const saved = await pet.save();
    res.status(201).json({ success: true, message: 'Pet created', data: saved });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating pet', error: error.message });
  }
};

// Update pet
const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

    res.json({ success: true, message: 'Pet updated', data: pet });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating pet', error: error.message });
  }
};

// Delete pet
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

    res.json({ success: true, message: 'Pet deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting pet', error: error.message });
  }
};

// Vote pet
const votePet = async (req, res) => {
  try {
    const { voteType } = req.body;
    const userId = req.user.id;
    const petId = req.params.id;

    const user = await User.findById(userId);
    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

    const existing = user.votedPets.find(v => v.pet.toString() === petId);

    if (existing) {
      if (existing.voteType === 'up') pet.votes.up -= 1;
      else pet.votes.down -= 1;

      user.votedPets = user.votedPets.filter(v => v.pet.toString() !== petId);
    }

    if (!existing || existing.voteType !== voteType) {
      if (voteType === 'up') pet.votes.up += 1;
      else pet.votes.down += 1;

      user.votedPets.push({ pet: petId, voteType });
    }

    await user.save();
    await pet.save();

    res.json({
      success: true,
      message: 'Vote recorded',
      data: {
        votes: pet.votes,
        userVote: voteType
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error voting', error: error.message });
  }
};

// Rate pet
const ratePet = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

    const userId = req.user.id;
    const existing = pet.ratings.findIndex(r => r.user.toString() === userId);

    if (existing !== -1) {
      pet.ratings[existing].rating = rating;
      pet.ratings[existing].comment = comment;
    } else {
      pet.ratings.push({ user: userId, rating, comment });
    }

    await pet.save();

    res.json({
      success: true,
      message: 'Rating submitted',
      data: {
        averageRating: pet.averageRating,
        totalRatings: pet.ratings.length
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error rating pet', error: error.message });
  }
};

module.exports = {
  getAllPets,
  getFeaturedPets,
  getPetsByType,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  votePet,
  ratePet
};

