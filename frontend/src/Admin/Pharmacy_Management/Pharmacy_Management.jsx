import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FlaskConical,
  Search,
  Plus,
  Clock,
  Pill,
  Trash2,
  Edit3,
  Loader2,
  Activity,
  RefreshCw,
  Database,
  ThermometerSnowflake,
  AlertTriangle,
  Beaker,
  ShieldCheck,
  X,
  Zap,
  Layers,
  ShoppingBag,
  History,
  CalendarCheck,
  Filter,
  Save,
  User,
  Hash,
  IndianRupee,
  Fingerprint,
  LayoutGrid,
  FileText,
  Settings2,
} from "lucide-react";
import "./Pharmacy_Management.css";

export default function ResourceManagement() {
  /* ============================================================
     1. ERP STATE ARCHESTRATION
     ============================================================ */
  const [viewMode, setViewMode] = useState("Registry");
  const [activeCategory, setActiveCategory] = useState("Diagnostics");

  // Core Data Streams
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  // Clinical Inventories
  const [tests, setTests] = useState([]);
  const [medicines, setMedicines] = useState([]);

  // Audit & Procurement Logs
  const [testOrders, setTestOrders] = useState([]);
  const [medOrders, setMedOrders] = useState([]);

  // UI Component States
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    tat: "",
    stock: "",
    expiryDate: "",
    composition: "",
    storage: "Ambient",
    batchNo: "",
  });

  /* ============================================================
     2. MULTI-COLLECTION SYNC ENGINE
     ============================================================ */
  const syncHospitalERP = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Parallel data fetching for Zero-Latency switching
      const [resTests, resMeds, resTestLogs, resMedLogs] = await Promise.all([
        axios.get("http://localhost:5000/api/tests/all", { headers }),
        axios.get("http://localhost:5000/api/medicines/all", { headers }),
        axios.get("http://localhost:5000/api/procurement/tests/history", {
          headers,
        }),
        axios.get("http://localhost:5000/api/procurement/medicines/history", {
          headers,
        }),
      ]);

      setTests(resTests.data || []);
      setMedicines(resMeds.data || []);
      setTestOrders(resTestLogs.data || []);
      setMedOrders(resMedLogs.data || []);
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Clinical ERP Sync Failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncHospitalERP();
    const interval = setInterval(syncHospitalERP, 300000); // 5-minute cycle auto-refresh
    return () => clearInterval(interval);
  }, []);

  /* ============================================================
     3. REQUISITION & REGISTRY HANDLERS
     ============================================================ */
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegistrySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const route = activeCategory === "Diagnostics" ? "tests" : "medicines";

      let targetedPayload = {};

      if (activeCategory === "Diagnostics") {
        targetedPayload = {
          name: formData.name,
          category: formData.category || "General Pathology",
          price: parseFloat(formData.price),
          tat: formData.tat ? parseInt(formData.tat, 10) : 12,
          stock: formData.stock ? parseInt(formData.stock, 10) : 0,
        };
      } else {
        // 🟢 CALCULATE FALLBACK DATE: If blank, default to exactly 1 year from today (YYYY-MM-DD)
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        const fallbackExpiryDateStr = nextYear.toISOString().split("T")[0];

        targetedPayload = {
          name: formData.name,
          composition: formData.composition || "Pharmacological Spec",
          storage: formData.storage || "Ambient",
          price: parseFloat(formData.price),
          stock: formData.stock ? parseInt(formData.stock, 10) : 0,
          // 🟢 FIXED: Fallback condition ensures expiryDate is NEVER empty or dropped
          expiryDate: formData.expiryDate || fallbackExpiryDateStr,
          batchNo: formData.batchNo || `BAT-${Date.now().toString().slice(-4)}`,
        };
      }

      await axios.post(
        `http://localhost:5000/api/${route}/add`,
        targetedPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setShowForm(false);
      setFormData({
        name: "",
        category: "",
        price: "",
        tat: "",
        stock: "",
        expiryDate: "",
        composition: "",
        storage: "Ambient",
        batchNo: "",
      });

      syncHospitalERP();
    } catch (err) {
      const serverErrorMessage = err.response?.data?.message || err.message;
      alert(`ERP Validation Error: ${serverErrorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (
      window.confirm(
        "Permanently decommission this resource from active catalog?",
      )
    ) {
      try {
        const token = localStorage.getItem("token");
        const route = type === "tests" ? "tests" : "medicines";
        await axios.delete(`http://localhost:5000/api/${route}/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        syncHospitalERP();
      } catch (err) {
        alert(
          "Operational Failure: Item is currently linked to active orders.",
        );
      }
    }
  };

  /* ============================================================
     4. INTELLIGENT FILTERING ENGINE
     ============================================================ */
  const processedData = useMemo(() => {
    let source = [];

    if (viewMode === "Registry") {
      source = activeCategory === "Diagnostics" ? [...tests] : [...medicines];
    } else {
      source =
        activeCategory === "Diagnostics" ? [...testOrders] : [...medOrders];
    }

    // Global Multi-Column Search
    if (searchQuery) {
      source = source.filter(
        (item) =>
          (item.name || item.resourceName || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (item.orderId || item._id || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (item.orderedBy || item.category || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    // ERP Ranking & Sorting Logic
    source.sort((a, b) => {
      const valA = a.name || a.resourceName || "";
      const valB = b.name || b.resourceName || "";
      if (sortBy === "name") return valA.localeCompare(valB);
      if (sortBy === "price")
        return (
          (a.price || a.totalAmount || 0) - (b.price || b.totalAmount || 0)
        );
      if (sortBy === "stock")
        return (a.stock || a.quantity || 0) - (b.stock || b.quantity || 0);
      return 0;
    });

    return source;
  }, [
    viewMode,
    activeCategory,
    tests,
    medicines,
    testOrders,
    medOrders,
    searchQuery,
    sortBy,
  ]);

  if (loading && tests.length === 0)
    return (
      <div className="admin_res_hub_loader_frame">
        <div className="admin_res_hub_loader_box">
          <Loader2 className="admin_rev_intel_spin" size={52} />
          <h2>Initializing Terminal</h2>
          <p>Parsing clinical schemas and historical audit logs...</p>
        </div>
      </div>
    );

  return (
    <div className="admin_res_hub_root_view doc_home_view_fade_in">
      {/* MASTER ERP HEADER */}
      <header className="admin_res_hub_top_header">
        <div className="admin_res_hub_branding_zone">
          <h1>
            Clinical{" "}
            <span className="admin_res_hub_cyan_text">Intelligence</span>
          </h1>
          <div className="admin_res_hub_sync_pill">
            <RefreshCw
              size={12}
              className={loading ? "admin_rev_intel_spin" : ""}
            />
            <span>Verified: {lastSynced}</span>
          </div>
        </div>

        <div className="admin_res_hub_header_actions">
          <div className="admin_res_hub_global_search">
            <Search size={18} />
            <input
              placeholder={`Search ${activeCategory.toLowerCase()} ${viewMode === "History" ? "logs" : "catalog"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin_res_hub_view_toggle_group">
            <button
              className={viewMode === "Registry" ? "active" : ""}
              onClick={() => setViewMode("Registry")}
            >
              <LayoutGrid size={16} /> <span>Registry</span>
            </button>
            <button
              className={viewMode === "History" ? "active" : ""}
              onClick={() => setViewMode("History")}
            >
              <History size={16} /> <span>Audit Logs</span>
            </button>
          </div>

          {viewMode === "Registry" && (
            <button
              className="admin_res_hub_add_btn"
              onClick={() => setShowForm(true)}
            >
              <Plus size={20} /> Register Entry
            </button>
          )}
        </div>
      </header>

      {/* SUB-TOOLBAR: CATEGORY & SORTING */}
      <div className="admin_res_hub_toolbar_row">
        <div className="admin_res_hub_tab_group">
          <button
            className={
              activeCategory === "Diagnostics"
                ? "admin_res_hub_tab active"
                : "admin_res_hub_tab"
            }
            onClick={() => setActiveCategory("Diagnostics")}
          >
            <Beaker size={17} /> <span>Pathology Lab</span>
          </button>
          <button
            className={
              activeCategory === "Pharmacy"
                ? "admin_res_hub_tab active"
                : "admin_res_hub_tab"
            }
            onClick={() => setActiveCategory("Pharmacy")}
          >
            <Pill size={17} /> <span>Pharma Depot</span>
          </button>
        </div>

        <div className="admin_res_hub_sort_wrapper">
          <div className="admin_res_hub_sort_label">
            <Filter size={14} /> Analytics Sort:
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="admin_res_hub_sort_select"
          >
            <option value="name">Alpha (A-Z)</option>
            <option value="price">Pricing Index</option>
            {viewMode === "Registry" && (
              <option value="stock">Inventory Depth</option>
            )}
          </select>
        </div>
      </div>

      {/* ERP REGISTRY MODAL */}
      {showForm && (
        <div className="admin_res_hub_modal_overlay">
          <div className="admin_res_hub_modal_card doc_home_view_fade_in">
            <div className="admin_res_hub_modal_header">
              <div className="admin_res_hub_modal_title">
                {activeCategory === "Diagnostics" ? (
                  <FlaskConical size={20} />
                ) : (
                  <Pill size={20} />
                )}
                <h3>Global Registry Entry: {activeCategory}</h3>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="admin_res_hub_close_modal"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleRegistrySubmit}
              className="admin_res_hub_form_grid"
            >
              <div className="admin_res_hub_form_field full">
                <label>
                  <Fingerprint size={12} /> Primary Resource Name
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Lipoprotein Analysis"
                  onChange={handleInputChange}
                />
              </div>

              {activeCategory === "Diagnostics" ? (
                <>
                  <div className="admin_res_hub_form_field">
                    <label>
                      <Layers size={12} /> Lab Category
                    </label>
                    <input
                      name="category"
                      placeholder="e.g. Hematology"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="admin_res_hub_form_field">
                    <label>
                      <Clock size={12} /> TAT Hours
                    </label>
                    <input
                      name="tat"
                      placeholder="e.g. 12"
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="admin_res_hub_form_field">
                    <label>
                      <Zap size={12} /> Salt Composition
                    </label>
                    <input
                      name="composition"
                      placeholder="e.g. Metformin 500mg"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="admin_res_hub_form_field">
                    <label>Inventory Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="admin_res_hub_form_field">
                    <label>
                      <ThermometerSnowflake size={12} /> Storage Type
                    </label>
                    <select name="storage" onChange={handleInputChange}>
                      <option value="Ambient">Ambient</option>
                      <option value="Cold">Cold Storage</option>
                      <option value="Frozen">Frozen</option>
                    </select>
                  </div>
                </>
              )}

              <div className="admin_res_hub_form_field">
                <label>
                  <IndianRupee size={12} /> Unit Pricing
                </label>
                <input
                  name="price"
                  type="number"
                  required
                  placeholder="0.00"
                  onChange={handleInputChange}
                />
              </div>
              <div className="admin_res_hub_form_field">
                <label>
                  <Database size={12} /> Opening Stock
                </label>
                <input
                  name="stock"
                  type="number"
                  required
                  placeholder="Initial units"
                  onChange={handleInputChange}
                />
              </div>

              <div className="admin_res_hub_form_actions">
                <button
                  type="button"
                  className="admin_res_hub_btn_cancel"
                  onClick={() => setShowForm(false)}
                >
                  Discard
                </button>
                <button type="submit" className="admin_res_hub_btn_submit">
                  <Save size={16} /> Save Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DYNAMIC VIEWPORT CONTENT */}
      <main className="admin_res_hub_viewport">
        {viewMode === "History" ? (
          /* ============================================================
             VIEW A: PROCUREMENT AUDIT LOGS (WHO ORDERED WHAT)
             ============================================================ */
          <div className="admin_res_hub_audit_terminal doc_home_view_fade_in">
            <div className="admin_res_hub_audit_header">
              <div className="audit_summary">
                <ShoppingBag size={20} color="#007acc" />
                <div>
                  <h3>Transactional Audit Log</h3>
                  <p>
                    Complete fulfillment history for {activeCategory}{" "}
                    requisitions.
                  </p>
                </div>
              </div>
              <div className="admin_res_hub_audit_count">
                {processedData.length} Records
              </div>
            </div>

            <div className="admin_res_hub_table_frame">
              <table className="admin_res_hub_audit_table">
                <thead>
                  <tr>
                    <th>Order Ref & Date</th>
                    <th>Authorizing Staff</th>
                    <th>Clinical Resource</th>
                    <th>Quantity</th>
                    <th>Fulfillment</th>
                    <th className="admin_res_hub_text_right">Total Billing</th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.length > 0 ? (
                    processedData.map((order) => (
                      <tr key={order._id}>
                        <td className="admin_res_hub_font_mono">
                          <div className="admin_res_hub_order_id">
                            <Hash size={14} />{" "}
                            <b>
                              {order.orderId ||
                                order._id.slice(-8).toUpperCase()}
                            </b>
                            <span>{order.date || "May 13, 2026"}</span>
                          </div>
                        </td>
                        <td>
                          <div className="admin_res_hub_staff_meta">
                            <div className="admin_res_hub_staff_icon">
                              <User size={14} />
                            </div>
                            <div>
                              <b>{order.orderedBy || "Med-Admin"}</b>
                              <span>ID: {order.staffId || "STF-ER-44"}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="admin_res_hub_res_identity">
                            {order.isVaultOrder ? (
                              <ShieldCheck size={14} color="#10b981" />
                            ) : (
                              <ShoppingBag size={14} />
                            )}
                            <b>{order.resourceName || order.name}</b>
                            {order.isVaultOrder && (
                              <small className="vault_tag">FROM_VAULT</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <b>{order.quantity || 1} SKU(s)</b>
                        </td>
                        <td>
                          <span
                            className={`admin_res_hub_status_pill ${order.status?.toLowerCase() || "completed"}`}
                          >
                            {order.status || "Completed"}
                          </span>
                        </td>
                        <td className="admin_res_hub_text_right">
                          <b className="admin_res_hub_valuation_text">
                            ₹{order.totalAmount || "0.00"}
                          </b>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="admin_res_hub_table_empty">
                        <div className="empty_state_box">
                          <Activity size={48} />
                          <p>
                            No procurement history found for {activeCategory}.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ============================================================
             VIEW B: RESOURCE SMART GRID (REGISTRY CARDS)
             ============================================================ */
          <div className="admin_res_hub_smart_grid doc_home_view_fade_in">
            {processedData.length > 0 ? (
              processedData.map((item) => (
                <div
                  className={`admin_res_hub_resource_card ${activeCategory === "Pharmacy" && item.stock < 20 ? "critical_stock_alert" : ""}`}
                  key={item._id}
                >
                  {/* Card Header */}
                  <div className="admin_res_hub_card_head">
                    <div
                      className={`admin_res_hub_icon_box ${activeCategory === "Diagnostics" ? "diag_theme" : "pharm_theme"}`}
                    >
                      {activeCategory === "Diagnostics" ? (
                        <FlaskConical size={20} />
                      ) : (
                        <Pill size={20} />
                      )}
                    </div>
                    <div className="admin_res_hub_card_meta">
                      <span className="admin_res_hub_meta_tag">
                        {activeCategory === "Diagnostics"
                          ? "LAB_UNIT"
                          : "PHARMA_SKU"}
                      </span>
                      <span className="admin_res_hub_meta_id">
                        #{item._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <div className="admin_res_hub_card_actions_mini">
                      <Settings2 size={16} />
                    </div>
                  </div>

                  {/* Information Stack */}
                  <div className="admin_res_hub_card_content">
                    <h3 className="admin_res_hub_item_title">{item.name}</h3>
                    <p className="admin_res_hub_item_sub">
                      {activeCategory === "Diagnostics" ? (
                        <>
                          <Layers size={12} />{" "}
                          {item.category || "General Pathology"}
                        </>
                      ) : (
                        <>
                          <FileText size={12} />{" "}
                          {item.composition || "Pharmacological Spec"}
                        </>
                      )}
                    </p>
                  </div>

                  {/* Logistics metrics */}
                  <div className="admin_res_hub_metrics_row">
                    {activeCategory === "Diagnostics" ? (
                      <div className="admin_res_hub_diag_metrics">
                        <div className="admin_res_hub_metric_pill">
                          <Clock size={14} />
                          <span>
                            TAT: <strong>{item.tat || "12h"}</strong>
                          </span>
                        </div>
                        <div className="admin_res_hub_metric_pill admin_res_hub_price_pill">
                          <IndianRupee size={14} />
                          <span>{item.price}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="admin_res_hub_pharm_metrics">
                        <div className="admin_res_hub_metric_pill">
                          <Database size={14} />
                          <span>
                            Units: <strong>{item.stock}</strong>
                          </span>
                        </div>
                        <div
                          className={`admin_res_hub_metric_pill admin_res_hub_expiry_pill ${new Date(item.expiryDate) < new Date() ? "expired" : ""}`}
                        >
                          <CalendarCheck size={14} />
                          <span>
                            {item.expiryDate
                              ?.split("-")
                              .reverse()
                              .slice(0, 2)
                              .join("/")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visual Health Visualizer (Pharmacy Only) */}
                  {activeCategory === "Pharmacy" && (
                    <div className="admin_res_hub_visual_pulse">
                      <div className="admin_res_hub_pulse_bg">
                        <div
                          className="admin_res_hub_pulse_fill"
                          style={{
                            width: `${Math.min((item.stock / 200) * 100, 100)}%`,
                            backgroundColor:
                              item.stock < 20 ? "#ef4444" : "#10b981",
                          }}
                        ></div>
                      </div>
                      {item.stock < 20 && (
                        <div className="admin_res_hub_critical_label">
                          <AlertTriangle size={12} />{" "}
                          <span>Low Inventory Re-order</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Terminal Action Grouping */}
                  <div className="admin_res_hub_card_footer_actions">
                    <button className="admin_res_hub_action_edit">
                      <Edit3 size={14} /> <span>Configure</span>
                    </button>
                    <button
                      className="admin_res_hub_action_delete"
                      onClick={() =>
                        handleDelete(
                          activeCategory === "Diagnostics"
                            ? "tests"
                            : "medicines",
                          item._id,
                        )
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin_res_hub_registry_empty">
                <Activity size={50} />
                <h3>Zero Catalog Matches</h3>
                <p>
                  Try refining the search or adding a new clinical resource.
                </p>
                <button
                  className="admin_res_hub_reset_btn"
                  onClick={() => {
                    setSearchQuery("");
                    syncHospitalERP();
                  }}
                >
                  <RefreshCw size={16} /> Sync Registry
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
