import React, { useState } from 'react';
import  availableTests  from '../../Assets/Data/PatientData/TestData1';
import PMedicines from './Medicines';
import PCartModal from './CartModal';
import './MedicationTests.css';

const PMedicationTests = () => {
  const [itemsToShow, setItemsToShow] = useState(8); // Show 2 rows of 4 items initially
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const handleBookTest = (testName) => {
    alert(`Booking: ${testName}`);
  };

  const handleAddToCart = (medicine) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === medicine.id);
      if (existing) {
        return prevItems.map((item) =>
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...medicine, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]); // This empties the array
  };

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const displayedTests = availableTests.slice(0, itemsToShow);
  const hasMore = itemsToShow < availableTests.length;

  const handleShowMore = () => {
    setItemsToShow(prev => prev + 8); // Add 2 more rows
  };

  const handleShowLess = () => {
    setItemsToShow(8); // Reset to initial 2 rows
  };

  return (

    

    <div className="med-test-page">
      <section className="medicines-section">
        <PMedicines
          onAddToCart={handleAddToCart}
          onOpenCart={openCart}
          cartCount={totalCount}
        />
        <div className="buy-items-footer">
          <button className="buy-items-btn" onClick={openCart} disabled={totalCount === 0}>
            Buy Items ({totalCount})
          </button>
        </div>
        <PCartModal isOpen={isCartOpen} onClose={closeCart} cartItems={cartItems} onRemove={handleRemoveFromCart} onOrderSuccess={handleClearCart} />
      </section>
      <header className="page-header">
        <h1>Medical Tests & Scans</h1>
        <p>Book diagnostic tests and order medicines for your healthcare needs.</p>
      </header>

      {/* Tests Section */}
      <section className="tests-section">
        <div className="test-grid-container">
        {displayedTests.map((test) => (
          <div key={test.id} className="test-item-card">
            <div className="card-tag">{test.category}</div>
            
            <div className="card-main-content">
              <h3 className="test-name-text">{test.name}</h3>
              <p className="test-details-text">{test.details}</p>
              
              <div className="prep-warning">
                <span>⚠️</span> {test.preparation}
              </div>
            </div>

            <div className="card-action-area">
              <div className="price-info">
                <span className="amount">{test.price}</span>
              </div>
              <button 
                className="book-btn-primary"
                onClick={() => handleBookTest(test.name)}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="show-more-container">
          <button className="show-more-btn" onClick={handleShowMore}>
            Show More
          </button>
        </div>
      )}

      {itemsToShow > 8 && (
        <div className="show-less-container">
          <button className="show-less-btn" onClick={handleShowLess}>
            Show Less
          </button>
        </div>
      )}
      </section>

      {/* Medicines Section */}
      
    </div>
  );
};

export default MedicationTests;