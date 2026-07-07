import React, { useState, useEffect, useRef } from "react";
import { getInventory } from "@/lib/inventoryApi";

/**
 * InventorySheet — Slide-in panel showing items in a specific rack.
 *
 * Props:
 *   rack       — { rack_id, name, node, ... } — the rack whose inventory to show
 *   labId      — "main_lab" | "mechanical_lab"
 *   onClose    — called when the sheet is dismissed
 */
export default function InventorySheet({ rack, labId, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const sheetRef = useRef(null);

  /* Load inventory data */
  useEffect(() => {
    if (!rack || !labId) return;
    setLoading(true);
    setError(null);

    getInventory(labId)
      .then((data) => {
        const found = data.racks?.find((r) => r.rack_id === rack.rack_id);
        setItems(found?.items ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [rack, labId]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 100);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  /* Filter + sort: in-stock first, then alphabetical */
  const filtered = items
    .filter((item) =>
      !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.in_stock !== b.in_stock) return b.in_stock - a.in_stock;
      return a.name.localeCompare(b.name);
    });

  const inStockCount = items.filter((i) => i.in_stock).length;

  return (
    <div className="inv-sheet-overlay">
      <div className="inv-sheet" ref={sheetRef} role="dialog" aria-label={`Inventory: ${rack?.name}`}>
        {/* ── Header ── */}
        <div className="inv-sheet__header">
          <div className="inv-sheet__header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="inv-sheet__header-info">
            <h2 className="inv-sheet__title">{rack?.name}</h2>
            <p className="inv-sheet__subtitle">
              {inStockCount}/{items.length} items in stock
            </p>
          </div>
          <button className="inv-sheet__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Search ── */}
        <div className="inv-sheet__search-wrap">
          <svg className="inv-sheet__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="inv-sheet__search"
            type="text"
            placeholder="Search items or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button className="inv-sheet__search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* ── Body ── */}
        <div className="inv-sheet__body">
          {loading && (
            <div className="inv-sheet__state">
              <div className="inv-sheet__spinner" />
              <p>Loading inventory…</p>
            </div>
          )}

          {error && (
            <div className="inv-sheet__state inv-sheet__state--error">
              <p>⚠ {error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="inv-sheet__state">
              <p>{search ? "No items match your search." : "This rack has no items yet."}</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className={item.in_stock ? "" : "inv-table__row--oos"}>
                    <td className="inv-table__name">{item.name}</td>
                    <td className="inv-table__cat">{item.category}</td>
                    <td className="inv-table__qty">
                      {item.quantity} <span className="inv-table__unit">{item.unit}</span>
                    </td>
                    <td>
                      <span className={`inv-badge ${item.in_stock ? "inv-badge--in" : "inv-badge--out"}`}>
                        {item.in_stock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="inv-sheet__footer">
          <span className="inv-sheet__footer-lab">
            {labId === "mechanical_lab" ? "🔧 Mechanical Lab" : "⚗️ Engineering Lab"}
          </span>
          <a href="/admin" className="inv-sheet__admin-link" target="_blank" rel="noopener noreferrer">
            Manage Inventory →
          </a>
        </div>
      </div>
    </div>
  );
}
