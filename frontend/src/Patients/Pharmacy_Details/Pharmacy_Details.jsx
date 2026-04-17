import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Pill, FlaskConical, Search, 
  Trash2, Plus, Minus, CreditCard, ShieldCheck, Info 
} from 'lucide-react';
import './Pharmacy_Details.css';

// Data Imports
import availableTests from '../../Assets/Data/TestData1';
import medicineData from '../../Assets/Data/MedicineData';

export default function Pharmacy_Details() {
  const [testLimit, setTestLimit] = useState(4);
  const [medLimit, setMedLimit] = useState(4);
  const [cartItems, setCartItems] = useState([]);

  // Data normalization
  const medsArray = Array.isArray(medicineData) ? medicineData : (medicineData.availableMedicines || []);

  // Cart Handlers
  const handleAddToCart = (item, category) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.type === category);
      if (existing) {
        return prev.map(i => (i.id === item.id && i.type === category) 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
        );
      }
      return [...prev, { ...item, quantity: 1, type: category }];
    });
  };

  const updateQuantity = (id, type, delta) => {
    setCartItems(prev => prev.map(item => 
      (item.id === id && item.type === type) 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
        : item
    ));
  };

  const removeItem = (id, type) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.type === type)));
  };

  // Calculations
  const totalAmount = useMemo(() => 
    cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0), 
  [cartItems]);

  return (
    <div className="pat_pharma_container">
      
      {/* Marketplace Main Feed */}
      <div className="pat_pharma_main">
        
        {/* Header Area */}
        <div className="pat_pharma_header">
          <h1>Pharmacy <span>& Labs</span></h1>
          <div className="pat_pharma_search">
            <Search size={18} />
            <input type="text" placeholder="Search medicines, health packages, or diagnostic tests..." />
          </div>
        </div>

        {/* Medicines Catalog */}
        <section className="pat_pharma_section">
          <div className="pat_pharma_sec_head">
            <div className="flex_align"><Pill size={20} color="#007acc"/> <h2>Verified Medicines</h2></div>
            <button className="pat_pharma_text_btn" onClick={() => setMedLimit(medLimit === 4 ? 12 : 4)}>
              {medLimit === 4 ? 'View All' : 'Show Less'}
            </button>
          </div>
          <div className="pat_pharma_grid">
            {medsArray.slice(0, medLimit).map(med => (
              <div className="pat_pharma_card" key={med.id}>
                <div className="pat_pharma_tag">{med.category}</div>
                <div className="pat_pharma_body">
                  <h3>{med.name}</h3>
                  <p>{med.details}</p>
                  <div className="pat_pharma_meta"><span>💊 {med.dosage}</span></div>
                </div>
                <div className="pat_pharma_footer">
                  <strong>₹{med.price}</strong>
                  <button onClick={() => handleAddToCart(med, 'Medicine')}>Add <Plus size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Diagnostic Labs Catalog */}
        <section className="pat_pharma_section">
          <div className="pat_pharma_sec_head">
            <div className="flex_align"><FlaskConical size={20} color="#007acc"/> <h2>Diagnostic Tests</h2></div>
            <button className="pat_pharma_text_btn" onClick={() => setTestLimit(testLimit === 4 ? 12 : 4)}>
              {testLimit === 4 ? 'View All' : 'Show Less'}
            </button>
          </div>
          <div className="pat_pharma_grid">
            {availableTests.slice(0, testLimit).map(test => (
              <div className="pat_pharma_card test_card" key={test.id}>
                <div className="pat_pharma_tag">{test.category}</div>
                <div className="pat_pharma_body">
                  <h3>{test.name}</h3>
                  <div className="pat_pharma_warning"><Info size={12}/> {test.preparation}</div>
                </div>
                <div className="pat_pharma_footer">
                  <strong>₹{test.price}</strong>
                  <button className="book_btn" onClick={() => handleAddToCart(test, 'Test')}>Book</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Checkout Sidebar */}
      <aside className="pat_pharma_sidebar">
        <div className="pat_pharma_cart_card">
          <div className="cart_head">
            <ShoppingBag size={20} />
            <h3>Your Cart <span>({cartItems.length})</span></h3>
          </div>
          
          {/* Cart Item List */}
          <div className="cart_list">
            {cartItems.length > 0 ? cartItems.map(item => (
              <div className="cart_item" key={`${item.type}-${item.id}`}>
                <div className="item_info">
                  <strong>{item.name}</strong>
                  <span>₹{item.price} × {item.quantity}</span>
                </div>
                <div className="item_actions">
                  <div className="qty_stepper">
                    <button onClick={() => updateQuantity(item.id, item.type, -1)}><Minus size={12}/></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.type, 1)}><Plus size={12}/></button>
                  </div>
                  <button className="remove_btn" onClick={() => removeItem(item.id, item.type)}><Trash2 size={14}/></button>
                </div>
              </div>
            )) : (
              <div className="cart_empty">Your cart is empty</div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="cart_summary">
            <div className="summary_row"><span>Subtotal</span> <span>₹{totalAmount}</span></div>
            <div className="summary_row"><span>Service Fee</span> <span>₹50</span></div>
            <div className="summary_row total"><span>Total</span> <span>₹{totalAmount > 0 ? totalAmount + 50 : 0}</span></div>
            <button className="checkout_btn" disabled={cartItems.length === 0}>
              <CreditCard size={18} /> Checkout Now
            </button>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="pat_pharma_card_mini pat_pharma_secure">
          <ShieldCheck size={24} color="#10b981" />
          <p>Verified by <strong>Medico+ Pharmacy</strong>. Sourced from certified labs.</p>
        </div>
      </aside>

    </div>
  );
}