// client/src/components/Navbar.js
import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home after logout
  };

  // Check if user is admin
  const isAdmin = user && user.role === 'admin';

  return (
    <BootstrapNavbar expand="lg" className="custom-navbar" fixed="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          <i className="fas fa-paw me-2"></i>FurBabies
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">
              <i className="fas fa-home me-1"></i>Home
            </Nav.Link>
            <Nav.Link as={Link} to="/dogs">
              <i className="fas fa-dog me-1"></i>Dogs
            </Nav.Link>
            <Nav.Link as={Link} to="/cats">
              <i className="fas fa-cat me-1"></i>Cats
            </Nav.Link>
            <Nav.Link as={Link} to="/aquatics">
              <i className="fas fa-fish me-1"></i>Aquatics
            </Nav.Link>
            <Nav.Link as={Link} to="/about">
              <i className="fas fa-info-circle me-1"></i>About
            </Nav.Link>
            <Nav.Link as={Link} to="/contact">
              <i className="fas fa-envelope me-1"></i>Contact
            </Nav.Link>

            {/* Admin Dashboard Link - Only show for admin users */}
            {isAdmin && (
              <Nav.Link as={Link} to="/admin">
                <i className="fas fa-cog me-1"></i>Admin
              </Nav.Link>
            )}
            
            {user ? (
              <NavDropdown 
                title={
                  <span>
                    <i className="fas fa-user me-1"></i>
                    {user.username}
                    {isAdmin && <small className="badge bg-warning text-dark ms-1">Admin</small>}
                  </span>
                } 
                id="user-dropdown"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  <i className="fas fa-user me-1"></i>Profile
                </NavDropdown.Item>
                
                {/* Admin Dashboard in dropdown as well */}
                {isAdmin && (
                  <>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/admin">
                      <i className="fas fa-cog me-1"></i>Admin Dashboard
                    </NavDropdown.Item>
                  </>
                )}
                
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-1"></i>Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <i className="fas fa-sign-in-alt me-1"></i>Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <i className="fas fa-user-plus me-1"></i>Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;