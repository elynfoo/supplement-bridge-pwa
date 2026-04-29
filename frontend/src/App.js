import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Browse from './components/Browse';
import Quiz from './components/Quiz';
import Recommendations from './components/Recommendations';
import ProductView from './components/ProductView';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderConfirmation from './components/OrderConfirmation';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function App() {
  const [screen, setScreen] = useState('browse'); // browse, quiz, recommendations, product-view, cart, checkout, order-confirmation
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      alert('Failed to load products. Check if backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    alert('Added to cart!');
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleUpdateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const handleSubmitQuiz = async (answers) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/quiz/submit`, { answers });
      setQuizAnswers(answers);
      setRecommendations(res.data.recommendations);
      setScreen('recommendations');
    } catch (err) {
      console.error('Quiz submission failed:', err);
      alert('Failed to process quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (customerInfo) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/checkout`, {
        cartItems: cart,
        customerInfo
      });
      setOrder(res.data);
      setCart([]);
      setScreen('order-confirmation');
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    setScreen('browse');
    setSelectedProduct(null);
  };

  // Render screens
  if (loading && screen === 'browse') {
    return <div className="container"><h2>Loading products...</h2></div>;
  }

  return (
    <div className="app">
      <Header screen={screen} cartCount={cart.length} goHome={goHome} onCartClick={() => setScreen('cart')} />

      <main className="main-content">
        {screen === 'browse' && (
          <Browse
            products={products}
            onSelectProduct={(p) => { setSelectedProduct(p); setScreen('product-view'); }}
            onStartQuiz={() => setScreen('quiz')}
          />
        )}

        {screen === 'quiz' && (
          <Quiz onSubmit={handleSubmitQuiz} loading={loading} />
        )}

        {screen === 'recommendations' && (
          <Recommendations
            recommendations={recommendations}
            onSelectProduct={(p) => { setSelectedProduct(p); setScreen('product-view'); }}
            onContinueShopping={() => setScreen('browse')}
          />
        )}

        {screen === 'product-view' && selectedProduct && (
          <ProductView
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onBack={() => setScreen('browse')}
          />
        )}

        {screen === 'cart' && (
          <Cart
            cartItems={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemove={handleRemoveFromCart}
            onCheckout={() => setScreen('checkout')}
            onContinueShopping={() => setScreen('browse')}
          />
        )}

        {screen === 'checkout' && (
          <Checkout
            cartItems={cart}
            onSubmit={handleCheckout}
            loading={loading}
            onCancel={() => setScreen('cart')}
          />
        )}

        {screen === 'order-confirmation' && order && (
          <OrderConfirmation order={order} onDone={goHome} />
        )}
      </main>
    </div>
  );
}

function Header({ screen, cartCount, goHome, onCartClick }) {
  const screenNames = {
    browse: 'HealthSupp',
    quiz: 'Health Quiz',
    recommendations: 'Recommendations',
    'product-view': 'Product',
    cart: 'Cart',
    checkout: 'Checkout',
    'order-confirmation': 'Order Confirmed'
  };

  return (
    <header className="header">
      <button className="header-home" onClick={goHome}>← HealthSupp</button>
      <h1>{screenNames[screen] || 'HealthSupp'}</h1>
      <button className="header-cart" onClick={onCartClick}>🛒 {cartCount}</button>
    </header>
  );
}
