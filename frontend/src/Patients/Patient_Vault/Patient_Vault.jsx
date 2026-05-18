import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  Search,
  Download,
  Share2,
  Eye,
  ShieldCheck,
  HardDrive,
  Clock,
  Plus,
  ChevronRight,
  FileDigit,
  Loader2,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Filter,
} from "lucide-react";
import "./Patient_Vault.css";

export default function Patient_Vault() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(null);

  const categories = [
    "All",
    "Prescriptions",
    "Invoices",
    "Others", // Restructured from Lab Reports, Radiology, etc.
  ];
  const user = JSON.parse(localStorage.getItem("userData")) || {};

  /* --- 1. SYNC RECORDS FROM DATABASE & LOCALSTORAGE --- */
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // 1. Fetch uploaded documents from Backend
      const dbRes = await axios.get(
        `http://localhost:5000/api/patient/vault/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // 2. Fetch system-generated invoices from localStorage (Synced from Pharmacy)
      const localInvoices = JSON.parse(
        localStorage.getItem("patient_vault") || "[]",
      );

      // Standardize local format to match DB structure for the UI
      const formattedInvoices = localInvoices.map((inv) => ({
        ...inv,
        _id: inv.id,
        name: inv.fileName || inv.name,
        type: "Invoices",
        createdAt: inv.date,
        size: 45000, // Static size for generated PDFs
        isSystemGenerated: true,
      }));

      // Combine both sources
      setFiles([...dbRes.data, ...formattedInvoices]);
    } catch (err) {
      console.error("Vault access failed:", err);
      // Fallback to local only if server fails
      const localInvoices = JSON.parse(
        localStorage.getItem("patient_vault") || "[]",
      );
      setFiles(localInvoices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user._id) fetchRecords();
  }, [user._id]);

  /* --- 2. LOGIC: TRIGGER AUTOMATED PHARMACY ORDER --- */
  const handleAutoOrder = async (file) => {
    if (
      !window.confirm(
        `Confirm order for ${file.name}? Stock will be reserved immediately.`,
      )
    )
      return;

    setOrderLoading(file._id);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/procurement/auto-fulfill",
        {
          vaultId: file._id,
          patientId: user._id,
          resourceId: file.resourceId,
          quantity: file.prescribedCount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert(
        "Order placed successfully! Visit the Pharmacy counter for pickup.",
      );
      fetchRecords();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Order failed. Item might be out of stock.",
      );
    } finally {
      setOrderLoading(null);
    }
  };

  /* --- 3. DOCUMENT UPLOAD HANDLER --- */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);
    formData.append("patientId", user._id);

    // Automatically map any upload or custom active tab parameter straight to "Others"
    formData.append(
      "type",
      activeCategory === "All" ||
        activeCategory === "Prescriptions" ||
        activeCategory === "Invoices"
        ? "Others"
        : activeCategory,
    );

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/patient/vault/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      fetchRecords();
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  /* --- 4. FILTER ENGINE --- */
  const filteredFiles = useMemo(() => {
    return files
      .filter((f) => {
        const matchesSearch = f.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        if (activeCategory === "All") return matchesSearch;
        if (activeCategory === "Prescriptions")
          return f.type === "Prescriptions" && matchesSearch;
        if (activeCategory === "Invoices")
          return f.type === "Invoices" && matchesSearch;

        // "Others" acts as a catch-all for custom uploads or generic medical classifications
        if (activeCategory === "Others") {
          return (
            f.type !== "Prescriptions" && f.type !== "Invoices" && matchesSearch
          );
        }

        return false;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [activeCategory, searchQuery, files]);

  // Storage calculation
  const totalUsedSize = useMemo(() => {
    return (
      files.reduce((acc, f) => acc + (f.size || 0), 0) /
      (1024 * 1024)
    ).toFixed(2);
  }, [files]);

  if (loading && files.length === 0)
    return (
      <div className="pat_vau_loading">
        <Loader2 className="spinner" />{" "}
        <span>Decrypting Clinical Vault...</span>
      </div>
    );

  return (
    <div className="pat_vau_container">
      <div className="pat_vau_main">
        {/* HEADER SECTION */}
        <div className="pat_vau_header">
          <div className="pat_vau_title">
            <h1>
              Medical <span>Vault</span>
            </h1>
            <p>
              Securely manage prescriptions, lab results, and generated
              invoices.
            </p>
          </div>
          <div className="pat_vau_header_actions">
            <label className="pat_vau_upload_btn">
              <Plus size={18} /> Upload Document
              <input type="file" hidden onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        {/* SEARCH & CATEGORY BAR */}
        <div className="pat_vau_controls">
          <div className="pat_vau_search_bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by filename or ID..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="pat_vau_tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={activeCategory === cat ? "active" : ""}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* RECORDS TABLE */}
        <div className="pat_vau_file_list">
          <div className="pat_vau_list_header">
            <span>Clinical Document</span>
            <span>Category</span>
            <span>Date Added</span>
            <span className="text_right">Action Console</span>
          </div>

          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <div className="pat_vau_file_item" key={file._id}>
                <div className="file_name">
                  <div
                    className={`file_icon ${file.type.replace(" ", "_").toLowerCase()}`}
                  >
                    {file.type === "Invoices" ? (
                      <FileDigit size={18} />
                    ) : (
                      <FileText size={18} />
                    )}
                  </div>
                  <div>
                    <strong>{file.name}</strong>
                    <div className="file_meta_sub">
                      <small>{(file.size / 1024).toFixed(1)} KB</small>
                      {file.isSystemGenerated && (
                        <span className="sys_badge">System Generated</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="file_type">
                  <span
                    className={`type_tag ${file.type.toLowerCase().replace(" ", "_")}`}
                  >
                    {file.type}
                  </span>
                </div>

                <div className="file_date">
                  {new Date(file.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>

                <div className="file_actions">
                  {/* Direct Ordering Logic - Restructured Condition */}
                  {file.type === "Prescriptions" && file.resourceId && (
                    <div className="fulfillment_zone">
                      {file.isOrdered ? (
                        <span className="status_ordered">
                          <CheckCircle2 size={14} /> Fulfilled
                        </span>
                      ) : (
                        <button
                          className="vau_direct_order_btn"
                          onClick={() => handleAutoOrder(file)}
                          disabled={orderLoading === file._id}
                        >
                          {orderLoading === file._id ? (
                            <Loader2 size={14} className="spinner" />
                          ) : (
                            <ShoppingCart size={14} />
                          )}
                          Order
                        </button>
                      )}
                    </div>
                  )}

                  <div className="action_divider"></div>

                  <button
                    className="vau_icon_btn"
                    title="View Document"
                    onClick={() => {
                      if (file.isSystemGenerated) {
                        alert(
                          "System invoices can be acquired natively via your device downloads menu.",
                        );
                        return;
                      }
                      window.open(
                        `http://localhost:5000/uploads/vault/${file.filename}`,
                        "_blank",
                      );
                    }}
                  >
                    <Eye size={16} />
                  </button>

                  {/* HIGH FIDELITY DOWNLOAD TRIGGER PIPELINE */}
                  {file.isSystemGenerated ? (
                    // System invoice fallback downloads directly via local storage binary stream strings
                    <a
                      className="vau_icon_btn"
                      title="Download Invoice File"
                      href={file.fileUrl || "#"} // Pulls data URL link context if matched
                      download={file.name}
                    >
                      <Download size={16} />
                    </a>
                  ) : (
                    // Regular uploads point to the uploads folder address with explicit download override markers
                    <a
                      className="vau_icon_btn"
                      title="Download Local Asset Copy"
                      href={`http://localhost:5000/uploads/vault/${file.filename}`}
                      download={file.name} // Forces browser transfer to local device storage paths
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="pat_vau_empty">
              <AlertCircle size={40} />
              <p>No health records found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* SIDEBAR METRICS */}
      <aside className="pat_vau_sidebar">
        <div className="pat_vau_card pat_vau_storage">
          <div className="card_head">
            <HardDrive size={20} color="#2563eb" />
            <h3>Vault Usage</h3>
          </div>
          <div className="storage_bar_container">
            <div
              className="storage_bar_fill"
              style={{ width: `${(totalUsedSize / 500) * 100}%` }}
            ></div>
          </div>
          <p className="storage_text">
            <strong>{totalUsedSize} MB</strong> used of 500 MB
          </p>
          <button className="vau_secondary_btn">Clean Up Storage</button>
        </div>

        <div className="pat_vau_card vault_security_card">
          <div className="card_head">
            <ShieldCheck size={20} color="#10b981" />
            <h3>Security Info</h3>
          </div>
          <p>
            All documents in your vault are encrypted and only accessible by you
            and authorized medical staff during active appointments.
          </p>
        </div>

        <div className="pat_vau_card help_card">
          <div className="card_head">
            <Clock size={20} color="#f59e0b" />
            <h3>Quick Fulfillment</h3>
          </div>
          <p>
            You can order medicines directly from your{" "}
            <strong>Prescriptions</strong> tab. These will be prepared at the
            central pharmacy.
          </p>
        </div>
      </aside>
    </div>
  );
}
