import React from 'react';
import './Cart.css';

export default function Cart({ cartItems, onUpdateQuantity, onRemove, onCheckout, onContinueShopping }) {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>

      {cartItems.length > 0 ? (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                </div>
                <div className="item-quantity">
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <p className="item-total">${(item.price * item.quantity).toFixed(2)}</p>
                <button className="remove-button" onClick={() => onRemove(item.id)}>✕</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>FREE</span>
            </div>
            <div className="summary-row total-row">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="cart-actions">
            <button className="btn-continue" onClick={onContinueShopping}>
              ← Continue Shopping
            </button>
            <button className="btn-checkout" onClick={onCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      ) : (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={onContinueShopping}>Start Shopping</button>
        </div>
      )}
    </div>
  );
}
