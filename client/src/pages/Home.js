import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Carousel,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import PetCard from "../components/PetCard";
import ProductCard from "../components/ProductCard";
import { useCart } from "../contexts/CartContext";
import api from "../services/api";

const Home = () => {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartMessage, setCartMessage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeaturedData = async () => {
      try {
        setLoading(true);
        const [petsRes, productsRes] = await Promise.all([
          api.get("/pets/featured"),
          api.get("/products/featured?limit=3"),
        ]);
        setFeaturedPets(petsRes.data.data || []);
        setFeaturedProducts(productsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching featured items:", err);
        setError("Failed to load featured items.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedData();
  }, []);

  const handleAddToCart = (product) => {
    // Prevent double clicks
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    addToCart(product);
    setCartMessage(`${product.name} added to cart!`);
    
    // Reset protection after delay
    setTimeout(() => {
      setIsAddingToCart(false);
      setCartMessage("");
    }, 3000);
  };

  const testimonials = [
    {
      name: "Jessica R.",
      text: "FurBabies has everything I need for my pup. The staff is friendly and the quality is top-notch!",
      icon: "fa-dog",
      rating: 5.0,
    },
    {
      name: "Marcus D.",
      text: "My cat LOVES the toys I got here. Fast delivery and great prices!",
      icon: "fa-cat",
      rating: 4.8,
    },
    {
      name: "Linda M.",
      text: "Excellent customer service and a wide variety of pet products. Highly recommended!",
      icon: "fa-fish",
      rating: 5.0,
    },
  ];

  return (
    <>
      {/* Hero Banner */}
      <section className="furbabies-banner">
        <Container>
          <Row className="justify-content-center align-items-center">
            <Col xs={12} md={10}>
              <h1 className="hero-title">
                <i className="fas fa-paw me-2"></i>
                <img
                  src="/images/FurBabiesIcon.png"
                  alt="FurBabies icon"
                  className="hero-icon ms-2"
                />
              </h1>
              <p className="hero-subtitle">
                <i className="fas fa-heart me-2"></i>Your One Stop Pet Super Store
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/browse" className="btn btn-lg btn-light px-4 py-2">
                  <i className="fas fa-paw me-2"></i>Browse Pets
                </Link>
                <Link to="/products" className="btn btn-lg btn-outline-light px-4 py-2">
                  <i className="fas fa-shopping-bag me-2"></i>Shop Products
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Cart Message */}
      {cartMessage && (
        <Container className="mt-3">
          <Alert variant="success" className="text-center">
            <i className="fas fa-check-circle me-2"></i>
            {cartMessage}
          </Alert>
        </Container>
      )}

      {/* Featured Products */}
      <section id="products" className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="mb-3">
              <i className="fas fa-star me-2"></i>Featured Products
            </h2>
            <p className="text-muted">Premium products for your beloved pets</p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading products...</span>
              </div>
            </div>
          ) : error ? (
            <Alert variant="warning" className="text-center">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          ) : featuredProducts.length > 0 ? (
            <>
              <Row className="g-4">
                {featuredProducts.map((product) => (
                  <Col key={product._id} md={4}>
                    <ProductCard 
                      product={product} 
                      onAddToCart={handleAddToCart}
                      disabled={isAddingToCart}
                    />
                  </Col>
                ))}
              </Row>
              <div className="text-center mt-4">
                <Link to="/products" className="btn btn-outline-primary">
                  <i className="fas fa-shopping-bag me-2"></i>
                  View All Products
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-box fa-3x text-muted mb-3"></i>
              <h4>No Featured Products</h4>
              <p className="text-muted">
                Featured products will appear here soon!
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* Featured Pets */}
      {featuredPets.length > 0 && (
        <section className="py-5 bg-light">
          <Container>
            <div className="text-center mb-5">
              <h2 className="mb-3">
                <i className="fas fa-heart me-2"></i>Featured Pets
              </h2>
              <p className="text-muted">Find your perfect companion</p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading pets...</span>
                </div>
              </div>
            ) : (
              <>
                <Row className="g-4">
                  {featuredPets.slice(0, 3).map((pet) => (
                    <Col key={pet._id} md={4}>
                      <PetCard 
                        pet={pet} 
                        size="large"
                        showAddToCart={true}
                      />
                    </Col>
                  ))}
                </Row>
                <div className="text-center mt-4">
                  <Link to="/browse" className="btn btn-primary">
                    <i className="fas fa-paw me-2"></i>
                    View All Pets
                  </Link>
                </div>
              </>
            )}
          </Container>
        </section>
      )}

      {/* Recent Pets Section - Using medium size */}
      {featuredPets.length > 3 && (
        <section className="py-5">
          <Container>
            <div className="text-center mb-5">
              <h2 className="mb-3">
                <i className="fas fa-paw me-2"></i>More Amazing Pets
              </h2>
              <p className="text-muted">Even more furry friends looking for homes</p>
            </div>
            
            <Row className="g-4">
              {featuredPets.slice(3, 9).map((pet) => (
                <Col key={pet._id} sm={6} md={4} lg={3}>
                  <PetCard 
                    pet={pet} 
                    size="medium"
                    showAddToCart={true}
                  />
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* Testimonials */}
      <section id="reviews" className="py-5">
        <Container>
          <h2 className="text-center mb-5">
            <i className="fas fa-comments me-2"></i>What Our Customers Say
          </h2>

          <Carousel indicators={false} className="testimonial-carousel">
            {testimonials.map((testimonial, index) => (
              <Carousel.Item key={index}>
                <div className="d-flex justify-content-center">
                  <Card className="p-4 shadow" style={{ maxWidth: "700px" }}>
                    <Card.Body className="text-center">
                      <i className="fas fa-quote-left fa-2x text-muted mb-3"></i>
                      <p className="lead">{testimonial.text}</p>
                      <div className="mt-4">
                        <i
                          className={`fas ${testimonial.icon} fa-2x text-warning mb-2`}
                        ></i>
                        <h5 className="mb-0">{testimonial.name}</h5>
                        <small className="text-muted">
                          <i className="fas fa-star text-warning"></i>{" "}
                          {testimonial.rating} | Verified Buyer
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </Container>
      </section>
    </>
  );
};

export default Home;