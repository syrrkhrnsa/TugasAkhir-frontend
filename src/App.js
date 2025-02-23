import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth.js";
import Landing from "./pages/landing.js";
import Dashboard from "./pages/dashboard.js";
import Sertifikat from "./pages/sertifikat.js";
import Pemetaan from "./pages/pemetaan.js";
import FormSertifikat from "./form/f_sertifikat.js";
import ProtectedRoute from "./utils/ProtectedRoute"; // Import ProtectedRoute
import CreateTanah from "./form/c_tanah.js";
import EditTanah from "./form/e_tanah.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Grouping Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/sertifikat" element={<Sertifikat />} />
          <Route path="/pemetaan" element={<Pemetaan />} />
          <Route path="/sertifikat/form" element={<FormSertifikat />} />

          {/* Route Tanah */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tanah/create" element={<CreateTanah />} />
          <Route path="/tanah/edit/:id" element={<EditTanah />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
