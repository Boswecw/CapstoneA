// client/src/components/PetCard.js (Updated)
import React, { useState } from 'react';
import { Card, Button, Badge, Toast } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useApiCall } from '../hooks/useApiCall';
import api from '../services/api';

const PetCard = ({ pet, onVote, showAddToCart = true }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { execute, loading: voting } = useApiCall();
  const [showToast, setShowToast] = useState(false);

  const handleVote = async (voteType) => {
    if (!user || voting) return;
    
    try {
      await execute(
        () => api.post(`/pets/${pet._id}/vote`, { voteType }),
        'Failed to vote'
      );
      onVote?.(pet._id, voteType);
    } catch (error) {
      // Error already handled by useApiCall
    }
  };

  const handleAddToCart = () => {
    addToCart(pet);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `$${price.toLocaleString()}`;
    }
    return price;
  };

  return (
    <>
      <Card className="h-100 pet-card">
        <div className="position-relative">
          <Card.Img 
            variant="top" 
            src={pet.image} 
            alt={pet.name}
            className="card-img-top"
            loading="lazy"
          />
          <Badge 
            bg={pet.available ? 'success' : 'secondary'}
            className="position-absolute top-0 end-0 m-2"
          >
            {pet.available ? 'Available' : 'Adopted'}
          </Badge>
        </div>
        
        <Card.Body className="d-flex flex-column">
          <Card.Title className="text-primary">{pet.name}</Card.Title>
          
          <Card.Text className="small flex-grow-1">
            <strong>Breed:</strong> {pet.breed}<br />
            <strong>Age:</strong> {pet.age}<br />
            {pet.size && <><strong>Size:</strong> {pet.size}<br /></>}
            {pet.gender && <><strong>Gender:</strong> {pet.gender}<br /></>}
            <div className="mt-2">{pet.description}</div>
          </Card.Text>
          
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="price fw-bold">{formatPrice(pet.price)}</span>
              {pet.averageRating > 0 && (
                <div className="rating-stars">
                  <i className="fas fa-star text-warning"></i>
                  <span className="ms-1">{pet.averageRating}</span>
                </div>
              )}
            </div>
            
            <div className="d-grid gap-2">
              <Link to={`/pet/${pet._id}`} className="btn btn-primary btn-sm">
                View Details
              </Link>
              
              {showAddToCart && pet.available && (
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={handleAddToCart}
                >
                  <i className="fas fa-cart-plus me-1"></i>
                  Add to Cart
                </Button>
              )}
              
              {user && (
                <div className="vote-buttons d-flex gap-1">
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleVote('up')}
                    disabled={voting || !pet.available}
                    className="flex-fill"
                  >
                    <i className="fas fa-thumbs-up"></i>
                    <span className="ms-1">{pet.votes?.up || 0}</span>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleVote('down')}
                    disabled={voting || !pet.available}
                    className="flex-fill"
                  >
                    <i className="fas fa-thumbs-down"></i>
                    <span className="ms-1">{pet.votes?.down || 0}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Toast notification */}
      <Toast 
        show={showToast} 
        onClose={() => setShowToast(false)}
        style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          zIndex: 9999
        }}
        bg="success"
      >
        <Toast.Body className="text-white">
          <i className="fas fa-check-circle me-2"></i>
          {pet.name} added to cart!
        </Toast.Body>
      </Toast>
    </>
  );
};

export default PetCard;