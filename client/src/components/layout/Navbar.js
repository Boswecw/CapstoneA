// client/src/components/Navbar.js
import React, { useState, useEffect, useRef } from "react";
import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
  NavDropdown,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import CartIcon from "../Cart/CartIcon";
import CartDropdown from "../Cart/CartDropdown";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Cart dropdown state
  const [showCart, setShowCart] = useState(false);
  const cartRef = useRef(null);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
    setShowCart(false);
  };

  // Close cart dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setShowCart(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close cart dropdown on route change
  useEffect(() => {
    setShowCart(false);
  }, [location.pathname]);

  // Check if user is admin
  const isAdmin = user && user.role === "admin";

  // Handle cart toggle
  const handleCartToggle = () => {
    setShowCart(!showCart);
  };

  return (
    <BootstrapNavbar expand="lg" className="custom-navbar" fixed="top">
      <Container>
        {/* Brand/Logo */}
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold">
          <i className="fas fa-paw me-2"></i>
          FurBabies
        </BootstrapNavbar.Brand>

        {/* Mobile toggle button */}
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          {/* Main Navigation Links */}
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={location.pathname === "/" ? "active" : ""}
            >
              <i className="fas fa-home me-1"></i>Home
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/dogs"
              className={location.pathname === "/dogs" ? "active" : ""}
            >
              <i className="fas fa-dog me-1"></i>Dogs
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/cats"
              className={location.pathname === "/cats" ? "active" : ""}
            >
              <i className="fas fa-cat me-1"></i>Cats
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/aquatics"
              className={location.pathname === "/aquatics" ? "active" : ""}
            >
              <i className="fas fa-fish me-1"></i>Aquatics
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/browse"
              className={location.pathname === "/browse" ? "active" : ""}
            >
              <i className="fas fa-search me-1"></i>Browse All
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/about"
              className={location.pathname === "/about" ? "active" : ""}
            >
              <i className="fas fa-info-circle me-1"></i>About
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/contact"
              className={location.pathname === "/contact" ? "active" : ""}
            >
              <i className="fas fa-envelope me-1"></i>Contact
            </Nav.Link>
          </Nav>

          {/* Right side navigation */}
          <Nav className="ms-auto align-items-center">
            {/* Shopping Cart - CartIcon handles cartCount internally */}
            <div className="position-relative me-3" ref={cartRef}>
              <CartIcon onClick={handleCartToggle} />
              <CartDropdown
                isOpen={showCart}
                onClose={() => setShowCart(false)}
              />
            </div>

            {/* Admin Dashboard Link - Only show for admin users */}
            {isAdmin && (
              <Nav.Link
                as={Link}
                to="/admin"
                className={`me-2 ${location.pathname === "/admin" ? "active" : ""}`}
                title="Admin Dashboard"
              >
                <i className="fas fa-cog me-1"></i>
                <span className="d-none d-lg-inline">Admin</span>
              </Nav.Link>
            )}

            {/* User Authentication Section */}
            {user ? (
              <NavDropdown
                title={
                  <span className="d-flex align-items-center">
                    <i className="fas fa-user me-1"></i>
                    <span className="d-none d-md-inline me-1">
                      {user.username}
                    </span>
                    {isAdmin && (
                      <Badge
                        bg="warning"
                        text="dark"
                        className="ms-1 d-none d-lg-inline"
                      >
                        Admin
                      </Badge>
                    )}
                  </span>
                }
                id="user-dropdown"
                align="end"
                className="user-dropdown"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  <i className="fas fa-user me-2"></i>My Profile
                </NavDropdown.Item>

                <NavDropdown.Item as={Link} to="/orders">
                  <i className="fas fa-shopping-bag me-2"></i>My Orders
                </NavDropdown.Item>

                <NavDropdown.Item as={Link} to="/favorites">
                  <i className="fas fa-heart me-2"></i>Favorites
                </NavDropdown.Item>

                <NavDropdown.Divider />

                {isAdmin && (
                  <>
                    <NavDropdown.Item as={Link} to="/admin">
                      <i className="fas fa-cog me-2"></i>Admin Dashboard
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/orders">
                      <i className="fas fa-list me-2"></i>Manage Orders
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                  </>
                )}

                <NavDropdown.Item as={Link} to="/settings">
                  <i className="fas fa-cog me-2"></i>Settings
                </NavDropdown.Item>

                <NavDropdown.Divider />

                <NavDropdown.Item
                  onClick={handleLogout}
                  className="text-danger"
                >
                  <i className="fas fa-sign-out-alt me-2"></i>Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className="d-flex align-items-center">
                <Nav.Link
                  as={Link}
                  to="/login"
                  className={`me-2 ${location.pathname === "/login" ? "active" : ""}`}
                >
                  <i className="fas fa-sign-in-alt me-1"></i>
                  <span className="d-none d-md-inline">Login</span>
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  to="/register"
                  className={`btn btn-outline-light btn-sm ${location.pathname === "/register" ? "active" : ""}`}
                  style={{
                    borderRadius: "20px",
                    padding: "6px 16px",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <i className="fas fa-user-plus me-1"></i>
                  <span className="d-none d-md-inline">Sign Up</span>
                </Nav.Link>
              </div>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
