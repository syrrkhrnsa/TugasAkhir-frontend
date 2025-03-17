import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth.js";
import Landing from "./pages/landing.js";
import Dashboard from "./pages/dashboard.js";
import Sertifikat from "./pages/sertifikat.js";
import Pemetaan from "./pages/pemetaan.js";
import ProtectedRoute from "./utils/ProtectedRoute";
import CreateTanah from "./form/c_tanah.js";
import EditTanah from "./form/e_tanah.js";
import RiwayatTanah from "./log/log_tanah.js";
import PesanPerubahan from "./pages/approval.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Grouping Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/pemetaan" element={<Pemetaan />} />
          <Route path="/sertifikat" element={<Sertifikat />} />

          {/* Route Tanah */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tanah/create" element={<CreateTanah />} />
          <Route path="/tanah/edit/:id" element={<EditTanah />} />

          {/* Log Tanah*/}
          <Route path="/riwayat/tanah" element={<RiwayatTanah />} />

          {/* Pesan Perubahan*/}
          <Route path="/notifikasi" element={<PesanPerubahan />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
