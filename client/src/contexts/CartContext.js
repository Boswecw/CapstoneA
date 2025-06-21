// client/src/contexts/CartContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Action types
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { item, quantity = 1 } = action.payload;
      const existingItem = state.items.find(cartItem => cartItem.id === item._id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(cartItem =>
            cartItem.id === item._id
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, {
          id: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          type: item.type,
          breed: item.breed,
          quantity
        }]
      };
    }
    
    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.itemId)
      };
    
    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== itemId)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      };
    }
    
    case CART_ACTIONS.CLEAR_CART:
      return { ...state, items: [] };
    
    case CART_ACTIONS.LOAD_CART:
      return { ...state, items: action.payload.items };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
  isOpen: false
};

// Cart Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('furbabies_cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: { items: cartData.items || [] } });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('furbabies_cart', JSON.stringify(state));
  }, [state]);

  // Cart actions
  const addToCart = (item, quantity = 1) => {
    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: { item, quantity } });
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { itemId } });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // Computed values
  const cartCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook to use cart
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

