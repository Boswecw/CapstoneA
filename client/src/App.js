// client/src/App.js
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Import CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Dogs = lazy(() => import('./pages/Dogs'));
const Cats = lazy(() => import('./pages/Cats'));
const Aquatics = lazy(() => import('./pages/Aquatics'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Browse = lazy(() => import('./pages/Browse'));
const PetDetail = lazy(() => import('./pages/PetDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));


function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Navbar />
              <main style={{ minHeight: 'calc(100vh - 140px)' }}>
                <Suspense 
                  fallback={
                    <div style={{ marginTop: '80px' }}>
                      <LoadingSpinner 
                        text="Loading page..." 
                        centered={true}
                        className="py-5"
                      />
                    </div>
                  }
                >
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/dogs" element={<Dogs />} />
                    <Route path="/cats" element={<Cats />} />
                    <Route path="/aquatics" element={<Aquatics />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/browse" element={<Browse />} />
                    <Route path="/pet/:id" element={<PetDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Shopping Cart Routes */}
                    <Route path="/cart" element={<Cart />} />
                    
                    {/* Protected Routes */}
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/checkout" 
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/orders" 
                      element={
                        <ProtectedRoute>
                          <div className="container py-5" style={{ marginTop: '80px' }}>
                            <h2>My Orders</h2>
                            <p>Order history will be implemented here.</p>
                          </div>
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/favorites" 
                      element={
                        <ProtectedRoute>
                          <div className="container py-5" style={{ marginTop: '80px' }}>
                            <h2>My Favorites</h2>
                            <p>Favorite pets will be shown here.</p>
                          </div>
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute>
                          <div className="container py-5" style={{ marginTop: '80px' }}>
                            <h2>Settings</h2>
                            <p>User settings will be implemented here.</p>
                          </div>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Admin Routes */}
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/admin/orders" 
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <div className="container py-5" style={{ marginTop: '80px' }}>
                            <h2>Manage Orders</h2>
                            <p>Order management will be implemented here.</p>
                          </div>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* 404 Not Found */}
                    <Route 
                      path="*" 
                      element={
                        <div className="container text-center py-5" style={{ marginTop: '80px' }}>
                          <i className="fas fa-exclamation-triangle fa-4x text-warning mb-4"></i>
                          <h2>404 - Page Not Found</h2>
                          <p className="text-muted mb-4">
                            The page you're looking for doesn't exist.
                          </p>
                          <a href="/" className="btn btn-primary">
                            <i className="fas fa-home me-2"></i>
                            Go Home
                          </a>
                        </div>
                      } 
                    />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;