import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth.js";
import Landing from "./pages/landing.js";
import Dashboard from "./pages/dashboard.js";
import Sertifikat from "./pages/sertifikat.js";
import Pemetaan from "./pages/pemetaan.js";
import FormSertifikat from "./form/f_sertifikat.js"; // Import form sertifikat

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sertifikat" element={<Sertifikat />} />
        <Route path="/pemetaan" element={<Pemetaan />} />
        <Route path="/sertifikat/form" element={<FormSertifikat />} /> {/* Route baru */}
      </Routes>
    </Router>
  );
}

export default App;
