import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home       from "@/pages/Home";
import AdminPanel from "@/pages/AdminPanel";

/**
 * App — root component.
 * Routes:
 *   /       → Home (panorama viewer)
 *   /admin  → AdminPanel (inventory management)
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<Home />}       />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

