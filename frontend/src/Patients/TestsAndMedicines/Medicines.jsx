import React, { useState } from 'react';
// 1. Check your import! If MedicineData uses "export const", use { availableMedicines }
import data from '../../Assets/Data/PatientData/MedicineData'; 
import './Medicines.css';

const Medicines = ({ onAddToCart, onOpenCart, cartCount }) => {
  const [itemsToShow, setItemsToShow] = useState(8);

  // 2. Ensure we are working with a pure array immediately
  // This handles cases where data might be an object or undefined
  const medsArray = Array.isArray(data) ? data : (data.availableMedicines || []);

  const handleOrderMedicine = (medicineName) => {
    alert(`Ordering: ${medicineName}`);
  };

  // 3. Use the safe array for slice and length
  const displayedMedicines = medsArray.slice(0, itemsToShow);
  const hasMore = itemsToShow < medsArray.length;

  return (
    <div className="medicines-content">
        <div className="section-header medicine-header">
          <div>
            <h1 className="gradient-header">Medicines</h1>
            <p>Select medicines to view details and place an order.</p>
          </div>
          <button className="cart-header-btn" onClick={onOpenCart}>
            🛒 Cart ({cartCount || 0})
          </button>
        </div>

      <div className="medicine-grid-container">
        {displayedMedicines.length > 0 ? (
          displayedMedicines.map((medicine) => (
            <div key={medicine.id} className="medicine-item-card">
              <div className="card-tag">{medicine.category}</div>

              <div className="card-main-content">
                <h3 className="medicine-name-text">{medicine.name}</h3>
                {/* 4. Use optional chaining if some fields might be missing */}
                <p className="medicine-details-text">{medicine.details || "No details available."}</p>

                <div className="dosage-info">
                  <span>💊</span> {medicine.dosage}
                </div>

                <div className="side-effects">
                  <span>⚠️</span> {medicine.sideEffects}
                </div>

                {medicine.prescription_required && (
                  <div className="prescription-required">
                    <span>📋</span> Prescription Required
                  </div>
                )}
              </div>

              <div className="card-action-area">
                <div className="price-info">
                  <span className="label">Price</span>
                  <span className="amount">₹{medicine.price}</span>
                </div>
                
                <div className="card-actions-row">
                  <button
                    className="order-btn-primary"
                    onClick={() => onAddToCart && onAddToCart(medicine)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No medicines found.</p>
        )}
      </div>

      <div className="show-more-container">
        {hasMore && (
          <button className="show-more-btn" onClick={() => setItemsToShow(prev => prev + 8)}>
            Show More
          </button>
        )}
        {itemsToShow > 8 && (
          <button className="show-less-btn" onClick={() => setItemsToShow(8)}>
            Show Less
          </button>
        )}
      </div>
    </div>
  );
};

export default Medicines;