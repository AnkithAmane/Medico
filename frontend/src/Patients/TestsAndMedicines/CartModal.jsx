import React, { useState, useEffect } from 'react';
// import './ManageModal.css';

const CartModal = ({ isOpen, onClose, cartItems, onRemove, onOrderSuccess }) => {
  const [step, setStep] = useState('info');
  const [isOrdered, setIsOrdered] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', mobile: '', address: '' });
  const [itemQuantities, setItemQuantities] = useState({});

  useEffect(() => {
    setItemQuantities((prev) => {
      const updated = { ...prev };
      cartItems.forEach((item) => {
        if (updated[item.id] === undefined) {
          updated[item.id] = 1;
        }
      });
      return updated;
    });
  }, [cartItems]);

  if (!isOpen) return null;

  // This handles closing the modal AFTER the success message is shown
  const handleFullClose = () => {
    setIsOrdered(false);
    setStep('info');
    setUserInfo({ name: '', mobile: '', address: '' });
    onClose();
  };

  const handleInfoChange = (field, value) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    if (!userInfo.name.trim() || !userInfo.mobile.trim() || !userInfo.address.trim()) {
      alert('Please fill in name, mobile number, and address.');
      return;
    }
    setStep('items');
  };

  const handleQuantityChange = (id, value) => {
    if (value === '') {
      setItemQuantities((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const qty = parseInt(value, 10);
    if (qty >= 0) setItemQuantities((prev) => ({ ...prev, [id]: qty }));
  };

  const computedTotal = cartItems.reduce((total, item) => {
    const qty = Number(itemQuantities[item.id]) || 0;
    return total + item.price * qty;
  }, 0);

  const handlePlaceOrder = () => {
    if (computedTotal <= 0) {
      alert('Please select a valid quantity.');
      return;
    }
    
    // Clear the parent cart items
    if (onOrderSuccess) onOrderSuccess();
    
    // Switch to success view (Notice we don't close yet!)
    setIsOrdered(true);
  };

  return (
    <div className="modal-overlay" onClick={handleFullClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4 className="fw-bold mb-0">Cart Checkout</h4>
          <button className="close-btn" onClick={handleFullClose}>&times;</button>
        </div>

        <div className="modal-body">
          {isOrdered ? (
            <div className="text-center py-4">
              <div className="mb-3" style={{ fontSize: '50px', color: '#28a745' }}>✓</div>
              <h3 className="fw-bold">Order Placed!</h3>
              <p className="text-muted">
                Thank you, <strong>{userInfo.name}</strong>.<br />
                Your order has been received successfully.
              </p>
              <button className="modal-action-btn reschedule w-100 mt-3" onClick={handleFullClose}>
                Close & Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {step === 'info' ? (
                <div className="modal-form">
                   {/* ... your input fields ... */}
                   <div className="mb-3">
                    <label className="form-label fw-semibold">Name</label>
                    <input className="form-control" value={userInfo.name} onChange={(e) => handleInfoChange('name', e.target.value)} placeholder="Name" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Mobile Number</label>
                    <input className="form-control" value={userInfo.mobile} onChange={(e) => handleInfoChange('mobile', e.target.value)} placeholder="Mobile" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Address</label>
                    <textarea className="form-control" value={userInfo.address} onChange={(e) => handleInfoChange('address', e.target.value)} rows={3} placeholder="Address" />
                  </div>
                  <button className="modal-action-btn reschedule w-100" onClick={handleContinue}>Continue to Items</button>
                </div>
              ) : (
                <>
                  {/* ... your item list ... */}
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {cartItems.map((item) => (
                        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 40px', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <div className="fw-bold">{item.name}</div>
                            <small className="text-muted">₹{item.price}</small>
                          </div>
                          <input type="number" min="1" className="form-control form-control-sm" value={itemQuantities[item.id]} onChange={(e) => handleQuantityChange(item.id, e.target.value)} />
                          <button className="btn btn-sm btn-outline-danger border-0" onClick={() => onRemove(item.id)}>✕</button>
                        </div>
                      ))}
                    </div>
                  <div className="d-flex justify-content-between align-items-center mt-3 p-2 bg-light rounded">
                    <span className="fw-bold">Total Amount:</span>
                    <span className="fw-bold text-primary" style={{ fontSize: '1.2rem' }}>₹{computedTotal}</span>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-outline-secondary flex-grow-1" style={{ height: "48px" }} onClick={() => setStep('info')}>Back</button>
                    <button className="modal-action-btn reschedule flex-grow-1" onClick={handlePlaceOrder}>Place Order</button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;