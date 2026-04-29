import React from 'react';
import './OrderConfirmation.css';

export default function OrderConfirmation({ order, onDone }) {
  return (
    <div className="order-confirmation-container">
      <div className="confirmation-card">
        <div className="success-icon">✓</div>
        <h1>Order Confirmed!</h1>

        <div className="order-details">
          <div className="detail-row">
            <span>Order Number:</span>
            <span className="detail-value">{order.orderId}</span>
          </div>
          <div className="detail-row">
            <span>Total Amount:</span>
            <span className="detail-value">${order.total}</span>
          </div>
          <div className="detail-row">
            <span>Estimated Delivery:</span>
            <span className="detail-value">{order.estimatedDelivery}</span>
          </div>
        </div>

        <div className="confirmation-message">
          <p>{order.message}</p>
          <p className="sub-message">
            You will receive a confirmation email with tracking information shortly.
          </p>
        </div>

        <div className="confirmation-actions">
          <button className="btn-track">📦 Track Order</button>
          <button className="btn-home" onClick={onDone}>
            ← Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
