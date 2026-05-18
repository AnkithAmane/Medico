import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  ShoppingBag,
  Pill,
  FlaskConical,
  Search,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Loader2,
  Info,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Calendar,
  FileText,
  Download,
  X,
  Eye,
  ChevronRight,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Pharmacy_Details.css";

export default function Pharmacy_Details() {
  // --- 1. STATE MANAGEMENT ---
  const [medicines, setMedicines] = useState([]);
  const [tests, setTests] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);

  const [historyFilter, setHistoryFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [medLimit, setMedLimit] = useState(4);
  const [testLimit, setTestLimit] = useState(4);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("userData")) || {};

  // --- 2. CART PERSISTENCE (LIFECYCLE) ---
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("pharma_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("pharma_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // --- 3. DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [medRes, testRes, historyRes] = await Promise.all([
        axios.get("http://localhost:5000/api/medicines/all", { headers }),
        axios.get("http://localhost:5000/api/tests/all", { headers }),
        axios
          .get(`http://localhost:5000/api/orders/patient/${user._id}`, {
            headers,
          })
          .catch(() => ({ data: [] })),
      ]);

      setMedicines(medRes.data);
      setTests(testRes.data);
      setOrderHistory(historyRes.data);
    } catch (err) {
      console.error("Clinical System Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 4. FILTER ENGINES ---
  const availableMonths = useMemo(() => {
    const months = orderHistory.map((order) => {
      const date = new Date(order.createdAt);
      return date.toLocaleString("default", { month: "long", year: "numeric" });
    });
    return ["All", ...new Set(months)];
  }, [orderHistory]);

  const filteredHistory = useMemo(() => {
    return orderHistory.filter((order) => {
      const statusMatch =
        historyFilter === "All" || order.status === historyFilter;
      const orderMonth = new Date(order.createdAt).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      const monthMatch = monthFilter === "All" || orderMonth === monthFilter;
      return statusMatch && monthMatch;
    });
  }, [orderHistory, historyFilter, monthFilter]);

  const totalAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  // --- 5. PDF & VAULT LOGIC ---
  const handleDownloadInvoice = (order) => {
    const doc = new jsPDF();
    const dateStr = new Date(order.createdAt).toLocaleDateString();

    // PDF UI Construction
    doc.setFontSize(22);
    doc.text("MEDICO CLINICAL RECEIPT", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Transaction ID: #${order.orderID}`, 14, 30);
    doc.text(`Billing Date: ${dateStr}`, 14, 35);
    doc.text(`Patient: ${user.name}`, 14, 40);

    const tableRows = order.items.map((item) => [
      item.name,
      item.type,
      item.quantity,
      `INR ${item.price}`,
      `INR ${item.price * item.quantity}`,
    ]);

    autoTable(doc, {
      startY: 50,
      head: [
        ["Item Description", "Category", "Quantity", "Unit Rate", "Amount"],
      ],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: INR ${order.totalAmount - 50}.00`, 140, finalY);
    doc.text(`Logistics: INR 50.00`, 140, finalY + 5);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`GRAND TOTAL: INR ${order.totalAmount}.00`, 140, finalY + 12);

    // device download
    const fileName = `Invoice_${order.orderID}.pdf`;
    doc.save(fileName);

    // Vault Synchronization
    const currentVault = JSON.parse(
      localStorage.getItem("patient_vault") || "[]",
    );
    const vaultEntry = {
      id: order._id,
      name: `Pharma Receipt #${order.orderID}`,
      date: new Date().toISOString(),
      category: "Billing",
      fileType: "PDF",
      orderID: order.orderID,
    };

    if (!currentVault.find((v) => v.id === order._id)) {
      localStorage.setItem(
        "patient_vault",
        JSON.stringify([vaultEntry, ...currentVault]),
      );
      alert("Document successfully archived in your Patient Vault.");
    }
  };

  // --- 6. ACTION HANDLERS ---
  const handleAddToCart = (item, category) => {
    if (category === "Medicine" && item.stock <= 0) return;
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i._id === item._id && i.type === category,
      );
      if (existing) {
        if (category === "Medicine" && existing.quantity >= item.stock)
          return prev;
        return prev.map((i) =>
          i._id === item._id && i.type === category
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [...prev, { ...item, quantity: 1, type: category }];
    });
  };

  const updateQuantity = (id, type, delta) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item._id === id && item.type === type) {
          const newQty = item.quantity + delta;
          const masterItem = medicines.find((m) => m._id === id);
          if (
            type === "Medicine" &&
            delta > 0 &&
            newQty > (masterItem?.stock || 0)
          )
            return item;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      }),
    );
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const token = localStorage.getItem("token");
      const orderPayload = {
        patientId: user._id,
        patientName: user.name,
        items: cartItems.map((i) => ({
          itemId: i._id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          type: i.type,
        })),
        totalAmount: totalAmount + 50,
        status: "Pending",
      };

      const res = await axios.post(
        "http://localhost:5000/api/orders/create",
        orderPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.status === 201) {
        setCartItems([]);
        fetchData(); // Sync stock and history
        alert(`Order Placed: #${res.data.orderID}`);
      }
    } catch (err) {
      alert("Checkout failed. Check stock levels.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading)
    return (
      <div className="pat_pharma_loading">
        <Loader2 className="spinner" />
        <span>Synchronizing...</span>
      </div>
    );

  return (
    <div className="pat_pharma_container">
      <div className="pat_pharma_main">
        {/* TOP SEARCH BAR */}
        <div className="pat_pharma_header">
          <h1>
            Medical <span>Supplies & Diagnostics</span>
          </h1>
          <div className="pat_pharma_search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search prescriptions or labs..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* MEDICINES SECTION */}
        <section className="pat_pharma_section">
          <div className="pat_pharma_sec_head">
            <div className="flex_align">
              <Pill size={20} color="#2563eb" /> <h2>Medicines</h2>
            </div>
            <button
              className="pat_pharma_text_btn"
              onClick={() => setMedLimit(medLimit === 4 ? 12 : 4)}
            >
              {medLimit === 4 ? "Expand" : "Collapse"}
            </button>
          </div>
          <div className="pat_pharma_grid">
            {medicines
              .filter((m) =>
                m.name.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .slice(0, medLimit)
              .map((med) => (
                <div
                  className={`pat_pharma_card ${med.stock <= 0 ? "out_of_stock" : ""}`}
                  key={med._id}
                >
                  <div className="pat_pharma_tag">{med.category}</div>
                  <div className="pat_pharma_body">
                    <h3>{med.name}</h3>
                    <p>{med.composition}</p>
                    <span className="stock_indicator">
                      In Stock: {med.stock}
                    </span>
                  </div>
                  <div className="pat_pharma_footer">
                    <strong>₹{med.price}</strong>
                    <button
                      disabled={med.stock <= 0}
                      onClick={() => handleAddToCart(med, "Medicine")}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* TESTS SECTION */}
        <section className="pat_pharma_section">
          <div className="pat_pharma_sec_head">
            <div className="flex_align">
              <FlaskConical size={20} color="#2563eb" /> <h2>Lab Tests</h2>
            </div>
            <button
              className="pat_pharma_text_btn"
              onClick={() => setTestLimit(testLimit === 4 ? 12 : 4)}
            >
              {testLimit === 4 ? "Expand" : "Collapse"}
            </button>
          </div>
          <div className="pat_pharma_grid">
            {tests
              .filter((t) =>
                t.name.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .slice(0, testLimit)
              .map((test) => (
                <div className="pat_pharma_card test_card" key={test._id}>
                  <div className="pat_pharma_tag">{test.category}</div>
                  <div className="pat_pharma_body">
                    <h3>{test.name}</h3>
                    <div className="test_meta">
                      <Clock size={12} /> TAT: {test.turnaroundTime}
                    </div>
                  </div>
                  <div className="pat_pharma_footer">
                    <strong>₹{test.price}</strong>
                    <button onClick={() => handleAddToCart(test, "Test")}>
                      Book
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>

      {/* --- UNIFIED SIDEBAR --- */}
      <aside className="pat_pharma_sidebar">
        {/* SECTION 1: LIVE CART */}
        <div className="sidebar_section cart_box">
          <div className="sidebar_label">
            <ShoppingBag size={18} /> <h3>Bag ({cartItems.length})</h3>
          </div>
          <div className="cart_list_unified">
            {cartItems.map((item) => (
              <div className="cart_item" key={item._id}>
                <div className="item_info">
                  <strong>{item.name}</strong>
                  <span>₹{item.price}</span>
                </div>
                <div className="item_actions">
                  <div className="qty_stepper">
                    <button
                      onClick={() => updateQuantity(item._id, item.type, -1)}
                    >
                      <Minus size={10} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.type, 1)}
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                  <button
                    className="remove_btn"
                    onClick={() =>
                      setCartItems((prev) =>
                        prev.filter((i) => i._id !== item._id),
                      )
                    }
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            {cartItems.length === 0 && (
              <p className="empty_hint">No items selected.</p>
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="cart_footer">
              <div className="cart_total_row">
                <span>Grand Total:</span>
                <strong>₹{totalAmount + 50}</strong>
              </div>
              <button
                className="checkout_btn"
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <Loader2 className="spin" size={16} />
                ) : (
                  <CreditCard size={16} />
                )}{" "}
                Checkout Now
              </button>
            </div>
          )}
        </div>

        <hr className="sidebar_hr" />

        {/* SECTION 2: ORDER HISTORY */}
        <div className="sidebar_section history_box">
          <div className="sidebar_label">
            <Clock size={18} /> <h3>History</h3>
          </div>

          <div className="history_filter_strip">
            <div className="mini_filter">
              <Filter size={10} />
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
            <div className="mini_filter">
              <Calendar size={10} />
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="history_list_unified">
            {filteredHistory.map((order) => (
              <div
                className="history_card_compact"
                key={order._id}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="h_card_top">
                  <span className="h_id">#{order.orderID}</span>
                  <span className={`h_status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
                <div className="h_card_bottom">
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  <strong>₹{order.totalAmount}</strong>
                  <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* --- ORDER DETAILS MODAL OVERLAY --- */}
      {selectedOrder && (
        <div className="order_details_overlay">
          <div className="order_details_panel">
            <div className="details_header">
              <div className="header_title_set">
                <FileText color="#2563eb" size={24} />
                <div>
                  <h2>Clinical Order Details</h2>
                  <p>Order Reference: #{selectedOrder.orderID}</p>
                </div>
              </div>
              <button
                className="close_panel"
                onClick={() => setSelectedOrder(null)}
              >
                <X />
              </button>
            </div>

            <div className="details_body">
              <div className="status_badge_row">
                <span
                  className={`full_status ${selectedOrder.status.toLowerCase()}`}
                >
                  {selectedOrder.status === "Delivered" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Clock size={16} />
                  )}
                  {selectedOrder.status} Status
                </span>
              </div>

              <div className="items_ledger">
                <label>Inventory Breakdown</label>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="ledger_row">
                    <div className="l_info">
                      <strong>{item.name}</strong>
                      <span>
                        {item.quantity} x {item.type}
                      </span>
                    </div>
                    <strong>₹{item.price * item.quantity}</strong>
                  </div>
                ))}
              </div>

              <div className="billing_summary_box">
                <div className="b_row">
                  <span>Clinical Items</span>
                  <span>₹{selectedOrder.totalAmount - 50}</span>
                </div>
                <div className="b_row">
                  <span>Logistic Charges</span>
                  <span>₹50</span>
                </div>
                <div className="b_row b_total">
                  <span>Grand Total</span>
                  <span>₹{selectedOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="details_footer">
              <button
                className="download_invoice_action"
                onClick={() => handleDownloadInvoice(selectedOrder)}
              >
                <Download size={18} /> Download Invoice & Sync to Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
