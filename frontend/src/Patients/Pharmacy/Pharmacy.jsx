import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Pill, FlaskConical, Search, 
  ChevronDown, ChevronUp, Trash2, Plus, 
  Minus, CreditCard, ShieldCheck, Info 
} from 'lucide-react';
import './Pharmacy.css';

// Data Imports
import availableTests from '../../Assets/Data/PatientData/TestData1';
import medicineData from '../../Assets/Data/PatientData/MedicineData';

export default function Pharmacy() {
  const [testLimit, setTestLimit] = useState(4);
  const [medLimit, setMedLimit] = useState(4);
  const [cartItems, setCartItems] = useState([]);

  // Logic: Ensure Medicine Data is an array
  const medsArray = Array.isArray(medicineData) ? medicineData : (medicineData.availableMedicines || []);

  const handleAddToCart = (item, category) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.category === category);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, type: category }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id) => setCartItems(prev => prev.filter(item => item.id !== id));

  const totalAmount = useMemo(() => 
    cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cartItems]
  );

  return (
    <div className="pat_pharma_container">
      
      {/* LEFT COLUMN: MARKETPLACE (3 Ratio) */}
      <div className="pat_pharma_main">
        
        <div className="pat_pharma_header">
          <h1>Pharmacy <span>& Labs</span></h1>
          <div className="pat_pharma_search">
            <Search size={18} />
            <input type="text" placeholder="Search medicines, health packages, or diagnostic tests..." />
          </div>
        </div>

        {/* SECTION 1: MEDICINES */}
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

        {/* SECTION 2: MEDICAL TESTS */}
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

      {/* RIGHT SIDEBAR: CART & CHECKOUT (1 Ratio) */}
      <aside className="pat_pharma_sidebar">
        <div className="pat_pharma_cart_card">
          <div className="cart_head">
            <ShoppingBag size={20} />
            <h3>Your Cart <span>({cartItems.length})</span></h3>
          </div>
          
          <div className="cart_list">
            {cartItems.length > 0 ? cartItems.map(item => (
              <div className="cart_item" key={item.id}>
                <div className="item_info">
                  <strong>{item.name}</strong>
                  <span>₹{item.price} × {item.quantity}</span>
                </div>
                <div className="item_actions">
                  <div className="qty_stepper">
                    <button onClick={() => updateQuantity(item.id, -1)}><Minus size={12}/></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}><Plus size={12}/></button>
                  </div>
                  <button className="remove_btn" onClick={() => removeItem(item.id)}><Trash2 size={14}/></button>
                </div>
              </div>
            )) : (
              <div className="cart_empty">Your cart is empty</div>
            )}
          </div>

          <div className="cart_summary">
            <div className="summary_row"><span>Subtotal</span> <span>₹{totalAmount}</span></div>
            <div className="summary_row"><span>Service Fee</span> <span>₹50</span></div>
            <div className="summary_row total"><span>Total</span> <span>₹{totalAmount > 0 ? totalAmount + 50 : 0}</span></div>
            <button className="checkout_btn" disabled={cartItems.length === 0}>
              <CreditCard size={18} /> Checkout Now
            </button>
          </div>
        </div>

        <div className="pat_pharma_card_mini pat_pharma_secure">
          <ShieldCheck size={24} color="#10b981" />
          <p>All medicines are verified by <strong>Medico+ Pharmacy</strong> and sourced from certified labs.</p>
        </div>
      </aside>

    </div>
  );
}