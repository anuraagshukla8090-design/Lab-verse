import React, { useState, useEffect, useCallback } from "react";
import {
  getInventory,
  createRack,
  deleteRack,
  createItem,
  updateItem,
  deleteItem,
} from "@/lib/inventoryApi";

const LABS = [
  { id: "main_lab",        label: "⚗️  Engineering Lab" },
  { id: "mechanical_lab",  label: "🔧  Mechanical Lab"  },
];

/* ── Tiny helpers ─────────────────────────────────────────────────── */
function StatusBadge({ inStock }) {
  return (
    <span className={`inv-badge ${inStock ? "inv-badge--in" : "inv-badge--out"}`}>
      {inStock ? "In Stock" : "Out of Stock"}
    </span>
  );
}

function Spinner() {
  return <div className="inv-sheet__spinner admin-spinner" />;
}

/* ── Main component ───────────────────────────────────────────────── */
export default function AdminPanel() {
  const [labId,    setLabId]    = useState("main_lab");
  const [data,     setData]     = useState(null);       // full inventory object
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [rackId,   setRackId]   = useState(null);       // selected rack_id
  const [toast,    setToast]    = useState(null);        // { msg, type }

  /* New-rack form state */
  const [newRackName, setNewRackName] = useState("");
  const [addingRack,  setAddingRack]  = useState(false);

  /* New-item form state */
  const [newItem, setNewItem] = useState({ name: "", category: "", quantity: 0, unit: "units", in_stock: true });
  const [addingItem, setAddingItem] = useState(false);

  /* ── Data loading ── */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const inv = await getInventory(labId);
      setData(inv);
      if (!rackId && inv.racks?.length) setRackId(inv.racks[0].rack_id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [labId]); // eslint-disable-line

  useEffect(() => { setRackId(null); load(); }, [labId]); // eslint-disable-line

  /* ── Toast helper ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Current rack ── */
  const currentRack = data?.racks?.find((r) => r.rack_id === rackId);

  /* ── Handlers: Racks ── */
  const handleAddRack = async (e) => {
    e.preventDefault();
    if (!newRackName.trim()) return;
    setAddingRack(true);
    try {
      await createRack(labId, { name: newRackName.trim() });
      setNewRackName("");
      await load();
      showToast("Rack created successfully.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setAddingRack(false);
    }
  };

  const handleDeleteRack = async (rid) => {
    if (!confirm("Delete this rack and all its items? This cannot be undone.")) return;
    try {
      await deleteRack(labId, rid);
      if (rackId === rid) setRackId(null);
      await load();
      showToast("Rack deleted.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  /* ── Handlers: Items ── */
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim() || !rackId) return;
    setAddingItem(true);
    try {
      await createItem(labId, rackId, { ...newItem, quantity: Number(newItem.quantity) });
      setNewItem({ name: "", category: "", quantity: 0, unit: "units", in_stock: true });
      await load();
      showToast("Item added.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setAddingItem(false);
    }
  };

  const handleQtyChange = async (item, delta) => {
    const newQty = Math.max(0, item.quantity + delta);
    try {
      await updateItem(labId, rackId, item.id, { quantity: newQty, in_stock: newQty > 0 });
      await load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleToggleStock = async (item) => {
    try {
      await updateItem(labId, rackId, item.id, { in_stock: !item.in_stock });
      await load();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteItem = async (item) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await deleteItem(labId, rackId, item.id);
      await load();
      showToast("Item removed.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  /* ── Render ── */
  return (
    <div className="admin-page">

      {/* Toast */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* ── Topbar ── */}
      <header className="admin-topbar">
        <div className="admin-topbar__left">
          <a href="/" className="admin-topbar__back">← Back to LabVerse</a>
          <h1 className="admin-topbar__title">Inventory Admin</h1>
        </div>
        <div className="admin-lab-tabs">
          {LABS.map((lab) => (
            <button
              key={lab.id}
              className={`admin-lab-tab ${labId === lab.id ? "admin-lab-tab--active" : ""}`}
              onClick={() => setLabId(lab.id)}
            >
              {lab.label}
            </button>
          ))}
        </div>
      </header>

      {loading && (
        <div className="admin-loading"><Spinner /><p>Loading inventory…</p></div>
      )}

      {error && (
        <div className="admin-error">
          <p>⚠ {error}</p>
          <button onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="admin-layout">

          {/* ── Sidebar: Rack List ── */}
          <aside className="admin-sidebar">
            <div className="admin-sidebar__head">
              <h2>Racks</h2>
              <span className="admin-sidebar__count">{data.racks.length}</span>
            </div>

            <ul className="admin-rack-list">
              {data.racks.map((rack) => (
                <li
                  key={rack.rack_id}
                  className={`admin-rack-item ${rack.rack_id === rackId ? "admin-rack-item--active" : ""}`}
                  onClick={() => setRackId(rack.rack_id)}
                >
                  <span className="admin-rack-item__name">{rack.name}</span>
                  <span className="admin-rack-item__count">
                    {rack.items.filter((i) => i.in_stock).length}/{rack.items.length}
                  </span>
                  <button
                    className="admin-rack-item__del"
                    onClick={(e) => { e.stopPropagation(); handleDeleteRack(rack.rack_id); }}
                    title="Delete rack"
                    aria-label={`Delete rack ${rack.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            {/* Add rack form */}
            <form className="admin-add-rack" onSubmit={handleAddRack}>
              <input
                type="text"
                placeholder="New rack name…"
                value={newRackName}
                onChange={(e) => setNewRackName(e.target.value)}
                className="admin-input"
                disabled={addingRack}
              />
              <button type="submit" className="admin-btn admin-btn--primary" disabled={addingRack || !newRackName.trim()}>
                {addingRack ? "…" : "+ Rack"}
              </button>
            </form>
          </aside>

          {/* ── Main: Item Table ── */}
          <main className="admin-main">
            {!currentRack ? (
              <div className="admin-empty">
                <p>Select a rack from the sidebar, or create one.</p>
              </div>
            ) : (
              <>
                <div className="admin-main__head">
                  <div>
                    <h2 className="admin-main__rack-name">{currentRack.name}</h2>
                    <p className="admin-main__rack-meta">
                      {currentRack.items.filter((i) => i.in_stock).length} in stock &nbsp;·&nbsp;
                      {currentRack.items.filter((i) => !i.in_stock).length} out of stock &nbsp;·&nbsp;
                      {currentRack.items.length} total
                    </p>
                  </div>
                </div>

                {/* Item table */}
                {currentRack.items.length === 0 ? (
                  <p className="admin-empty-msg">No items yet — add one below.</p>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Qty / Unit</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRack.items.map((item) => (
                          <tr key={item.id} className={item.in_stock ? "" : "admin-table__row--oos"}>
                            <td className="admin-table__name">{item.name}</td>
                            <td className="admin-table__cat">{item.category || "—"}</td>
                            <td className="admin-table__qty">
                              <div className="admin-qty-ctrl">
                                <button
                                  className="admin-qty-btn"
                                  onClick={() => handleQtyChange(item, -1)}
                                  disabled={item.quantity === 0}
                                  aria-label="Decrease quantity"
                                >−</button>
                                <span>{item.quantity}</span>
                                <button
                                  className="admin-qty-btn"
                                  onClick={() => handleQtyChange(item, +1)}
                                  aria-label="Increase quantity"
                                >+</button>
                                <span className="admin-table__unit">{item.unit}</span>
                              </div>
                            </td>
                            <td>
                              <button
                                className={`admin-status-btn ${item.in_stock ? "admin-status-btn--in" : "admin-status-btn--out"}`}
                                onClick={() => handleToggleStock(item)}
                                title="Click to toggle stock status"
                              >
                                {item.in_stock ? "✓ In Stock" : "✗ Out of Stock"}
                              </button>
                            </td>
                            <td>
                              <button
                                className="admin-del-btn"
                                onClick={() => handleDeleteItem(item)}
                                title="Remove item"
                                aria-label={`Delete ${item.name}`}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Add item form */}
                <form className="admin-add-item" onSubmit={handleAddItem}>
                  <h3 className="admin-add-item__title">Add Item</h3>
                  <div className="admin-add-item__grid">
                    <input
                      className="admin-input"
                      type="text"
                      placeholder="Item name *"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      required
                    />
                    <input
                      className="admin-input"
                      type="text"
                      placeholder="Category (e.g. Electronics)"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    />
                    <input
                      className="admin-input"
                      type="number"
                      min={0}
                      placeholder="Quantity"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    />
                    <input
                      className="admin-input"
                      type="text"
                      placeholder="Unit (e.g. pieces, sets)"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    />
                    <label className="admin-check-label">
                      <input
                        type="checkbox"
                        checked={newItem.in_stock}
                        onChange={(e) => setNewItem({ ...newItem, in_stock: e.target.checked })}
                      />
                      In stock
                    </label>
                    <button
                      type="submit"
                      className="admin-btn admin-btn--primary"
                      disabled={addingItem || !newItem.name.trim()}
                    >
                      {addingItem ? "Adding…" : "Add Item"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
