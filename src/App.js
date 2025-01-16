import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth.js";
import Landing from "./pages/landing.js";
import Dashboard from "./pages/dashboard.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Tambahkan route lainnya */}
      </Routes>
    </Router>
  );
}

export default App;
